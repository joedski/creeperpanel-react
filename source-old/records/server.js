// @flow weak

import Immutable from 'immutable';
import uuid from 'uuid';

const ServerRecordDefinition = Immutable.Record({
	id: '',
	title: '',
	key: '',
	secret: ''
});

export default class ServerRecord extends ServerRecordDefinition {
	id: string;
	title: string;
	key: string;
	secret: string;

	constructor( fields ) {
		super({
			...fields,
			id: fields.id || uuid.v4()
		});
	}
}
