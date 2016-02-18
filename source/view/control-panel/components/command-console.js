import React from 'react';
import classNames from 'classnames';

import { sendAction } from '../controller-view-comm';

export const CommandConsole = React.createClass({
	render() {
		return (
			<div className="chcp-commandconsole">
				<ConsoleLog
					state={ this.props.state }
					/>
				<ConsoleCommandInput
					onCommand={ this.handleCommand }
					/>
			</div>
		);
	},

	handleCommand( commandText ) {
		sendAction({
			type: 'mcpanel/send-console-command',
			serverId: this.props.state.currentServer,
			command: commandText
		});
	}
});

export const ConsoleLog = React.createClass({
	render() {
		return (
			<div className="chcp-commandconsolelog">
				<div className="chcp-commandconsolelog-logcontainer">{ this.renderLogLines() }</div>
			</div>
		);
	},

	renderLogLines() {
		let serverInfo = this.props.state.serverInfos[ this.props.state.currentServer ];

		if( ! serverInfo ) {
			return [];
		}

		let logLines = this.props.state.serverInfos[ this.props.state.currentServer ].log;
		
		return logLines.map( ( lineText, i ) => (
			<div
				key={ i }
				className="chcp-commandconsolelogline logline-default"
				>
				{ lineText }
			</div>
		));
	}
});

export const ConsoleCommandInput = React.createClass({
	getInitialState() {
		return {
			commandText: ''
		};
	},

	render() {
		let sendButtonClassnames = classNames( 'btn', 'btn-primary', {
			disabled: ! this.state.commandText.trim()
		});

		return (
			<div className="chcp-commandconsoleinput">
				<form onSubmit={ this.handleSubmit } className="chcp-commandconsoleinput-form">
					<div className="input-group">
						<input type="text" className="chcp-commandconsoleinput-input form-control"
							placeholder="Command"
							value={ this.state.commandText }
							onChange={ this.handleCommandChange }
						/>
						<div className="input-group-btn">
							<input type="submit"
								value="Send"
								className={ sendButtonClassnames }
							/>
						</div>
					</div>
				</form>
			</div>
		);
	},

	handleSubmit( event ) {
		// sendAction({
		// 	type: 'mcpanel/send-console-command',
		// 	serverId: this.props.state.currentServer,
		// 	command: string
		// });

		event.preventDefault();

		let commandText = this.state.commandText.trim();

		this.setState({ commandText: '' });

		if( commandText ) {
			this.props.onCommand( commandText );
		}
	},

	handleCommandChange( event ) {
		this.setState({ commandText: event.target.value });
	}
});

export default CommandConsole;
