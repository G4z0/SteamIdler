const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

let win;

function createWindow() {
    win = new BrowserWindow({
        width: 600,
        height: 500,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    const startURL = `file://${path.join(__dirname, 'index.html')}`;
    win.loadURL(startURL);

    win.on('closed', () => {
        win = null;
    });
}

let client;

ipcMain.on('start-idling', (event, { username, password, gameId }) => {

    const SteamUser = require('steam-user');
    client = new SteamUser();

    client.logOn({
        accountName: username,
        password: password
    });

    client.on('loggedOn', () => {
        client.setPersona(SteamUser.EPersonaState.Online);
        client.gamesPlayed([parseInt(gameId, 10)]);
    });

    client.on('error', (error) => {
        console.error('An error occurred:', error);
    });
});

ipcMain.on('stop-idling', () => {
    if(client) {
        client.logOff();
    }
});

app.on('ready', createWindow);
