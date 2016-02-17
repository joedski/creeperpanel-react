
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

	// TODO: Determine if Immutable can revivify Immutable.* objects that have been passed through IPC.
	reduce( state :State, action :Action ) :State {
		switch( action.type ) {
			case 'mcpanel/add-server': {
				// server is probably passed without an id field since it's adding a new one.
				// using the let ensures we have an id.
				let server = new ServerRecord( action.server );
				return state.set( server.id, server );
			}

			case 'mcpanel/remove-server':
				return state.delete( action.serverId );

			case 'mcpanel/update-server': {
				let server = new ServerRecord( action.server );
				return state.set( server.id, server );
			}

			case 'mcpanel/add-server-entries':
				// return state.merge( action.serverEntries );
				return state.merge(
					Immutable.Map( action.serverEntries )
						.map( ( serverFields ) => new ServerRecord( serverFields ) )
				);

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
