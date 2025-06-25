const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false
    },
    icon: path.join(__dirname, 'icon.png')
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  
  // Открыть DevTools в режиме разработки
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Обработчик для загрузки WhatsApp Web
ipcMain.handle('load-whatsapp', async () => {
  const whatsappWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false
    },
    parent: mainWindow
  });

  // Устанавливаем современный User-Agent
  const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';
  
  await whatsappWindow.loadURL('https://web.whatsapp.com/', {
    userAgent: userAgent
  });

  return whatsappWindow.id;
});

// Обработчик для внедрения скрипта
ipcMain.handle('inject-script', async (event, windowId) => {
  const window = BrowserWindow.fromId(windowId);
  if (!window) return false;

  try {
    const scriptPath = path.join(__dirname, 'script.js');
    const scriptContent = fs.readFileSync(scriptPath, 'utf8');
    
    await window.webContents.executeJavaScript(scriptContent);
    return true;
  } catch (error) {
    console.error('Ошибка внедрения скрипта:', error);
    return false;
  }
});

// Обработчик для экспорта CSV
ipcMain.handle('export-csv', async (event, data, filename) => {
  try {
    const { filePath } = await dialog.showSaveDialog(mainWindow, {
      defaultPath: filename,
      filters: [
        { name: 'CSV Files', extensions: ['csv'] }
      ]
    });

    if (filePath) {
      fs.writeFileSync(filePath, data, 'utf8');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Ошибка экспорта:', error);
    return false;
  }
});
