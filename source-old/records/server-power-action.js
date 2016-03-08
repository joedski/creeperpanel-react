// @flow weak
import Immutable from 'immutable';

const ServerPowerActionRecordBase = Immutable.Record({
	serverId: '',
	sent: null,
	status: 'unsent',
	// restart is the safest default as a success indicates that server has been stopped if running, and then started regardless.
	action: 'restart'
});

export default class ServerPowerActionRecord extends ServerPowerActionRecordBase {
	serverId: string;
	sent: ?Date;
	status: ('unsent' | 'sent' | 'completed' | 'errored');
	action: ('start' | 'restart' | 'stop');

	constructor( serverId :string, powerAction :string ) {
		super({
			serverId,
			action: powerAction,
			sent: new Date()
		});
	}
}
