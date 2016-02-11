
import EventEmitter from 'events';
import { inherits } from 'util';
import Tick from 'tick-tock';

import ServerInfoAPI from 'server-info-api';

export default function PanelInfo( credentials ) {
	this.setCredentials( credentials );

	this.tick = new Tick();
}

inherits( PanelInfo, EventEmitter );

Object.assign( PanelInfo.prototype, {
	setCredentials( credentials ) {
		this.credentials = credentials;

		if( this.credentials ) {
			this.api = new ServerInfoAPI({
				credentials: this.credentials
			});
		}
		else {
			this.api = null;
		}
	},

	start() {
		if( ! this.api ) {
			this.stop();
			return false;
		}

		this.consoleRead();
		this.osGetRAM();
		this.osGetCPU();
		this.osGetHDD();

		return true;
	},

	stop() {
		this.tick.clear();
	},

	execAPICall( callName, interval, resHandler ) {
		if( ! this.api ) return false;

		this.api[ callName ]( ( error, res ) => {
			if( error ) {
				this.emit( 'error', error );
				return;
			}
			else if( res ) {
				this.emit( 'data', resHandler( res ) );
				return;
			}
			else {
				this.emit( 'error', new Error( `Null response from non-errored call to ${ callName }.` ) );
				return;
			}
		});

		this.tick.setTimeout( 'consoleRead', this.consoleRead.bind( this ), interval );
		return true;
	},

	consoleRead() {
		return this.execAPICall( 'consoleRead', '2 second', ( res ) => {
			return {
				log: res.log.split( /\r\n|\r|\n/ ).filter( s => !!s )
			};
		});
	},

	handleOSStat( res ) {
		let free = parseFloat( res.free ), used = parseFloat( res.used );
		return { free, used, total: free + used };
	},

	// Gigs
	osGetRAM() {
		return this.execAPICall( 'osGetRAM', '5 seconds', ( res ) => {
			return {
				ram: this.handleOSStat( res )
			};
		});
	},

	// Percent
	osGetCPU() {
		return this.execAPICall( 'osGetCPU', '5 seconds', ( res ) => {
			return {
				cpu: this.handleOSStat( res )
			};
		});
	},

	// Bytes?  Blocks?
	osGetHDD() {
		return this.execAPICall( 'osGetHDD', '5 seconds', ( res ) => {
			return {
				hdd: this.handleOSStat( res )
			};
		});
	},
});
