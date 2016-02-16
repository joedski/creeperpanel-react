// SettingsGroup: Manage a bunch of autonomous PersistedSettingsReaderWriters. (like ServerSettings)

import EventEmitter from 'events';
import { inherits } from 'util';
import async from 'async';

export default function SettingsGroup( settingsReaderWriterClasses :Array ) {
	EventEmitter.call( this );

	this.settingsReaderWriters = [];

	settingsReaderWriterClasses.forEach( ( srwc ) => {
		this.add( srwc );
	});
}

inherits( SettingsGroup, EventEmitter );

Object.assign( SettingsGroup.prototype, {
	add( srwc ) {
		let srw = new srwc();

		this.settingsReaderWriters.push( srw );
	},

	read( next ) {
		async.each( this.settingsReaderWriters, ( srw, next ) => {
			srw.readSettings( next );
		}, next );
	},

	write( next ) {
		async.each( this.settingsReaderWriters, ( srw, next ) => {
			srw.writeSettings( next );
		}, next );
	},

	release() {
		this.settingsReaderWriters.forEach( ( srw ) => {
			srw.release();
		});

		this.settingsReaderWriters.length = 0;
	}
});
