
// @flow weak

import type { Action } from '../actions';
import ServerInfoRecord from '../records/server-info';
import ConsoleCommandRecord from '../records/console-command';
import ServerPlayerRecord from '../records/server-player';

import Immutable from 'immutable';
import ReduceStore from 'flux/lib/FluxReduceStore';
import dispatcher from '../dispatcher';



type State = Immutable.Map<string, ServerInfoRecord>;



class ServerInfoStore extends ReduceStore<string, ServerInfoRecord> {
	getInitialState() :State {
		return Immutable.Map();
	}

	// TODO: Determine if Immutable can revivify Immutable.* objects that have been passed through IPC.
	reduce( state :State, action :Action ) :State {
		switch( action.type ) {
			case 'mcpanel/remove-server': {
				return state.delete( action.serverId );
			}

			case 'mcpanel/start-polling-api': {
				return state.set(
					action.serverId,
					new ServerInfoRecord()
				);
			}

			case 'mcpanel/stop-polling-api': {
				return state.delete( action.serverId );
			}

			case 'chapi/update-log': {
				// return state.set(
				// 	action.serverId,
				// 	state.get( action.serverId ).set( 'log', Immutable.List( action.log ) )
				// );

				return state.setIn(
					[ action.serverId, 'log' ],
					Immutable.List( action.log )
				);
			}

			case 'chapi/update-players': {
				// return state.set(
				// 	action.serverId,
				// 	state.get( action.serverId ).set( 'players', Immutable.List( action.players ) )
				// );

				return state.setIn(
					[ action.serverId, 'players' ],
					Immutable.List( action.players.map( p =>
						new ServerPlayerRecord( action.serverId, p )
					))
				);
			}

			case 'mcpanel/send-console-command': {
				let serverInfo = state.get( action.serverId );

				if( ! serverInfo ) {
					let error = new Error( `ServerInfoStore received action trying to send command to inactive server ${ action.serverId }` );
					error.sentAction = action;
					console.error( error );

					return state;
				}

				// let consoleCommands = serverInfo.consoleCommands;
				let command = new ConsoleCommandRecord( action.serverId, action.command );

				return state.setIn(
					[ action.serverId, 'consoleCommands', command.id ],
					// consoleCommands.set( command.id, command )
					command
				);
			}

			case 'mcpanel/update-console-command-status': {
				let command = state.getId([ action.serverId, 'consoleCommands', action.commandId ]);

				if( ! serverInfo ) {
					let error = new Error( `ServerInfoStore received action trying to update status of non-existant/removed command ${ action.commandId } for server ${ action.serverId }` );
					error.sentAction = action;
					console.error( error );

					return state;
				}

				return state.setIn(
					[ action.serverId, 'consoleCommands', action.commandId, 'status' ],
					action.status
				);
			}

			case 'mcpanel/power-server': {
				console.log( `ServerInfoStore: STUB: Received action for 'mcpanel/power-server':`, JSON.stringify( action ) );

				return state;
			}

			default:
				return state;
		}
	}

	// This means conversions every time it's accessed, but that doesn't really matter because
	// has to be converted before being written to disk or passed through IPC anyawy.
	// May as well just do it right off.
	getStateAsJS() :any {
		return this.getState().toJS();
	}
}



const instance = new ServerInfoStore( dispatcher );
export default instance;
