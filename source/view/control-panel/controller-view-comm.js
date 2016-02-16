import EventEmitter from 'events';
import { inherits } from 'util';

import { ipcRenderer as ipc } from 'electron';

function ControllerViewComm() {
	// A different event is fired the very first time,
	// and should be used to handle initializing the view.
	// Note that this laziness may result in
	// views which are momentarily blank.  (well, for longer than usual.)
	this.handleStateUpdate = ( event, state ) => {
		let initial = ! this.state;

		this.state = state;

		if( initial ) {
			this.emit( 'state-update:initial', state );
		}
		else {
			this.emit( 'state-update', state );
		}
	};

	ipc.on( 'state-update', this.handleStateUpdate );
}

inherits( ControllerViewComm, EventEmitter );

Object.assign( ControllerViewComm.prototype, {
	state: null,

	sendAction( action ) {
		ipc.send( 'action', action );
	},

	sendReady() {
		console.log( 'Comm: sending ui-ready' );
		ipc.send( 'ui-ready' );
	}
});

const instance = new ControllerViewComm();

export default instance;

// Convenience.
export const sendAction = instance.sendAction.bind( instance );
