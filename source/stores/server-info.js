
// @flow

import type { Action } from '../actions';
import ServerInfoRecord from '../records/server-info';

import Immutable from 'immutable';
import ReduceStore from 'flux/lib/FluxReduceStore';
import dispatcher from '../dispatcher';



type State = Immutable.Map<string, ServerInfoRecord>;



class ServerStore extends ReduceStore<string, ServerInfoRecord> {
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
				return state.set(
					action.serverId,
					state.get( action.serverId ).set( 'log', Immutable.List( action.log ) )
				);
			}

			case 'chapi/update-players': {
				return state.set(
					action.serverId,
					state.get( action.serverId ).set( 'players', Immutable.List( action.players ) )
				);
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



const instance = new ServerStore( dispatcher );
export default instance;
