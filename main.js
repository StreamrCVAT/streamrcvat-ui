// Modules
const { app, BrowserWindow, dialog, ipcMain } = require('electron');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

// Create a new BrowserWindow when `app` is ready
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 800,
        webPreferences: { nodeIntegration: true },
    });

    // Load index.html into the new BrowserWindow
    mainWindow.loadFile('index.html');

    // Open DevTools - Remove for PRODUCTION!
    mainWindow.webContents.openDevTools();

    ipcMain.on('openImageFolderWindow', event => {
        dialog
            .showOpenDialog(mainWindow, {
                buttonLabel: 'Select images folder',
                defaultPath: app.getPath('desktop'),
                properties: ['openDirectory'],
            })
            .then(result => {
                // event.reply('imageFolderPath', result.filePaths);
                event.reply('imageFolderPath', [
                    'C:\\Users\\Suriya\\Desktop\\Annotaion Tool UI\\Dataset\\video_trim (frames)',
                ]);
            })
            .catch(err => {
                console.log(err);
            });
    });

    ipcMain.on('openTextFolderWindow', event => {
        dialog
            .showOpenDialog(mainWindow, {
                buttonLabel: 'Select texts folder',
                defaultPath: app.getPath('desktop'),
                properties: ['openDirectory'],
            })
            .then(result => {
                // event.reply('textFolderPath', result.filePaths);
                event.reply('textFolderPath', [
                    'C:\\Users\\Suriya\\Desktop\\Annotaion Tool UI\\Dataset\\annotated frames coor (1 to 499)',
                ]);
            })
            .catch(err => {
                console.log(err);
            });
    });

    ipcMain.on('openUserOutputTextFolderWindow', event => {
        dialog
            .showOpenDialog(mainWindow, {
                buttonLabel: 'Select user output texts folder',
                defaultPath: app.getPath('desktop'),
                properties: ['openDirectory'],
            })
            .then(result => {
                // event.reply('textFolderPath', result.filePaths);
                event.reply('userOutputTextFolderPath', [
                    'C:\\Users\\Suriya\\Desktop\\Annotaion Tool UI\\Dataset\\user_output',
                ]);
            })
            .catch(err => {
                console.log(err);
            });
    });

    // Listen for window being closed
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// Electron `app` is ready
app.on('ready', createWindow);

// Quit when all windows are closed - (Not macOS - Darwin)
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

// When app icon is clicked and app is running, (macOS) recreate the BrowserWindow
app.on('activate', () => {
    if (mainWindow === null) createWindow();
});
