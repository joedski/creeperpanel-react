// @flow

import Immutable from 'immutable';
// import type ServerRecord from 'records/server';

type ServerFields = { id: string, title: string, key: string, secret: string };
type ServerFieldsNoId = { title: string, key: string, secret: string };

export type Action
	// Adding/Removing servers
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
	// Making servers do things
	| {
		type: 'mcpanel/power-server',
		serverId: string,
		powerAction: ('start' | 'restart' | 'stop')
	}
	| {
		type: 'mcpanel/send-console-command',
		serverId: string,
		command: string
	}
	// Watching servers
	| {
		type: 'mcpanel/start-polling-api',
		serverId: string
	}
	| {
		type: 'mcpanel/stop-polling-api',
		serverId: string
	}
	// Info about servers
	| {
		type: 'chapi/update-log',
		serverId: string,
		log: Array<any>
	}
	| {
		type: 'chapi/update-players',
		serverId: string,
		log: Array<any>
	}
	// | {
	// 	type: 'mcpanel/update-console-log',
	// 	log: string
	// }
	;
