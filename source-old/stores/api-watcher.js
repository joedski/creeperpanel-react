
// @flow weak

import type { Action } from '../actions';

import Immutable from 'immutable';
import ReduceStore from 'flux/lib/FluxReduceStore';
import dispatcher from '../dispatcher';
import APIWatchRecord from '../records/api-watch';



type State = Immutable.Map<string, APIWatchRecord>;



class APIWatcherStore extends ReduceStore<State> {
	getInitialState() :State {
		// return Immutable.Map();
		return Immutable.Map();
	}

	// TODO: Determine if Immutable can revivify Immutable.* objects that have been passed through IPC.
	reduce( state :State, action :Action ) :State {
		switch( action.type ) {
			case 'mcpanel/remove-server': {
				return state.delete( action.serverId );
			}

			case 'mcpanel/start-polling-api': {
				let watch = state.get( action.serverId ) || new APIWatchRecord();
				watch = watch.set(
					'activeWatches',
					watch.get( 'activeWatches' ) + 1
				);
				return state.set( action.serverId, watch );
			}

			case 'mcpanel/stop-polling-api': {
				let watch = state.get( action.serverId );

				if( watch ) {
					watch = watch.set(
						'activeWatches',
						watch.get( 'activeWatches' ) - 1
					);

					if( watch.get( 'activeWatches' ) <= 0 ) {
						watch = null;
					}
				}

				if( watch ) {
					return state.set( action.serverId, watch );
				}
				else {
					return state.delete( action.serverId );
				}
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
