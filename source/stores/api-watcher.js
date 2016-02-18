
// @flow

import type { Action } from '../actions';

import Immutable from 'immutable';
import ReduceStore from 'flux/lib/FluxReduceStore';
import dispatcher from '../dispatcher';



// type State = Immutable.Map<string, any>;
type State = Immutable.Set<string>;



class APIWatcherStore extends ReduceStore<string> {
	getInitialState() :State {
		// return Immutable.Map();
		return Immutable.Set();
	}

	// TODO: Determine if Immutable can revivify Immutable.* objects that have been passed through IPC.
	reduce( state :State, action :Action ) :State {
		switch( action.type ) {
			case 'mcpanel/remove-server': {
				return state.delete( action.serverId );
			}

			case 'mcpanel/start-polling-api': {
				return state.add( action.serverId );
			}

			case 'mcpanel/stop-polling-api': {
				return state.delete( action.serverId );
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



const instance = new APIWatcherStore( dispatcher );
export default instance;
