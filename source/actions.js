import consoleLogParser from './parsers/console-log';
import userDataFs from './user-data-fs';

function action( type, payload, meta = {} ) {
	return {
		type, payload, meta,
		error: (payload instanceof Error)
	};
}

function getAPI( state, serverId ) {
	let server = state.getIn([ 'servers', serverId ]);
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

export const startServerPanel = ( serverId ) =>
	action( START_SERVER_PANEL, null, { serverId } );

export const stopServerPanel = ( serverId ) =>
	action( STOP_SERVER_PANEL, null, { serverId } );



////////

// export const SERVER_LOG_FETCH = 'SERVER_LOG';
export const SERVER_LOG_REQUEST = 'SERVER_LOG_REQUEST';
export const SERVER_LOG_RESPONSE = 'SERVER_LOG_RESPONSE';

export const serverLogFetch = ( serverId ) => ( dispatch, getState ) => {
	let api = getAPI( getState(), serverId );

	dispatch( serverLogRequest( serverId ) );

	api.exec( 'minecraft', 'readconsole', {}, Aries.wrapCommonErrors( ( error, data, response, rawData ) => {
		if( error ) {
			return dispatch( serverLogResponse( serverId, error ) );
		}

		// Normalization...?
		try {
			return dispatch( serverLogResponse( serverId, consoleLogParser.parse( data.log ) ) );
		}
		catch( parseError ) {
			console.error( parseError );
			return dispatch( serverLogResponse( serverId, parseError ) );
		}
	}));
}

const serverLogRequest = ( serverId ) =>
	action( SERVER_LOG_REQUEST, null, { serverId });

const serverLogResponse = ( serverId, logOrError ) =>
	action( SERVER_LOG_RESPONSE, logOrError, { serverId });



////////

// export const SERVER_PLAYERS_FETCH = 'SERVER_PLAYERS';
export const SERVER_PLAYERS_REQUEST = 'SERVER_PLAYERS_REQUEST';
export const SERVER_PLAYERS_RESPONSE = 'SERVER_PLAYERS_RESPONSE';

export const serverPlayersFetch = ( serverId ) => ( dispatch, getState ) => {
	let api = getAPI( getState(), serverId );

	dispatch( serverPlayersRequest( serverId ) );

	api.exec( 'minecraft', 'players', {}, Aries.wrapCommonErrors( ( error, data, response, rawData ) => {
		if( error ) {
			return dispatch( serverPlayersResponse( serverId, error ) );
		}

		// Normalization...?
		return dispatch( serverPlayersResponse( serverId, data.players, { method: data.method } ) );
	}));
}

const serverPlayersRequest = ( serverId ) =>
	action( SERVER_PLAYERS_REQUEST, null, { serverId });

const serverPlayersResponse = ( serverId, playerListOrError, meta ) =>
	action( SERVER_PLAYERS_RESPONSE, playerListOrError, { ...meta, serverId });



////////

// Note: Only 1 power command should be running at any time for a given server.

export const SERVER_POWER_REQUEST = 'SERVER_POWER_REQUEST';
export const SERVER_POWER_RESPONSE = 'SERVER_POWER_RESPONSE';

const serverPowerAction = ( serverId, power ) => ( dispatch, getState ) => {
	let api = getAPI( getState(), serverId );

	dispatch( serverPowerRequest( serverId ) );

	api.exec( 'minecraft', power, {}, Aries.wrapCommonErrors( ( error, data, response, rawData ) => {
		if( error ) {
			return dispatch( serverPowerResponse( serverId, error ) );
		}

		// Normalization...?
		return dispatch( serverPowerResponse( serverId ) );
	}));
}

const serverPowerRequest = ( serverId ) =>
	action( SERVER_POWER_REQUEST, null, { serverId });

const serverPowerResponse = ( serverId, error ) =>
	action( SERVER_POWER_RESPONSE, error, { serverId });

export const serverStart = ( serverId ) => serverPowerAction( serverId, 'startserver' );
export const serverStop = ( serverId ) => serverPowerAction( serverId, 'stopserver' );
export const serverRestart = ( serverId ) => serverPowerAction( serverId, 'restartserver' );



////////

// Note: Commands may be sent before previous commands have received a server response.

// export const SERVER_CONSOLE_COMMAND_SEND = 'SERVER_CONSOLE_COMMAND_SEND';
export const SERVER_CONSOLE_COMMAND_REQUEST = 'SERVER_CONSOLE_COMMAND_REQUEST';
export const SERVER_CONSOLE_COMMAND_RESPONSE = 'SERVER_CONSOLE_COMMAND_RESPONSE';

let _commandId = 0;

export const serverConsoleCommandSend = ( serverId, command ) => ( dispatch, getState ) => {
	let api = getAPI( getState(), serverId );
	let commandId = _commandId++;

	dispatch( serverPowerRequest( serverId, command, { commandId }) );

	api.exec( 'minecraft', 'writeconsole', { command }, Aries.wrapCommonErrors( ( error, data, response, rawData ) => {
		if( error ) {
			return dispatch( serverPowerResponse( serverId, error, { commandId }) );
		}

		// Normalization...?
		return dispatch( serverPowerResponse( serverId, null, { commandId }) );
	}));
}

const serverConsoleCommandRequest = ( serverId, command, meta ) =>
	action( SERVER_CONSOLE_COMMAND_REQUEST, command, { ...meta, serverId });

const serverConsoleCommandResponse = ( serverId, error, meta ) =>
	action( SERVER_CONSOLE_COMMAND_RESPONSE, error, { ...meta, serverId });
