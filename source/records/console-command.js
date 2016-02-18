// @flow weak
import Immutable from 'immutable';
import uuid from 'uuid';

const ConsoleCommandRecordBase = Immutable.Record({
	id: '',
	serverId: '',
	sent: null,
	status: 'unsent',
	text: ''
});

export default class ConsoleCommandRecord extends ConsoleCommandRecordBase {
	id: string;
	serverId: string;
	sent: ?Date;
	status: ('unsent' | 'sent' | 'completed' | 'errored');
	text: string;

	constructor( serverId :string, text :string ) {
		super({
			id: uuid.v4(),
			serverId,
			text,
			sent: new Date()
		});
	}
}
