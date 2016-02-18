// 

import EventEmitter from 'events';
import { inherits } from 'util';

import Immutable from 'immutable';

import FluxStoreGroup from 'flux/lib/FluxStoreGroup';

import ObjectController from '../base/object-controller';
import { dispatch } from '../dispatcher';
import ServerStore from '../stores/server';
import ServerInfoStore from '../stores/server-info';
import APIWatcherStore from '../stores/api-watcher';

import ServerInfoAPI from 'server-info-api';

// import EventEmitter from 'events';
// import { inherits } from 'util';
import Tick from 'tick-tock';



export default function APIWatcherController() {
	// EventEmitter.call( this );

	this.state = Immutable.Set();
	this.apiWatchers = Immutable.Map();

	// this.addStoreListeners();
	ObjectController.call( this );
}

// inherits( APIWatcherController, EventEmitter );

Object.assign( APIWatcherController, {
	getStores() {
		return [ ServerInfoStore, APIWatcherStore ];
	}
});

Object.assign( APIWatcherController.prototype, ObjectController.prototype, {
	// Immutable.Set<string>
	state: null,

	handleStateChanged() {
		this.reconcileWatchers();
		// TODO: Check for onlineness... (AppEnvironmentStore? or something like that?)
		// this.reconcileOnlineness();
	},

	////////

	reconcileWatchers() {
		let newWatchers = Immutable.Set( APIWatcherStore.getState().keys() );
		let oldWatchers = this.state;

		let watchersToAdd = newWatchers.subtract( oldWatchers );
		let watchersToRemove = oldWatchers.subtract( newWatchers );

		watchersToRemove.forEach( serverId => this.removeWatcher( serverId ) );
		watchersToAdd.forEach( serverId => this.addWatcher( serverId ) );

		this.state = newWatchers;
	},

	removeWatcher( serverId ) {
		if( ! this.apiWatchers.has( serverId ) ) return;

		let watcher = this.apiWatchers.get( serverId );
		watcher.release();
		this.apiWatchers = this.apiWatchers.delete( serverId );
	},

	addWatcher( serverId ) {
		if( this.apiWatchers.has( serverId ) ) return;

		let watcher = new APIWatcher( serverId );
		// TODO: Check somewhere (AppEnvironmentStore?) whether or not we're online.
		watcher.online();
		this.apiWatchers = this.apiWatchers.set( serverId, watcher );
	},
});



function APIWatcher( serverId ) {
	this.serverId = serverId;
	// this.server = ServerStore.getState().get( serverId );

	this.tick = new Tick();

	// this.addStoreListeners();
	this.resetAPI();

	ObjectController.call( this );
}

Object.assign( APIWatcher, {
	getStores() {
		return [ ServerStore ];
	}
});

Object.assign( APIWatcher.prototype, ObjectController.prototype, {
	handleStateChanged() {
		this.resetAPI();
	},

	////////

	resetAPI() {
		this.server = ServerStore.getState().get( this.serverId );
		this.api = new ServerInfoAPI({
			credentials: { key: this.server.key, secret: this.server.secret }
		});
	},

	online() {
		this.running = true;

		this.setRepeatingTimeout( 'consoleRead', '2 seconds', () => {
			this.api.consoleRead( ( error, result ) => {
				// console.log( 'APIWatcher:consoleRead:', error ? 'error' : 'success' );
				// console.log( error || JSON.stringify( result ) );

				if( result )
				dispatch({
					type: 'chapi/update-log',
					serverId: this.serverId,
					// TODO: Parse log...
					log: result.log.split( '\n' )
				});
			});
		});

		this.setRepeatingTimeout( 'playersList', '5 seconds', () => {
			this.api.playersList( ( error, result ) => {
				// console.log( 'APIWatcher:playersList:', error ? 'error' : 'success' );
				// console.log( error || JSON.stringify( result ) );

				if( result )
				dispatch({
					type: 'chapi/update-players',
					serverId: this.serverId,
					players: result.players
				});
			});
		});
	},

	offline() {
		this.running = false;

		this.tick.clear();
	},

	setRepeatingTimeout( name, timeout, callback ) {
		let timeoutedCallback = () => {
			callback();
			this.tick.clear( name );
			this.tick.setTimeout( name, timeoutedCallback, timeout );
		};

		timeoutedCallback();
	}
});
