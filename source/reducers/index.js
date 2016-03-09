// @flow weak

import { combineReducers } from 'redux';
import Immutable from 'immutable';
import uuid from 'uuid';
import * as actions from '../actions';
import * as status from '../status';



////////

type APIAccountId = string;



////////

const AppStateRecord = Immutable.Record({
	// TODO: Should we worry if we can't read/write from the config dir?
	'configLoadStatus': status.IDLE,
	'configLoadComplete': false,
	'configLoadError': null,
});

const PanelRecord = Immutable.Record({
	id: '',
	apiAccountId: ''
});

const APIAccountRecord = Immutable.Record({
	id: '',
	title: '',
	key: '',
	secret: '',
	// Support changing which instance a given api account is looking at?
	// instanceId: ''

	logStatus: status.IDLE,
	logError: null,
	playersStatus: status.IDLE,
	playersError: null,
	powerStatus: status.IDLE,
	powerAction: '',
	powerError: null,
});

const PlayerRecord = Immutable.Record({
	// This will probably end up being apiAccountId + name.
	id: '',
	apiAccountId: '',
	name: '',
	style: '',
	// Usually empty?
	minecraftId: '',
});

const LogRecord = Immutable.Record({
	apiAccountId: '',
	// List<LogEntryRecord>
	entries: Immutable.List()
});

const LogEntryRecord = Immutable.Record({
	// Convert to actual time?  Problem is we only have HH:MM:SS, no date.
	time: { hour: 0, minute: 0, second: 0 },
	source: '',
	severity: '',
	// Array<string>
	lines: []
});

const PendingCommandRecord = Immutable.Record({
	apiAccountId: '',
	status: status.IDLE,
	text: '',
	sent: null,
});



////////

// Getting things by server ID is done by selectors.

function app( state :AppStateRecord = new AppStateRecord(), action ) {
	switch( action.type ) {
		case actions.CONFIG_REQUEST: {
			return state.set( 'configLoadStatus', status.REQUESTED );
		}

		case actions.CONFIG_RESPONSE: {
			if( action.error ) {
				// TODO: Show error to user.
				return state
					.set( 'configLoadStatus', status.ERRORED )
					.set( 'configLoadError', action.payload )
					;
			}

			return state
				.set( 'configLoadStatus', status.IDLE )
				.set( 'configLoadComplete', true )
				;
		}

		default: return state;
	}
}

function panels( state :Immutable.List<PanelRecord> = Immutable.List(), action ) {
	switch( action.type ) {
		case actions.OPEN_PANEL: {
			// Just opening a panel doesn't select an apiAccountId.  User does that after.
			return state.push( new PanelRecord({ 'id': action.payload.panelId }) );
		}

		case actions.CLOSE_PANEL: {
			return state.filterNot( panel => (panel.get( 'id' ) == action.payload.panelId) );
		}

		case actions.PANEL_API_ACCOUNT_SELECT: {
			let index = state.findIndex( panel => panel.get( 'id' ) == action.payload.panelId );
			return state.setIn([ index, 'apiAccountId' ], action.payload.apiAccountId );
		}

		default: return state;
	}
}

function apiAccounts( state :Immutable.List<APIAccountRecord> = Immutable.List(), action ) {
	switch( action.type ) {
		case actions.CONFIG_REQUEST: {
			return state;
		}

		case actions.CONFIG_RESPONSE: {
			if( action.error ) {
				// TODO: Show error to user.
				return state;
			}

			return Immutable.List( action.payload.map(
					apiAccount => new APIAccountRecord( apiAccount )
				));
		}

		case actions.SERVER_LOG_REQUEST: {
			let index = state.findIndex( acc => acc.get( 'id' ) == action.payload.apiAccountId );
			return state.setIn([ index, 'logStatus' ], status.REQUESTED );
		}

		case actions.SERVER_LOG_RESPONSE: {
			let index = state.findIndex( acc => acc.get( 'id' ) == action.payload.apiAccountId );

			if( action.error ) {
				return state
					.setIn([ index, 'logStatus' ], status.ERRORED )
					.setIn([ index, 'logError' ], action.payload )
					;
			}

			// TODO: Should also clear error?  Or only clear error on a separate user action?
			// I think for now I'll just clear it.
			return state
				.setIn([ index, 'logStatus' ], status.IDLE )
				.setIn([ index, 'logError' ], null )
				;
		}

		default: return state;
	}
}

function logs( state :Immutable.List<LogRecord> = Immutable.List(), action ) {
	switch( action.type ) {
		case actions.SERVER_LOG_RESPONSE: {
			if( error ) {
				return state;
			}

			// May or may not be slow on large logs?
			// probably only if we exceed hundreds of thousands of lines.
			let index = state.findIndex( log => log.get( 'apiAccountId' ) == action.payload.apiAccountId );
			return state.set( index, new LogRecord({
				apiAccountId: action.payload.apiAccountId,
				entries: Immutable.List(
					action.payload.log
						.filter( entry => entry.lines.length )
						.map( entry => new LogEntryRecord( entry ) )
				)
			}));
		}

		default: return state;
	}
}

function players( state :Immutable.List<PlayerRecord> = Immutable.List(), action ) {
	switch( action.type ) {
		default: return state;
	}
}

function pendingCommands( state :Immutable.List<PendingCommandRecord> = Immutable.List(), action ) {
	switch( action.type ) {
		default: return state;
	}
}



////////

// function combineImmutableReducers( reducers ) {
// 	let keys = Object.keys( reducers );

// 	return ( state = Immutable.Map(), action ) =>
// 		state.withMutations( state =>
// 			keys.reduce(
// 				( state, key ) => state.set( key, reducers[ key ]( state.get( key ), action ) ),
// 				state
// 			)
// 		);
// }

// Note: If we use combineReducers from redux, we get a bunch of free error checking.
// However it means the root atom would not be an Immutable thing of any sort.
// It would have to be a POJO.  On the upshot, checking if a property has actually changed
// is guaranteed to work.

// If I'm doing this, though, I should probably adopt combineReducers' strategy for initial state
// by having each sub reducer return its own initial state.

// const creeperpanel = combineImmutableReducers(
// 	{ app, panels, apiAccounts, logs, players }
// );

export const creeperpanel = combineReducers({
	app, panels, apiAccounts, logs, players, pendingCommands
});
