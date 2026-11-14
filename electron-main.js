const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const HEALTH_URL = 'http://127.0.0.1:8080/inventarymanagement/testServer';
const BACKEND_START_TIMEOUT_MS = 90000;
const HEALTH_CHECK_INTERVAL_MS = 1000;

let mainWindow;
let backendProcess;
let backendExited = false;
let backendFailure;
let shuttingDown = false;
let recentBackendOutput = '';

function getDatabaseDirectory() {
  const localAppData = process.env.LOCALAPPDATA || path.join(app.getPath('home'), 'AppData', 'Local');
  return path.join(localAppData, 'SEV Grandson Inventory', 'inventory_data');
}

function getBackendJarPath() {
  if (app.isPackaged) return path.join(process.resourcesPath, 'backend', 'app.jar');

  const packagedLayoutJar = path.join(__dirname, 'desktop-resources', 'backend', 'app.jar');
  if (fs.existsSync(packagedLayoutJar)) return packagedLayoutJar;

  // Convenience for local development; Windows installer builds always use the
  // fresh JAR produced by the Windows workflow at backend/app.jar.
  return path.join(__dirname, 'desktop-resources', 'inventarymanagementsystemlatest-0.0.1-SNAPSHOT.jar');
}

function appendBackendOutput(stream, data) {
  const text = data.toString();
  recentBackendOutput = `${recentBackendOutput}${text}`.slice(-8000);
  stream(`[backend] ${text.trim()}`);
}

function startBackend() {
  const jarPath = getBackendJarPath();
  const databaseDirectory = getDatabaseDirectory();
  const bundledJavaPath = path.join(process.resourcesPath, 'jre', 'bin', 'java.exe');
  const javaPath = app.isPackaged
    ? bundledJavaPath
    : (process.env.JAVA_HOME
      ? path.join(process.env.JAVA_HOME, 'bin', process.platform === 'win32' ? 'java.exe' : 'java')
      : 'java');

  if (!fs.existsSync(jarPath)) throw new Error(`Backend JAR not found: ${jarPath}`);
  if (app.isPackaged && !fs.existsSync(bundledJavaPath)) {
    throw new Error(`Bundled Windows Java runtime not found: ${bundledJavaPath}`);
  }

  fs.mkdirSync(databaseDirectory, { recursive: true });
  backendProcess = spawn(javaPath, ['-jar', jarPath], {
    cwd: app.isPackaged ? process.resourcesPath : __dirname,
    env: { ...process.env, INVENTORY_DB_DIR: databaseDirectory },
    windowsHide: true,
    stdio: ['ignore', 'pipe', 'pipe']
  });

  backendProcess.stdout.on('data', (data) => appendBackendOutput(console.log, data));
  backendProcess.stderr.on('data', (data) => appendBackendOutput(console.error, data));
  backendProcess.on('error', (error) => {
    backendFailure = `Could not launch the backend: ${error.message}`;
  });
  backendProcess.on('exit', (code, signal) => {
    backendExited = true;
    if (!shuttingDown) {
      backendFailure = `The backend stopped unexpectedly (exit code ${code ?? 'unknown'}, signal ${signal ?? 'none'}).`;
      if (mainWindow && !mainWindow.isDestroyed()) {
        dialog.showErrorBox('Inventory backend stopped', `${backendFailure}\n\n${recentBackendOutput}`);
        app.quit();
      }
    }
  });
}

function backendErrorDetails() {
  return `${backendFailure || 'The backend process exited before it became ready.'}${recentBackendOutput ? `\n\nRecent backend output:\n${recentBackendOutput}` : ''}`;
}

async function waitForBackend() {
  const deadline = Date.now() + BACKEND_START_TIMEOUT_MS;
  let lastError;

  while (Date.now() < deadline) {
    if (backendFailure || backendExited) throw new Error(backendErrorDetails());

    try {
      const response = await fetch(HEALTH_URL, { signal: AbortSignal.timeout(2500) });
      if (response.ok) return;
      lastError = new Error(`Health endpoint returned HTTP ${response.status}: ${HEALTH_URL}`);
    } catch (error) {
      lastError = error;
    }

    await new Promise((resolve) => setTimeout(resolve, HEALTH_CHECK_INTERVAL_MS));
  }

  throw new Error(`Backend did not become ready within ${BACKEND_START_TIMEOUT_MS / 1000} seconds. ${lastError ? lastError.message : ''}${recentBackendOutput ? `\n\nRecent backend output:\n${recentBackendOutput}` : ''}`);
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

  const indexPath = path.join(app.getAppPath(), 'build', 'index.html');
  mainWindow.loadFile(indexPath).catch((error) => {
    dialog.showErrorBox('Unable to open Inventory', `${error.message}\n\nExpected app page: ${indexPath}`);
    app.quit();
  });
  mainWindow.once('ready-to-show', () => mainWindow.show());
  mainWindow.on('closed', () => { mainWindow = null; });
}

function stopBackend() {
  shuttingDown = true;
  if (backendProcess && !backendExited) backendProcess.kill();
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
  if (mainWindow === null && backendProcess && !backendExited) createWindow();
});
