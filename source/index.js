'use strict';

import electron from 'electron';
const app = electron.app;

import SettingsGroup from './controllers/settings-group';
import ServerSettingsController from './controllers/server-settings-controller';
import APIWatcherController from './controllers/api-watcher-controller';
import PanelController from './view/control-panel/controller';



let settingsGroup = null;
let panelController = null;
let apiWatcherController = null;

function createInitialPanel() {
	panelController = new PanelController();

	panelController.on( 'closed', function handlePanelControllerClosed() {
		panelController = null;
	});
}

app.on( 'ready', () => {
	settingsGroup = new SettingsGroup([
		ServerSettingsController
	]);

	apiWatcherController = new APIWatcherController();

	settingsGroup.read( ( error ) => {
		if( error ) {
			console.error( `Error trying to read settings files:` );
			console.error( error );
			return;
		}

		console.log( `Successfully read all settings.` );
		return;
	});

	createInitialPanel();
});

app.on( 'window-all-closed', () => {
	if( process.platform !== 'darwin' ) {
		// TODO: Write preferences before the app terminates?
		app.quit();
	}
});

app.on( 'activate', () => {
	if( ! panelController ) {
		createInitialPanel();
	}
});
