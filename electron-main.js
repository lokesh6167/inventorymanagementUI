const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const isDev = require('electron-is-dev');
const fs = require('fs');

let mainWindow;
let backendProcess;

// Function to check if backend is running
const checkBackendHealth = async () => {
  try {
    const response = await fetch('http://localhost:8080/inventarymanagement/testServer');
    return response.ok;
  } catch (error) {
    return false;
  }
};

// Function to start Spring Boot backend
const startBackend = () => {
  return new Promise((resolve, reject) => {
    try {
      const jarPath = path.join(__dirname, isDev ? '../inventarymanagementsystemlatest/target' : './resources/app.jar');
      
      // For development, look for JAR in target directory
      // For production, JAR should be bundled
      let jar = isDev 
        ? path.join(__dirname, '../../inventarymanagementsystemlatest/target/inventarymanagementsystemlatest-0.0.1-SNAPSHOT.jar')
        : path.join(__dirname, 'app.jar');
      
      // Check if JAR exists
      if (!fs.existsSync(jar)) {
        console.warn('Backend JAR not found at:', jar);
        resolve(); // Continue anyway, user might have backend running separately
        return;
      }

      console.log('Starting backend from:', jar);
      backendProcess = spawn('java', ['-jar', jar], {
        detached: false,
        stdio: 'pipe'
      });

      backendProcess.stdout.on('data', (data) => {
        console.log(`[Backend]: ${data}`);
        if (data.toString().includes('Started') || data.toString().includes('Tomcat started')) {
          resolve();
        }
      });

      backendProcess.stderr.on('data', (data) => {
        console.error(`[Backend Error]: ${data}`);
      });

      backendProcess.on('error', (err) => {
        console.error('Failed to start backend:', err);
        resolve(); // Continue anyway
      });

      // Timeout after 15 seconds
      setTimeout(() => resolve(), 15000);
    } catch (error) {
      console.error('Error starting backend:', error);
      resolve(); // Continue anyway
    }
  });
};

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'electron-preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  const startUrl = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../build/index.html')}`;

  mainWindow.loadURL(startUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

app.on('ready', async () => {
  console.log('App starting...');
  
  // Start backend before showing window
  await startBackend();
  
  // Wait a bit for backend to initialize
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  createWindow();
});

app.on('window-all-closed', () => {
  // Kill backend process on app exit
  if (backendProcess) {
    backendProcess.kill();
  }
  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// IPC handlers for frontend communication
ipcMain.handle('check-backend', async () => {
  return await checkBackendHealth();
});

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});
