const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const fs = require('fs');

let mainWindow;
let paths;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 800,
        webPreferences: { nodeIntegration: true },
    });

    mainWindow.loadFile('index.html');

    ipcMain.on('getPaths', event => {
        dialog
            .showOpenDialog(mainWindow, {
                buttonLabel: 'Select paths text file',
                defaultPath: app.getPath('desktop'),
            })
            .then(result => {
                paths = result.filePaths;
                event.reply('getPaths', result.filePaths);
            })
            .catch(err => {
                console.log(err);
            });
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (mainWindow === null) createWindow();
});
