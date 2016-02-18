// @flow weak

import Immutable from 'immutable';

const APIWatchRecordDefinition = Immutable.Record({
	activeWatches: 0
});

export default class APIWatchRecord extends APIWatchRecordDefinition {
	activeWatches: number;

	constructor( fields ) {
		super({ ...fields });
	}
}
