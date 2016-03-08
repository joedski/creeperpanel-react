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

		return dispatch( configResponse( config ) );
	});
}

const configRequest = () =>
	action( CONFIG_REQUEST );

const configResponse = ( configOrError ) =>
	action( CONFIG_RESPONSE, configOrError );



////////

export const START_SERVER_PANEL = 'START_SERVER_PANEL';
export const STOP_SERVER_PANEL = 'STOP_SERVER_PANEL';

export const startServerPanel = ( apiAccountId ) =>
	action( START_SERVER_PANEL, null, { apiAccountId } );

export const stopServerPanel = ( apiAccountId ) =>
	action( STOP_SERVER_PANEL, null, { apiAccountId } );



////////

// export const SERVER_LOG_FETCH = 'SERVER_LOG';
export const SERVER_LOG_REQUEST = 'SERVER_LOG_REQUEST';
export const SERVER_LOG_RESPONSE = 'SERVER_LOG_RESPONSE';

export const serverLogFetch = ( apiAccountId ) => ( dispatch, getState ) => {
	let api = getAPI( getState(), apiAccountId );

	dispatch( serverLogRequest( apiAccountId ) );

	api.exec( 'minecraft', 'readconsole', {}, Aries.wrapCommonErrors( ( error, data, response, rawData ) => {
		if( error ) {
			return dispatch( serverLogResponse( apiAccountId, error ) );
		}

		// Normalization...?
		try {
			return dispatch( serverLogResponse( apiAccountId, consoleLogParser.parse( data.log ) ) );
		}
		catch( parseError ) {
			console.error( parseError );
			return dispatch( serverLogResponse( apiAccountId, parseError ) );
		}
	}));
}

const serverLogRequest = ( apiAccountId ) =>
	action( SERVER_LOG_REQUEST, null, { apiAccountId });

const serverLogResponse = ( apiAccountId, logOrError ) =>
	action( SERVER_LOG_RESPONSE, logOrError, { apiAccountId });



////////

// export const SERVER_PLAYERS_FETCH = 'SERVER_PLAYERS';
export const SERVER_PLAYERS_REQUEST = 'SERVER_PLAYERS_REQUEST';
export const SERVER_PLAYERS_RESPONSE = 'SERVER_PLAYERS_RESPONSE';

export const serverPlayersFetch = ( apiAccountId ) => ( dispatch, getState ) => {
	let api = getAPI( getState(), apiAccountId );

	dispatch( serverPlayersRequest( apiAccountId ) );

	api.exec( 'minecraft', 'players', {}, Aries.wrapCommonErrors( ( error, data, response, rawData ) => {
		if( error ) {
			return dispatch( serverPlayersResponse( apiAccountId, error ) );
		}

		// Normalization...?
		return dispatch( serverPlayersResponse( apiAccountId, data.players, { method: data.method } ) );
	}));
}

const serverPlayersRequest = ( apiAccountId ) =>
	action( SERVER_PLAYERS_REQUEST, null, { apiAccountId });

const serverPlayersResponse = ( apiAccountId, playerListOrError, meta ) =>
	action( SERVER_PLAYERS_RESPONSE, playerListOrError, { ...meta, apiAccountId });



////////

// Note: Only 1 power command should be running at any time for a given server.

export const SERVER_POWER_REQUEST = 'SERVER_POWER_REQUEST';
export const SERVER_POWER_RESPONSE = 'SERVER_POWER_RESPONSE';

const serverPowerAction = ( apiAccountId, power ) => ( dispatch, getState ) => {
	let api = getAPI( getState(), apiAccountId );

	dispatch( serverPowerRequest( apiAccountId ) );

	api.exec( 'minecraft', power, {}, Aries.wrapCommonErrors( ( error, data, response, rawData ) => {
		if( error ) {
			return dispatch( serverPowerResponse( apiAccountId, error ) );
		}

		// Normalization...?
		return dispatch( serverPowerResponse( apiAccountId ) );
	}));
}

const serverPowerRequest = ( apiAccountId ) =>
	action( SERVER_POWER_REQUEST, null, { apiAccountId });

const serverPowerResponse = ( apiAccountId, error ) =>
	action( SERVER_POWER_RESPONSE, error, { apiAccountId });

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

	dispatch( serverPowerRequest( apiAccountId, command, { commandId }) );

	api.exec( 'minecraft', 'writeconsole', { command }, Aries.wrapCommonErrors( ( error, data, response, rawData ) => {
		if( error ) {
			return dispatch( serverPowerResponse( apiAccountId, error, { commandId }) );
		}

		// Normalization...?
		return dispatch( serverPowerResponse( apiAccountId, null, { commandId }) );
	}));
}

const serverConsoleCommandRequest = ( apiAccountId, command, meta ) =>
	action( SERVER_CONSOLE_COMMAND_REQUEST, command, { ...meta, apiAccountId });

const serverConsoleCommandResponse = ( apiAccountId, error, meta ) =>
	action( SERVER_CONSOLE_COMMAND_RESPONSE, error, { ...meta, apiAccountId });
