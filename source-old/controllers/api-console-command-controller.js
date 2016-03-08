// @flow weak

// import EventEmitter from 'events';
// import { inherits } from 'util';

import Immutable from 'immutable';

import FluxStoreGroup from 'flux/lib/FluxStoreGroup';

import ObjectController from '../base/object-controller';

import { dispatch } from '../dispatcher';
import ServerStore from '../stores/server';
import ServerInfoStore from '../stores/server-info';
// import APIWatcherStore from '../stores/api-watcher';

import ServerInfoAPI from 'server-info-api';



export default function APIConsoleCommandController() {
	this.consoleCommands = Immutable.Map();
	this.state = Immutable.List();
	ObjectController.call( this );
}

Object.assign( APIConsoleCommandController, {
	getStores() {
		return [ ServerInfoStore ];
	}
});

Object.assign( APIConsoleCommandController.prototype, ObjectController.prototype, {
	handleStateChanged() {
		this.reconcileCommands();
	},

	////////

	reconcileCommands() {
		let newState = ServerStore.getState().get( 'consoleCommands' );
		let newStateSet = newState.toOrderedSet();
		let oldStateSet = this.state.toOrderedSet();

		let commandsToAdd = newStateSet.subtract( oldStateSet );
		let commandsToRemove = oldStateSet.subtract( newStateSet );

		commandsToRemove.forEach( command => this.removeCommand( command ) );
		commandsToAdd.forEach( command => this.addCommand( command ) );

		this.state = newState;
	},

	addCommand( command ) {
		if( this.consoleCommands.has( command ) ) return;

		let commandSender = new CommandSender( command );
		commandSender.send();
		this.consoleCommands = this.consoleCommands.set( command.id, commandSender );
	},

	removeCommand( command ) {
		if( ! this.consoleCommands.has( command ) ) return;

		let commandSender = this.consoleCommands.get( command.id );
		// commandSender.close();
		commandSender.release();
		this.consoleCommands = this.consoleCommands.delete( command.id );
	},
});



function CommandSender( consoleCommand ) {
	this.consoleCommand = consoleCommand;

	// this.addStoreListeners();
	this.resetAPI();

	ObjectController.call( this );
}

Object.assign( CommandSender, {
	getStores() {
		return [ ServerStore ];
	}
});

Object.assign( CommandSender.prototype, ObjectController.prototype, {
	handleStateChanged() {
		this.resetAPI();
	},

	resetAPI() {
		this.server = ServerStore.getState().get( this.consoleCommand.serverId );
		this.api = new ServerInfoAPI({
			credentials: { key: this.server.key, secret: this.server.secret }
		});
	},

	send() {
		return this.dispatchUpdateStatus( 'sent' );

		this.api.consoleWrite( ( error, result ) => {
			if( error ) {
				return this.dispatchUpdateStatus( 'errored' );
			}

			return this.dispatchUpdateStatus( 'completed' );
		})
	},

	dispatchUpdateStatus( status ) {
		return dispatch({
			type: 'mcpanel/update-console-command-status',
			serverId: this.consoleCommand.serverId,
			commandId: this.consoleCommand.id,
			status: status
		});
	}
});
