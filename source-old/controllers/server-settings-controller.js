// Supersedes source/node_modules/app-settings

import EventEmitter from 'events';
import { inherits } from 'util';

import Immutable from 'immutable';

import FluxStoreGroup from 'flux/lib/FluxStoreGroup';

import ObjectController from '../base/object-controller';
import { dispatch } from '../dispatcher';
import ServerStore from '../stores/server';
import preferencesFile from '../preferences/file';

export default function ServerSettingsController() {
	// EventEmitter.call( this );
	// this.addStoreListeners();
	ObjectController.call( this );
}

// inherits( ServerSettingsController, EventEmitter );

Object.assign( ServerSettingsController, {
	getStores() {
		return [ ServerStore ];
	},

	getSettingsFile() {
		return 'servers.json';
	}
});

Object.assign( ServerSettingsController.prototype, ObjectController.prototype, {
	handleStateChanged() {
		this.writeSettings();
	},

	computeState() {
		return ServerStore.getStateAsJS();
	},

	readSettings( next ) {
		preferencesFile.read( ServerSettingsController.getSettingsFile(), ( serversString ) => {
			let serversState;

			if( serversString ) {
				serversState = JSON.parse( serversString );
			}
			else {
				serversState = {};
			}

			dispatch({
				type: 'mcpanel/add-server-entries',
				serverEntries: serversState
			});
		}, next );
	},

	writeSettings( next ) {
		let serversString = JSON.stringify( this.computeState(), null, 2 );
		preferencesFile.write( ServerSettingsController.getSettingsFile(), serversString, next );
	},
});
