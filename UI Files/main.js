const { app, BrowserWindow, dialog, ipcMain } = require('electron');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 800,
        webPreferences: { nodeIntegration: true },
    });

    mainWindow.loadFile('index.html');

    ipcMain.on('openImageFolderWindow', event => {
        dialog
            .showOpenDialog(mainWindow, {
                buttonLabel: 'Select images folder',
                defaultPath: app.getPath('desktop'),
                properties: ['openDirectory'],
            })
            .then(result => {
                event.reply('imageFolderPath', result.filePaths);
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
                event.reply('textFolderPath', result.filePaths);
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
                event.reply('userOutputTextFolderPath', result.filePaths);
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
