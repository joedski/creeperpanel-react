
import EventEmitter from 'events';
import { inherits } from 'util';

import Immutable from 'immutable';

import FluxStoreGroup from 'flux/lib/FluxStoreGroup';

import electron, { BrowserWindow, ipcMain as ipc } from 'electron';

import { dispatch } from '../../dispatcher';
import ServerStore from '../../stores/server';

export default function ControlPanelController() {
	this.addStoreListeners();
	this.initWindow();
}

inherits( ControlPanelController, EventEmitter );

Object.assign( ControlPanelController, {
	getStores() {
		return [ ServerStore ];
	}
});

Object.assign( ControlPanelController.prototype, {
	addStoreListeners() {
		let stores = ControlPanelController.getStores();
		let changed = false;
		let setChanged = () => { changed = true; };

		this.storeSubscriptions = stores
			.map( store => store.addListener( setChanged ) )
			;

		let handleDispatchComplete = () => {
			if( changed ) {
				// We're not a component, so unlike in FluxContainer, we don't have
				// an internal state.  Rather, the State is computed every time
				// an update is being sent.
				// Maybe it's inefficient.  Not sure yet.
				// We also don't have to worry about including props, though.
				this.updateWindowState();
			}

			changed = false;
		};

		this.storeGroup = new FluxStoreGroup( stores, handleDispatchComplete );
	},

	removeStoreListeners() {
		this.storeGroup.release();
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
		return Immutable.Map({
			servers: ServerStore.getState()
		});
	},

	close() {
		this.removeStoreListeners();
		this.window = null;

		this.emit( 'closed' );
	}
});
