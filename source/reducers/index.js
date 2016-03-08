// @flow weak

import Immutable from 'immutable';
import uuid from 'uuid';
import actions from '../actions';



////////

type APIAccountId = string;



////////

const AppStateRecord = Immutable.Record({
	// TODO: Should we worry if we can't read/write from the config dir?
	'configLoadComplete': false,
});

const PanelRecord = Immutable.Record({
	'serverIdViewing': ''
});

const APIAccountRecord = Immutable.Record({
	id: '',
	title: '',
	key: '',
	secret: '',
	// Support changing which instance a given api account is looking at?
	// instanceId: ''
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
	text: '',
	sent: null,
});



////////

function app( state :AppStateRecord = new AppStateRecord(), action ) {
	switch( action.type ) {
		case actions.CONFIG_RESPONSE: {
			if( action.error ) {
				// TODO: Show error to user.
				return state;
			}

			return state.set( 'configLoadComplete', true );
		}

		default: return state;
	}
}

function panels( state :Immutable.List<PanelRecord> = Immutable.List(), action ) {
	switch( action.type ) {
		default: return state;
	}
}

function apiAccounts( state :Immutable.Map<APIAccountId, APIAccountRecord> = Immutable.Map(), action ) {
	switch( action.type ) {
		case actions.CONFIG_REQUEST: {
			return state;
		}

		case actions.CONFIG_RESPONSE: {
			if( action.error ) {
				// TODO: Show error to user.
				return state;
			}

			return state;
		}

		default: return state;
	}
}

function logs( state :Immutable.Map<APIAccountId, LogRecord> = Immutable.Map(), action ) {
	switch( action.type ) {
		default: return state;
	}
}

// Is it better to use maps here?  Or selectors to create the maps?
function playerLists( state :Immutable.Map<APIAccountId, List<PlayerRecord>> = Immutable.Map(), action ) {
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

function combineImmutableReducers( reducers ) {
	let keys = Object.keys( reducers );

	return ( state = Immutable.Map(), action ) =>
		state.withMutations( state =>
			keys.reduce(
				( state, key ) => state.set( key, reducers[ key ]( state.get( key ), action ) ),
				state
			)
		);
}

// Note: If we use combineReducers from redux, we get a bunch of free error checking.
// However it means the root atom would not be an Immutable thing of any sort.
// It would have to be a POJO.  On the upshot, checking if a property has actually changed
// is guaranteed to work.

// If I'm doing this, though, I should probably adopt combineReducers' strategy for initial state
// by having each sub reducer return its own initial state.

const creeperpanel = combineImmutableReducers(
	{ app, panels, apiAccounts, tags, playerLists }
);
