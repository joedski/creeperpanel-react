// Supersedes source/node_modules/app-settings

import EventEmitter from 'events';
import { inherits } from 'util';

import Immutable from 'immutable';

import FluxStoreGroup from 'flux/lib/FluxStoreGroup';

import electron, { BrowserWindow, ipcMain as ipc } from 'electron';

import { dispatch } from '../dispatcher';
import ServerStore from '../stores/server';
import preferencesFile from '../preferences/file';

export default function ServerSettings() {
	EventEmitter.call( this );
	this.addStoreListeners();
}

inherits( ServerSettings, EventEmitter );

Object.assign( ServerSettings, {
	getStores() {
		return [ ServerStore ];
	},

	getSettingsFile() {}
});

Object.assign( ServerSettings.prototype, {
	addStoreListeners() {
		let stores = ServerSettings.getStores();
		let changed = false;

		let setChanged = () => { changed = true; };

		this.storeSubscriptions = stores
			.map( store => store.addListener( setChanged ) )
			;

		let handleDispatchComplete = () => {
			if( changed ) {
				this.handleStateChanged();
			}

			changed = false;
		};

		this.storeGroup = new FluxStoreGroup( stores, handleDispatchComplete );
	},

	handleStateChanged() {
		this.writeSettings();
	},

	computeState() {
		return ServerStore.getState();
	},

	readSettings( next ) {
		preferencesFile.read( 'servers.json', ( serversString ) => {
			let serversState;

			if( serversString ) {
				serversState = Immutable.fromJS( JSON.parse( serversString ) );
			}
			else {
				serversState = Immutable.Map();
			}

			dispatch({
				type: 'mcpanel/add-server-entries',
				serverEntries: serversState
			});
		}, next );
	},

	writeSettings( next ) {
		let serversString = JSON.stringify( this.computeState().toJS(), null, 2 );
		preferencesFile.write( 'servers.json', serversString, next );
	},

	release() {
		this.storeGroup.release();
	}
});
