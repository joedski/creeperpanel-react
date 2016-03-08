// @flow weak

import Immutable from 'immutable';
import uuid from 'uuid';

const ServerPlayerRecordBase = Immutable.Record({
	id: '',
	serverId: '',
	name: '',
	style: '',
	minecraftId: ''
});

export default class ServerPlayerRecord extends ServerPlayerRecordBase {
	id: string;
	serverId: string;
	sent: ?Date;
	status: ('unsent' | 'sent' | 'completed' | 'errored');
	text: string;

	constructor( serverId, fields ) {
		super({
			id: fields.id || fields.name,
			serverId,
			name: fields.name,
			style: fields.style,
			// This is usually null in CHAPI.  Hm.
			minecraftId: fields.id
		});
	}
}
