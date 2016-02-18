// 

import EventEmitter from 'events';
import { inherits } from 'util';

import Immutable from 'immutable';

import FluxStoreGroup from 'flux/lib/FluxStoreGroup';

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

	this.addStoreListeners();
}

// inherits( APIWatcherController, EventEmitter );

Object.assign( APIWatcherController, {
	getStores() {
		return [ ServerInfoStore, APIWatcherStore ];
	}
});

Object.assign( APIWatcherController.prototype, {
	addStoreListeners() {
		let stores = APIWatcherController.getStores();
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
		this.reconcileWatchers();
		// TODO: Check for onlineness... (AppEnvironmentStore? or something like that?)
		// this.reconcileOnlineness();
	},

	release() {
		this.storeGroup.release();
	},

	////////

	reconcileWatchers() {
		let newWatchers = APIWatcherStore.getState();
		let oldWatchers = this.state;

		let watchersToAdd = newWatchers.subtract( oldWatchers );
		let watchersToRemove = oldWatchers.subtract( newWatchers );

		watchersToRemove.forEach( serverId => this.removeWatcher( serverId ) );
		watchersToAdd.forEach( serverId => this.addWatcher( serverId ) );
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
		this.apiWatchers = this.apiWatchers.add( serverId, watcher );
	},
});



function APIWatcher( serverId ) {
	this.serverId = serverId;
	this.server = ServerStore.get( serverId );

	this.tick = new Tick();

	this.addStoreListeners();
	this.initWatchers();
}

Object.assign( APIWatcher, {
	getStores() {
		return [ ServerStore ];
	}
});

Object.assign( APIWatcher.prototype, {
	addStoreListeners() {
		let stores = APIWatcherController.getStores();
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
		this.resetAPI();
	},

	release() {
		this.tick.clear();
		this.storeGroup.release();
	},

	////////

	resetAPI() {
		this.server = ServerStore.get( this.serverId );
		this.api = new ServerInfoAPI({
			credentials: { key: this.server.key, secret: this.server.secret }
		});
	},

	online() {
		this.running = true;

		this.setRepeatingTimeout( 'consoleRead', '1 second', () => {
			this.api.consoleRead( ( error, result ) => {
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
				if( result )
				dispatch({
					type: 'chapi/update-players',
					serverId: this.serverId,
					// TODO: Figure out what each players object contains.
					log: result.players
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
			this.tick.setTimeout( name, timeoutedCallback, timeout );
		};

		timeoutedCallback();
	}
});
