'use strict';

import electron from 'electron';
const app = electron.app;

import SettingsGroup from './auto/settings-group';
import ServerSettingsController from './auto/server-settings-controller';
import PanelController from './view/control-panel/controller';



let settingsGroup = null;
let panelController = null;

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
