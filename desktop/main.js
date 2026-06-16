const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;

// 启动 Docker 容器
function startDocker() {
  return new Promise((resolve, reject) => {
    console.log('启动 Docker 容器...');
    
    // Check if docker is running first
    const check = spawn('docker', ['info']);
    check.on('close', (code) => {
        if (code !== 0) {
            console.error('Docker 未运行');
            // We proceed anyway, assuming start.sh might have handled it or user will start it
        }
    });

    const docker = spawn('docker', ['compose', 'up', '-d'], {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit'
    });

    docker.on('close', (code) => {
      if (code === 0) {
        console.log('Docker 容器启动成功');
        setTimeout(resolve, 5000); // Give it a moment
      } else {
        console.error(`Docker 启动可能失败, 退出码: ${code}`);
        resolve(); // Try to resolve anyway
      }
    });

    docker.on('error', (err) => {
        console.error('Docker 启动出错:', err);
        resolve();
    });
  });
}

// 停止 Docker 容器
function stopDocker() {
  console.log('停止 Docker 容器...');
  spawn('docker', ['compose', 'down'], {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit'
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 850,
    minWidth: 1000,
    minHeight: 600,
    titleBarStyle: 'hiddenInset', // macOS Traffic lights inset
    trafficLightPosition: { x: 12, y: 12 }, // Tweaked position
    backgroundColor: '#0a0a14', // Match new dark theme
    vibrancy: 'fullscreen-ui', // macOS blurred background effect
    backgroundMaterial: 'acrylic', // Windows effect
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    show: false
  });

  mainWindow.loadURL('http://localhost:3007');

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  try {
    await startDocker();
    createWindow();
  } catch (error) {
    console.error('启动失败:', error);
    app.quit();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    stopDocker();
    app.quit();
  }
});

app.on('before-quit', () => {
  stopDocker();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
