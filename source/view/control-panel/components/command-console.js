import React from 'react';
import classNames from 'classnames';

export const CommandConsole = React.createClass({
	render() {
		return (
			<div className="chcp-console">
				<ConsoleLog/>
				<ConsoleCommandInput/>
			</div>
		);
	}
});

export const ConsoleLog = React.createClass({
	render() {
		return (
			<div className="chcp-consolelog">
				<div className="chcp-consolelog-logcontainer">{ this.renderLogLines() }</div>
			</div>
		);
	},

	renderLogLines() {
		return [];
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
			disabled: ! this.state.commandText
		});

		return (
			<div className="chcp-consolecommandinput">
				<form onSubmit={ this.handleSubmit } className="chcp-consolecommandinput-form">
					<div className="input-group">
						<input type="text" className="chcp-consolecommandinput-input form-control"
							placeholder="Command"
							// value={ this.state.commandText }
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

	handleSubmit( event ) {},

	handleCommandChange( event ) {}
});

export default CommandConsole;
