// @flow

export type Action
	= {
		type: 'mcpanel/add-server',
		server: ServerRecord
	}
	| {
		type: 'mcpanel/remove-server',
		serverId: string
	}
	| {
		type: 'mcpanel/update-server',
		server: ServerRecord
	}
	| {
		type: 'mcpanel/select-server',
		serverId: string
	}
	// | {
	// 	type: 'mcpanel/power-server',
	// 	powerAction: string // 'start' | 'restart' | 'stop'
	// }
	// | {
	// 	type: 'mcpanel/send-console-command',
	// 	command: string
	// }
	// | {
	// 	type: 'mcpanel/update-console-log',
	// 	log: string
	// }
	;
