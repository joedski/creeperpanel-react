'use strict';

import electron from 'electron';
const app = electron.app;

import PanelController from './view/control-panel/controller';



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
