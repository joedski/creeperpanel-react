// @flow weak
import Immutable from 'immutable';
import ConsoleCommandRecord from './console-command';

const ServerRecordDefinition = Immutable.Record({
	log: Immutable.List(),
	players: Immutable.List(),
	consoleCommands: Immutable.OrderedMap()
});

export default class ServerRecord extends ServerRecordDefinition {
	log: Immutable.List<any>;
	players: Immutable.List<any>;
	consoleCommands: Immutable.OrderedMap<string, ConsoleCommandRecord>;

	constructor( fields ) {
		super({
			...fields
		});
	}
}
