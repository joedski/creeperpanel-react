'use strict';
// Main-side portion of a panel.

import EventEmitter from 'events';
import { inherits } from 'util';

import uuid from 'uuid';

import electron, { BrowserWindow, ipcMain as ipc } from 'electron';

import { makeGetter as makeIdGetter } from 'app-util/id-getter';
import ServerInfoAPI from 'server-info-api';
import ServerInfoWatcher from 'server-info-api/watcher';
import Info from './info';
import deepEqual from 'deep-equal';
import appSettings from 'app-settings';



export default function PanelController() {
	this.getId = makeIdGetter();

	this._onPanelAction = this.onPanelAction.bind( this );

	this.initPanelActionHandlers();
	this.initState();
	this.initInfo();
	this.initWindow();

	this.loadSettings();
}

inherits( PanelController, EventEmitter );

Object.assign( PanelController.prototype, {
	getId: null,

	initPanelActionHandlers() {
		this.panelActionHandlers = {
			'select-server': ( params ) => {
				this.setState({ currentServer: params.serverSelection });
			},
			'send-console-command': ( params ) => {
				console.log( 'Received command:', JSON.stringify( params.command ) );
			},
			'model-request': () => {
				this.sendPanelModelUpdate();
			},
			'power-server': ( params ) => {
				// console.log( `Received server power command: ${ params.action }`)
				this.performServerAction( params );
			},
			'add-server': ( params ) => {
				this.setState({
					servers: this.state.servers.concat([ params.server ])
				});
			}
		};
	},

	loadSettings() {
		appSettings.readServers( ( error, servers ) => {
			if( error ) {
				console.error( `Error trying to read servers settings:` );
				console.error( error );
				this.setState({ servers: [], serversLoaded: false });
				return;
			}

			this.setState({ servers: servers, serversLoaded: true });
			return;
		});
	},

	initState() {
		this.state = {
			log: [],
			players: [],
			playersLoaded: false,
			// Percent. (0.0 ~ 100.0)
			cpu: { free: 0, used: 0, total: 0 },
			// Gigs
			ram: { free: 0, used: 0, total: 0 },
			// Bytes?  Blocks?  Something.
			hdd: { free: 0, used: 0, total: 0 },
			currentServer: -1,
			servers: [],
			serversLoaded: false,
			currentServerAction: null
		};
	},

	initInfo() {
		let statHandler = ( statName ) => (( res ) => {
			let free = parseFloat( res.free ), used = parseFloat( res.used );
			return { free, used, total: free + used };
		});

		this.info = new ServerInfoWatcher( null, {
			'consoleRead': [ '2 seconds',  ( res ) => {
				return {
					log: res.log.split( /\r\n|\r|\n/ ).filter( s => !!s )
				};
			}],

			'playersList': [ '5 seconds', ( res ) => {
				return {
					// method: res.method,
					playersLoaded: true,
					players: res.players
				};
			}]

			// 'osGetRAM': [ '5 seconds', statHandler( 'ram' ) ],
			// 'osGetCPU': [ '5 seconds', statHandler( 'cpu' ) ],
			// 'osGetHDD': [ '5 seconds', statHandler( 'hdd' ) ],
		});

		this.info.on( 'data', this.onInfoData.bind( this ) );
		this.info.on( 'error', this.onInfoError.bind( this ) );
	},

	onInfoData( data ) {
		this.setState( data );
	},

	onInfoError( error ) {
		console.warn( `PanelController: Error from Info:` );
		console.warn( error );
	},

	initWindow() {
		let win = this.window = new BrowserWindow({ width: 1024 });
		win.loadURL( `file://${ __dirname }/index.html?id=${ this.getId() }` );
		// win.webContents.openDevTools();

		win.on( 'closed', () => {
			this.close();
		});

		ipc.on( 'ui-action', this._onPanelAction );
	},

	onPanelAction( event, action, parameters ) {
		if( event.sender != this.window.webContents ) return;

		parameters = parameters || {};

		console.log( `Received Panel Action: ${ action }, ${ JSON.stringify( parameters ) }` );

		let selectedHandler = this.panelActionHandlers[ action ];

		if( ! selectedHandler ) {
			console.warn( `panel/controller#onPanelAction: Received action with no handler: '${ action }'` );
			return;
		}

		selectedHandler.call( this, parameters );
	},

	setState( newState ) {
		let oldState = this.state;
		this.state = Object.assign( {}, this.state, newState );

		this.ensureStateServerIds();
		this.ensureStateCurrentServer();

		// Updates.

		this.sendPanelModelUpdate();
		this.conditionallySaveServers( oldState, this.state );
		this.updateInfoAPI( oldState, this.state );
	},

	ensureStateServerIds() {
		// Ensure each server entry has an ID.  This could probably be done better...
		this.state.servers = this.state.servers.map( ( server ) => {
			if( server.id ) return server;
			return Object.assign( {}, server, { id: uuid.v4() });
		});
	},

	ensureStateCurrentServer() {
		if( this.state.currentServer >= this.state.servers.length || this.state.currentServer < 0 ) {
			this.state.currentServer = -1;
		}
	},

	conditionallySaveServers( oldState, currState ) {
		let serversJustLoaded = (currState.serversLoaded && ! oldState.serversLoaded);

		if( ! serversJustLoaded && ! deepEqual( oldState.servers, currState.servers ) ) {
			this.saveServers();
		}
	},

	updateInfoAPI( oldState, currState ) {
		if( oldState.currentServer !== currState.currentServer ) {
			if( currState.currentServer === -1 ) {
				this.info.stop();
				this.info.api = null;
			}
			else {
				let newServer = currState.servers[ currState.currentServer ];

				this.info.stop();
				this.info.api = new ServerInfoAPI({
					credentials: {
						key: newServer.key,
						secret: newServer.secret
					}
				});
				this.info.start();
			}
		}
	},

	saveServers() {
		appSettings.writeServers( this.state.servers );
	},

	sendPanelModelUpdate() {
		this.window.webContents.send( 'model-update', this.state );
	},

	performServerAction( params ) {
		if( ! this.info.api ) {
			console.warn( `Trying to tell server to ${ params.action } with no api.  (Are we offline?)` );
			return;
		}

		let apiActions = {
			'start': 'serverStart',
			'stop': 'serverStop',
			'restart': 'serverRestart'
		};

		let selectedAPIAction = apiActions[ params.action ];

		if( ! selectedAPIAction ) {
			console.warn( `No API Action for server action '${ params.action }'.` );
			return;
		}

		this.info.api[ selectedAPIAction ]( ( error ) => {
			if( error ) {
				console.error( `Encountered error trying to ${ params.action } the server:` );
				console.error( error );
				return;
			}

			this.setState({
				currentServerAction: null
			});
		});

		this.setState({
			currentServerAction: params
		});
	},

	close() {
		// ipc.removeListener( 'panel-model-request', this._onPanelModelRequest );
		ipc.removeListener( 'ui-action', this._onPanelAction );

		this.info.stop();
		this.info.removeAllListeners();

		this.window = null;
		this.emit( 'closed' );
	}
});
