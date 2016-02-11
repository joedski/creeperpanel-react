'use strict';
// Main-side portion of a panel.

import EventEmitter from 'events';
import { inherits } from 'util';

import electron, { BrowserWindow, ipcMain as ipc } from 'electron';

import { makeGetter as makeIdGetter } from 'app-util/id-getter';
import ServerInfoAPI from 'server-info-api';
import ServerInfoWatcher from 'server-info-api/watcher';
import Info from './info';
import deepEqual from 'deep-equal';
import appSettings from 'app-settings';



export default function PanelController() {
	this.getId = makeIdGetter();

	this._onPanelModelRequest = this.onPanelModelRequest.bind( this );
	this._onPanelCommand = this.onPanelCommand.bind( this );
	this._onPanelServerSelect = this.onPanelServerSelect.bind( this );

	this.initState();
	this.initInfo();
	this.initWindow();

	this.loadSettings();
}

inherits( PanelController, EventEmitter );

Object.assign( PanelController.prototype, {
	getId: null,

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
			// Percent. (0.0 ~ 100.0)
			cpu: { free: 0, used: 0, total: 0 },
			// Gigs
			ram: { free: 0, used: 0, total: 0 },
			// Bytes?  Blocks?  Something.
			hdd: { free: 0, used: 0, total: 0 },
			currentServer: -1,
			servers: [],
			serversLoaded: false
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

			// 'osGetRAM': [ '5 seconds', statHandler( 'ram' ) ],
			// 'osGetCPU': [ '5 seconds', statHandler( 'cpu' ) ],
			// 'osGetHDD': [ '5 seconds', statHandler( 'hdd' ) ],
		});

		this.info.on( 'data', this.onInfoData.bind( this ) );
		this.info.on( 'error', this.onInfoError.bind( this ) );
	},

	initWindow() {
		let win = this.window = new BrowserWindow({ width: 1024 });
		win.loadURL( `file://${ __dirname }/index.html?id=${ this.getId() }` );
		win.webContents.openDevTools();

		win.on( 'closed', () => {
			this.close();
		});

		ipc.on( 'panel-model-request', this._onPanelModelRequest );
		ipc.on( 'panel-command', this._onPanelCommand );
		ipc.on( 'panel-server-select', this._onPanelServerSelect );
	},

	onPanelModelRequest( event ) {
		if( event.sender != this.window.webContents ) return;
		this.sendPanelModelUpdate();
	},

	onPanelCommand( event, command ) {
		if( event.sender != this.window.webContents ) return;
		console.log( 'Received command:', JSON.stringify( command ) );
	},

	onPanelServerSelect( event, serverSelection ) {
		if( event.sender != this.window.webContents ) return;
		this.setState({ currentServer: serverSelection });
	},

	onInfoData( data ) {
		this.setState( data );
	},

	onInfoError( error ) {
		console.warn( `PanelController: Error from Info:` );
		console.warn( error );
	},

	setState( newState ) {
		let oldState = this.state;
		let serversJustLoaded = (newState.serversLoaded && ! oldState.serversLoaded);

		this.state = Object.assign( {}, this.state, newState );

		if( this.state.currentServer >= this.state.servers.length || this.state.currentServer < 0 ) {
			this.state.currentServer = -1;
		}

		// Updates.

		this.sendPanelModelUpdate();

		if( ! serversJustLoaded && ! deepEqual( oldState.servers, this.state.servers ) ) {
			this.saveServers();
		}

		if( oldState.currentServer !== this.state.currentServer ) {
			if( this.state.currentServer === -1 ) {
				this.info.stop();
				this.info.api = null;
			}
			else {
				let newServer = this.state.servers[ this.state.currentServer ];

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
		this.window.webContents.send( 'panel-model-update', this.state );
	},

	close() {
		ipc.removeListener( 'panel-model-request', this._onPanelModelRequest );
		ipc.removeListener( 'panel-command', this._onPanelCommand );

		this.info.stop();
		this.info.removeAllListeners();

		this.window = null;
		this.emit( 'closed' );
	}
});
