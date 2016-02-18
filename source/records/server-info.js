// @flow weak
import Immutable from 'immutable';

const ServerRecordDefinition = Immutable.Record({
	log: Immutable.List(),
	players: Immutable.List()
});

export default class ServerRecord extends ServerRecordDefinition {
	log: Immutable.List<any>;
	players: Immutable.List<any>;

	constructor( fields ) {
		super({
			...fields
		});
	}
}
