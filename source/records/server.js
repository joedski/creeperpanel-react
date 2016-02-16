
import Immutable from 'immutable';
import uuid from 'uuid';

const ServerRecordDefinition = Immutable.Record({
	id: undefined,
	title: undefined,
	key: undefined,
	secret: undefined
});

export default class ServerRecord extends ServerRecordDefinition {
	id: string;
	title: string;
	key: string;
	secret: string;

	constructor( id :?string, title :string, key :string, secret :string ) {
		super({ title, key, string,
			id: id || uuid.v4()
		});
	}
}
