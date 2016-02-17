// @flow

import Immutable from 'immutable';
// import type ServerRecord from 'records/server';

type ServerFields = { id: string, title: string, key: string, secret: string };
type ServerFieldsNoId = { title: string, key: string, secret: string };

export type Action
	= {
		type: 'mcpanel/add-server',
		// server: ServerRecord
		server: ServerFieldsNoId
	}
	| {
		type: 'mcpanel/remove-server',
		serverId: string
	}
	| {
		type: 'mcpanel/update-server',
		// server: ServerRecord
		// server: any
		server: ServerFields
	}
	| {
		type: 'mcpanel/select-server',
		serverId: string
	}
	| {
		type: 'mcpanel/add-server-entries',
		// serverEntries: Immutable.Map<string, ServerRecord>
		// serverEntries: any
		serverEntries: { [key: string]: ServerFields }
	}
	| {
		type: 'mcpanel/power-server',
		powerAction: ('start' | 'restart' | 'stop')
	}
	| {
		type: 'mcpanel/start-polling-api',
		serverId: string
	}
	| {
		type: 'mcpanel/stop-polling-api',
		serverId: string
	}
	// | {
	// 	type: 'mcpanel/send-console-command',
	// 	command: string
	// }
	// | {
	// 	type: 'mcpanel/update-console-log',
	// 	log: string
	// }
	;
