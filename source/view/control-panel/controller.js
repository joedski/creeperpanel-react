
import EventEmitter from 'events';
import { inherits } from 'util';

import Immutable from 'immutable';

import FluxStoreGroup from 'flux/lib/FluxStoreGroup';

import electron, { BrowserWindow, ipcMain as ipc } from 'electron';

import { dispatch } from '../../dispatcher';
import ServerStore from '../../stores/server';

export default function ControlPanelController() {
	EventEmitter.call( this );
	this.addStoreListeners();
	this.initWindow();
}

// TODO: Move most of the code to another module.  Basically the only things that really matter here are Controller.getStores() and Controller#computeState().

inherits( ControlPanelController, EventEmitter );

Object.assign( ControlPanelController, {
	getStores() {
		return [ ServerStore ];
	}
});

Object.assign( ControlPanelController.prototype, {
	//////// Init

	addStoreListeners() {
		let stores = ControlPanelController.getStores();
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

	initWindow() {
		this.window = new BrowserWindow({ width: 1024 });

		this.window.loadURL( `file://${ __dirname }/view.html` );

		this.window.on( 'closed', () => {
			this.close();
		});

		this._handleUIReady = ( event ) => {
			if( this.eventFromOwnWindow( event ) ) return;
			ipc.removeListener( 'ui-ready', this._handleUIReady );
			console.log( `Recieved ui-ready from our window.` );
			this.updateWindowState();
		};

		this._handleAction = ( event, action ) => {
			if( this.eventFromOwnWindow( event ) ) return;
			this.handleAction( event, action );
		};

		ipc.on( 'ui-ready', this._handleUIReady );
		ipc.on( 'action', this._handleAction );
	},

	//////// Events

	handleStateChanged() {
		// We're not a component, so unlike in FluxContainer, we don't have
		// an internal state.  Rather, the State is computed every time
		// an update is being sent.
		// Maybe it's inefficient.  Not sure yet.
		// We also don't have to worry about including props, though.
		this.updateWindowState();
	},

	eventFromOwnWindow( event ) {
		return event.sender != this.window.webContents;
	},

	updateWindowState() {
		this.window.send( 'state-update', this.computeState() );
	},

	handleAction( event, action ) {
		dispatch( action );
	},

	computeState() {
		// Pull data from each Store and synthesize into single object.
		// Don't actually store state here because we don't need to.
		// Note that IPC can only pass plain JS types.
		// This is fine since data is treated as read-only at the view.

		let computed = {
			servers: ServerStore.getStateAsJS()
		};

		return computed;
	},

	//////// Cleanup.

	close() {
		this.removeStoreListeners();
		this.removeWindow();

		this.emit( 'closed' );
	},

	removeWindow() {
		ipc.removeListener( 'ui-ready', this._handleUIReady );
		ipc.removeListener( 'action', this._handleAction );

		this.window = null;
	},

	removeStoreListeners() {
		this.storeGroup.release();
	},
});
