import consoleLogParser from './parsers/console-log';
import userDataFs from './user-data-fs';

function action( type, payload, meta = {} ) {
	return {
		type, payload, meta,
		error: (payload instanceof Error)
	};
}

function getAPI( state, apiAccountId ) {
	let server = state.getIn([ 'servers', apiAccountId ]);
	let key = server.get( 'key' );
	let secret = server.get( 'secret' );

	let api = new Aries( key, secret );

	return api;
}

////////

// Flux Standard Action says we should do THING_FETCH, THING_REQUEST, THING_RECEIVE
// where THING_RECEIVE might have error:true.  If error:true, then payload is an Error.

// export const CONFIG_FETCH = 'CONFIG_FETCH';
export const CONFIG_REQUEST = 'CONFIG_REQUEST';
export const CONFIG_RESPONSE = 'CONFIG_RESPONSE';

export const configLoad = () => ( dispatch, getState ) => {
	dispatch( configRequest() );

	// If we have to load multiple files, we only dispatch one action to indicate intent to read,
	// then dispatch one action per file.  This allows errors to remain meaningful.

	userDataFs.read( 'servers.json', ( error, configJSON ) => {
		if( error ) {
			return dispatch( configResponse( error ) );
		}

		let config = configJSON ? JSON.parse( configJSON ) : {};

		// Convert from legacy format.
		if( (typeof config) != 'array' ) {
			config = Object.keys( config ).map( ( key ) => config[ key ] );
		}

		return dispatch( configResponse( config ) );
	});
}

const configRequest = () =>
	action( CONFIG_REQUEST );

const configResponse = ( configOrError ) =>
	action( CONFIG_RESPONSE, configOrError );



////////

export const OPEN_PANEL = 'OPEN_PANEL';
export const CLOSE_PANEL = 'CLOSE_PANEL';

// Impure.
let _panelId = 0;

export const openPanel = () =>
	action( OPEN_PANEL, { panelId: String( _panelId++ ) } );

export const closePanel = ( panelId ) =>
	action( CLOSE_PANEL, { panelId } );

export const PANEL_API_ACCOUNT_SELECT = 'PANEL_API_ACCOUNT_SELECT';

export const panelAPIAccountSelect = ( panelId, apiAccountId ) =>
	action( PANEL_API_ACCOUNT_SELECT, { apiAccountId, panelId });



////////

// export const SERVER_LOG_FETCH = 'SERVER_LOG';
export const SERVER_LOG_REQUEST = 'SERVER_LOG_REQUEST';
export const SERVER_LOG_RESPONSE = 'SERVER_LOG_RESPONSE';

export const serverLogFetch = ( apiAccountId ) => ( dispatch, getState ) => {
	let api = getAPI( getState(), apiAccountId );

	dispatch( serverLogRequest( apiAccountId ) );

	return api.exec( 'minecraft', 'readconsole', {}, Aries.wrapCommonErrors( ( error, data ) => {
		if( error ) {
			error.apiAccountId = apiAccountId;
			return dispatch( serverLogResponse( apiAccountId, error ) );
		}

		try {
			return dispatch( serverLogResponse( apiAccountId, consoleLogParser.parse( data.log ) ) );
		}
		catch( parseError ) {
			console.error( parseError );
			parseError.apiAccountId = apiAccountId;
			parseError.logText = data.log;
			return dispatch( serverLogResponse( apiAccountId, parseError ) );
		}
	}));
}

const serverLogRequest = ( apiAccountId ) =>
	action( SERVER_LOG_REQUEST, { apiAccountId });

const serverLogResponse = ( apiAccountId, logOrError ) => {
	// This seems less predictable to me.
	if( logOrError instanceof Error ) {
		return action( SERVER_LOG_RESPONSE, logOrError );
	}
	else {
		return action( SERVER_LOG_RESPONSE, {
			log: logOrError,
			apiAccountId
		});
	}
}



////////

// export const SERVER_PLAYERS_FETCH = 'SERVER_PLAYERS';
export const SERVER_PLAYERS_REQUEST = 'SERVER_PLAYERS_REQUEST';
export const SERVER_PLAYERS_RESPONSE = 'SERVER_PLAYERS_RESPONSE';

export const serverPlayersFetch = ( apiAccountId ) => ( dispatch, getState ) => {
	let api = getAPI( getState(), apiAccountId );

	dispatch( serverPlayersRequest( apiAccountId ) );

	return api.exec( 'minecraft', 'players', {}, Aries.wrapCommonErrors( ( error, data ) => {
		if( error ) {
			error.apiAccountId = apiAccountId;
			return dispatch( serverPlayersResponse( apiAccountId, error ) );
		}

		// Normalization...?
		return dispatch( serverPlayersResponse( apiAccountId, data.players, { method: data.method } ) );
	}));
}

const serverPlayersRequest = ( apiAccountId ) =>
	action( SERVER_PLAYERS_REQUEST, { apiAccountId });

const serverPlayersResponse = ( apiAccountId, playerListOrError, misc ) => {
	if( playerListOrError instanceof Error ) {
		return action( SERVER_PLAYERS_RESPONSE, playerListOrError );
	}

	return action( SERVER_PLAYERS_RESPONSE, {
		...misc, apiAccountId,
		players: playerListOrError
	});
}



////////

// Note: Only 1 power command should be running at any time for a given server.

export const SERVER_POWER_REQUEST = 'SERVER_POWER_REQUEST';
export const SERVER_POWER_RESPONSE = 'SERVER_POWER_RESPONSE';

const serverPowerAction = ( apiAccountId, power ) => ( dispatch, getState ) => {
	let api = getAPI( getState(), apiAccountId );

	dispatch( serverPowerRequest( apiAccountId ) );

	return api.exec( 'minecraft', power, {}, Aries.wrapCommonErrors( ( error, data ) => {
		if( error ) {
			error.apiAccountId = apiAccountId;
			return dispatch( serverPowerResponse( apiAccountId, error ) );
		}

		// Normalization...?
		return dispatch( serverPowerResponse( apiAccountId ) );
	}));
}

const serverPowerRequest = ( apiAccountId ) =>
	action( SERVER_POWER_REQUEST, null, { apiAccountId });

const serverPowerResponse = ( apiAccountId, error ) => {
	if( error ) {
		return action( SERVER_POWER_RESPONSE, error );
	}

	return action( SERVER_POWER_RESPONSE, { apiAccountId });
}

export const serverStart = ( apiAccountId ) => serverPowerAction( apiAccountId, 'startserver' );
export const serverStop = ( apiAccountId ) => serverPowerAction( apiAccountId, 'stopserver' );
export const serverRestart = ( apiAccountId ) => serverPowerAction( apiAccountId, 'restartserver' );



////////

// Note: Commands may be sent before previous commands have received a server response.

// export const SERVER_CONSOLE_COMMAND_SEND = 'SERVER_CONSOLE_COMMAND_SEND';
export const SERVER_CONSOLE_COMMAND_REQUEST = 'SERVER_CONSOLE_COMMAND_REQUEST';
export const SERVER_CONSOLE_COMMAND_RESPONSE = 'SERVER_CONSOLE_COMMAND_RESPONSE';

let _commandId = 0;

export const serverConsoleCommandSend = ( apiAccountId, command ) => ( dispatch, getState ) => {
	let api = getAPI( getState(), apiAccountId );
	let commandId = _commandId++;

	dispatch( serverPowerRequest( apiAccountId, { text: command, commandId }) );

	return api.exec( 'minecraft', 'writeconsole', { command }, Aries.wrapCommonErrors( ( error, data ) => {
		if( error ) {
			error.commandId = commandId;
			error.apiAccountId = apiAccountId;
			return dispatch( serverPowerResponse( apiAccountId, error ) );
		}

		return dispatch( serverPowerResponse( apiAccountId, { commandId }) );
	}));
}

const serverConsoleCommandRequest = ( apiAccountId, command ) =>
	action( SERVER_CONSOLE_COMMAND_REQUEST, { ...command, apiAccountId });

const serverConsoleCommandResponse = ( apiAccountId, errorOrCommand ) => {
	if( errorOrCommand instanceof Error ) {
		return action( SERVER_CONSOLE_COMMAND_RESPONSE, error );
	}

	return action( SERVER_CONSOLE_COMMAND_RESPONSE, { ...errorOrCommand, apiAccountId });
}
