
// @flow

import type { Action } from '../actions';
import ServerRecord from '../records/server';

import Immutable from 'immutable';
import ReduceStore from 'flux/lib/FluxReduceStore';
import dispatcher from '../dispatcher';



// Note: Since we don't care about order, we may be better off just using MapStore
// instead of wrapping a Map within a ReduceStore,
// Though using Reduce Store does make it look more like Elm...

type State = Immutable.Map<string, ServerRecord>;



class ServerStore extends ReduceStore<string, ServerRecord> {
	getInitialState() :State {
		return Immutable.Map();
	}

	reduce( state :State, action :Action ) :State {
		switch( action.type ) {
			case 'mcpanel/add-server':
				return state.set( action.server.id, action.server );

			case 'mcpanel/remove-server':
				return state.delete( action.serverId );

			case 'mcpanel/update-server':
				return state.set( action.server.id, action.server );

			case 'mcpanel/add-server-entries':
				return state.merge( action.serverEntries );

			default:
				return state;
		}
	}
}



const instance = new ServerStore( dispatcher );
export default instance;
