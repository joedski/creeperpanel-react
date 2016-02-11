'use strict';

import electron from 'electron';
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

// const PanelController = require( './section/panel/controller' );
import PanelController from './section/panel/controller';



let panelController = null;

function createInitialPanel() {
	panelController = new PanelController();

	panelController.on( 'closed', function handlePanelControllerClosed() {
		panelController = null;
	});
}

app.on( 'ready', () => {
	createInitialPanel();
});

app.on( 'window-all-closed', () => {
	if( process.platform !== 'darwin' ) {
		app.quit();
	}
});

app.on( 'activate', () => {
	if( ! panelController ) {
		createInitialPanel();
	}
});



// let mainWindow;

// function createWindow() {
// 	mainWindow = new BrowserWindow({ width: 800, height: 600 });
// 	mainWindow.loadURL( `file://${ __dirname }/view/panel/index.html` );

// 	mainWindow.webContents.openDevTools();

// 	mainWindow.on( 'closed', () => {
// 		mainWindow = null;
// 	});
// }

// app.on( 'ready', createWindow );

// app.on( 'window-all-closed', () => {
// 	if( process.platform !== 'darwin' ) {
// 		app.quit();
// 	}
// });

// app.on( 'activate', () => {
// 	// On OS X, recreate main window if it's closed and the user then clicks on the dock icon.
// 	if( ! mainWindow ) {
// 		createWindow();
// 	}
// });
