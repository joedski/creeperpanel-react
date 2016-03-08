
import Immutable from 'immutable';
import uuid from 'uuid';
import actions from '../actions';

const AppStateRecord = Immutable.Record({
	// TODO: Should we worry if we can't read/write from the config dir?
	'configLoadComplete': false,
})

const PanelRecord = Immutable.Record({
	'serverIdViewing': ''
});

const ServerRecord = Immutable.Record({
	id: '',
	title: '',
	key: '',
	secret: ''
});

const PlayerRecord = Immutable.Record({
	id: '',
	serverId: '',
	name: '',
	style: '',
	minecraftId: '',
});

const LogRecord = Immutable.Record({
	serverId: '',
	lines: Immutable.List()
});

const PendingCommandRecord = Immutable.Record({
	serverId: '',
	text: '',
	sent: null,
});



////////

initialState = Immutable.Map({
	'app': new AppStateRecord(),

	// Our open panels: List<PanelRecord>
	'panels': Immutable.List(),

	// serverId -> ServerRecord
	'servers': Immutable.Map(),

	// serverId -> LogRecord
	'logs': Immutable.Map(),

	// serverId -> List<PlayerRecord>
	'playerLists': Immutable.Map(),

	// List<PendingCommandRecord>
	'pendingCommands': Immutable.List(),
});



////////

function app( state :AppStateRecord, action ) {
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

function panels( state :Immutable.List<PanelRecord>, action ) {
	switch( action.type ) {
		default: return state;
	}
}

function servers( state :Immutable.Map<string, ServerRecord>, action ) {
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

function logs( state :Immutable.Map<string, LogRecord>, action ) {
	switch( action.type ) {
		default: return state;
	}
}

function playerLists( state :Immutable.Map<string, List<PlayerRecord>>, action ) {
	switch( action.type ) {
		default: return state;
	}
}

function pendingCommands( state :Immutable.List<PendingCommandRecord>, action ) {
	switch( action.type ) {
		default: return state;
	}
}



////////

function combineImmutableReducers( reducers, initialState ) {
	let keys = Object.keys( reducers );

	return ( state = initialState, action ) =>
		state.withMutations( state =>
			keys.reduce(
				( state, key ) => state.set( key, reducers[ key ]( state.get( key ), action ) ),
				state
			)
		);
}

// Note: If we use combineReducers from redux, we get a bunch of free error checking.
// However it means the root atom would not be an Immutable thing of any sort.
// It would have to be a POJO.  Oh well.

// If I'm doing this, though, I should probably adopt combineReducers' strategy for initial state
// by having each sub reducer return its own initial state.

const creeperpanel = combineImmutableReducers(
	{ app, panels, servers, tags, playerLists },
	initialState
);
