const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const HEALTH_URL = process.env.INVENTORY_HEALTH_URL || 'http://127.0.0.1:8080/inventarymanagement/testServer';
const BACKEND_START_TIMEOUT_MS = 90000;
const HEALTH_CHECK_INTERVAL_MS = 1000;

let mainWindow;
let backendProcess;
let shuttingDown = false;

function getBundledResource(...segments) {
  return app.isPackaged
    ? path.join(process.resourcesPath, ...segments)
    : path.join(__dirname, 'desktop-resources', ...segments);
}

function getDatabaseDirectory() {
  const localAppData = process.env.LOCALAPPDATA || path.join(app.getPath('home'), 'AppData', 'Local');
  return path.join(localAppData, 'SEV Grandson Inventory', 'inventory_data');
}

function startBackend() {
  const jarPath = getBundledResource('backend', 'app.jar');
  const developmentJarPath = path.join(__dirname, 'desktop-resources', 'inventarymanagementsystemlatest-0.0.1-SNAPSHOT.jar');
  const resolvedJarPath = app.isPackaged ? jarPath : (fs.existsSync(jarPath) ? jarPath : developmentJarPath);
  const bundledJavaPath = getBundledResource('jre', 'bin', process.platform === 'win32' ? 'java.exe' : 'java');
  const javaPath = fs.existsSync(bundledJavaPath) ? bundledJavaPath : 'java';
  const databaseDirectory = getDatabaseDirectory();

  if (!fs.existsSync(resolvedJarPath)) {
    throw new Error(`Backend JAR not found: ${resolvedJarPath}`);
  }
  if (app.isPackaged && !fs.existsSync(bundledJavaPath)) {
    throw new Error(`Bundled Java runtime not found: ${bundledJavaPath}`);
  }

  fs.mkdirSync(databaseDirectory, { recursive: true });
  backendProcess = spawn(javaPath, ['-jar', resolvedJarPath], {
    cwd: app.isPackaged ? process.resourcesPath : __dirname,
    env: { ...process.env, INVENTORY_DB_DIR: databaseDirectory },
    windowsHide: true,
    stdio: ['ignore', 'pipe', 'pipe']
  });

  backendProcess.stdout.on('data', (data) => console.log(`[backend] ${data.toString().trim()}`));
  backendProcess.stderr.on('data', (data) => console.error(`[backend] ${data.toString().trim()}`));
  backendProcess.on('error', (error) => console.error('[backend] process error:', error));
  backendProcess.on('exit', (code, signal) => {
    if (!shuttingDown && (code !== 0 || signal)) {
      console.error(`[backend] exited unexpectedly (code=${code}, signal=${signal})`);
    }
  });
}

async function waitForBackend() {
  const deadline = Date.now() + BACKEND_START_TIMEOUT_MS;
  let lastError;

  while (Date.now() < deadline) {
    if (!backendProcess || backendProcess.exitCode !== null) {
      throw new Error('The backend process exited before it became ready. Check the backend startup logs.');
    }

    try {
      const response = await fetch(HEALTH_URL, { signal: AbortSignal.timeout(2500) });
      if (response.ok) return;
      lastError = new Error(`Health endpoint returned HTTP ${response.status}: ${HEALTH_URL}`);
    } catch (error) {
      lastError = error;
    }

    await new Promise((resolve) => setTimeout(resolve, HEALTH_CHECK_INTERVAL_MS));
  }

  throw new Error(`Backend did not become ready within ${BACKEND_START_TIMEOUT_MS / 1000} seconds. ${lastError ? lastError.message : ''}`);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'electron-preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  const page = app.isPackaged
    ? mainWindow.loadFile(path.join(app.getAppPath(), 'build', 'index.html'))
    : mainWindow.loadURL('http://localhost:3000');

  page.catch((error) => {
    dialog.showErrorBox('Unable to open Inventory', error.message);
    app.quit();
  });
  mainWindow.once('ready-to-show', () => mainWindow.show());
  mainWindow.on('closed', () => { mainWindow = null; });
}

function stopBackend() {
  shuttingDown = true;
  if (backendProcess && backendProcess.exitCode === null) backendProcess.kill();
}

ipcMain.handle('check-backend', async () => {
  try {
    const response = await fetch(HEALTH_URL, { signal: AbortSignal.timeout(2500) });
    return response.ok;
  } catch {
    return false;
  }
});
ipcMain.handle('get-app-version', () => app.getVersion());

app.whenReady().then(async () => {
  try {
    startBackend();
    await waitForBackend();
    createWindow();
  } catch (error) {
    stopBackend();
    dialog.showErrorBox('Inventory could not start', `${error.message}\n\nDatabase folder: ${getDatabaseDirectory()}`);
    app.quit();
  }
});

app.on('before-quit', stopBackend);
app.on('window-all-closed', () => app.quit());
app.on('activate', () => {
  if (mainWindow === null && backendProcess && backendProcess.exitCode === null) createWindow();
});
