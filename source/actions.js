import userDataFs from './user-data-fs';

function action( type, payload, meta = {} ) {
	return {
		type, payload, meta,
		error: (payload instanceof Error)
	};
}

////////

// Flux Standard Action says we should do THING_FETCH, THING_REQUEST, THING_RECEIVE
// where THING_RECEIVE might have error:true.  If error:true, then payload is an Error.

export const CONFIG_FETCH = 'CONFIG_FETCH';
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

export const SERVER_LOG_FETCH = 'SERVER_LOG';
export const SERVER_LOG_REQUEST = 'SERVER_LOG_REQUEST';
export const SERVER_LOG_RESPONSE = 'SERVER_LOG_RESPONSE';

export const serverLogFetch = ( serverId ) => ( dispatch, getState ) => {
	let state = getState();
	let server = state.servers.get( serverId );
	let { key, secret } = server;

	let api = new Aries( key, secret );

	dispatch( serverLogRequest( serverId ) );

	api.exec( 'minecraft', 'readconsole', {}, Aries.wrapCommonErrors( ( error, data, response, rawData ) => {
		if( error ) {
			return dispatch( serverLogResponse( serverId, error ) );
		}

		// Normalization...?
		return dispatch( serverLogResponse( serverId, data.log ) );
	}));
}

const serverLogRequest = ( serverId ) =>
	action( SERVER_LOG_REQUEST, null, { serverId });

const serverLogResponse = ( serverId, logOrError ) =>
	action( SERVER_LOG_RESPONSE, logOrError, { serverId });



////////

export const SERVER_PLAYERS_FETCH = 'SERVER_PLAYERS';
export const SERVER_PLAYERS_REQUEST = 'SERVER_PLAYERS_REQUEST';
export const SERVER_PLAYERS_RESPONSE = 'SERVER_PLAYERS_RESPONSE';

export const serverPlayersFetch = ( serverId ) => ( dispatch, getState ) => {
	// 
}

const serverPlayersRequest = ( serverId ) =>
	action( SERVER_PLAYERS_REQUEST, null, { serverId });

const serverPlayersResponse = ( serverId, playerListOrError ) =>
	action( SERVER_PLAYERS_RESPONSE, playerListOrError, { serverId });



////////

export const SERVER_POWER_REQUEST = 'SERVER_POWER_REQUEST';
export const SERVER_POWER_RESPONSE = 'SERVER_POWER_RESPONSE';

const serverPowerAction = ( serverId, power ) => ( dispatch, getState ) => {
	// ...
}

const serverPowerRequest = ( serverId ) =>
	action( SERVER_POWER_REQUEST, null, { serverId });

const serverPowerSuccess = ( serverId ) =>
	action( SERVER_POWER_RESPONSE, null, { serverId });

export const serverStart = ( serverId ) => serverPowerAction( serverId, 'start' );
export const serverStop = ( serverId ) => serverPowerAction( serverId, 'stop' );
export const serverRestart = ( serverId ) => serverPowerAction( serverId, 'restart' );
