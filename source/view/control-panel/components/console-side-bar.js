import React from 'react';
import classNames from 'classnames';

import { sendAction } from '../controller-view-comm';

export const ConsoleSideBar = React.createClass({
	render() {
		let startButtonClassNames = classNames( 'btn', 'btn-block', 'btn-success', {
			'disabled': !! this.props.state.currentServerPowerAction
		});

		let restartButtonClassNames = classNames( 'btn', 'btn-block', 'btn-warning', {
			'disabled': !! this.props.state.currentServerPowerAction
		});

		let stopButtonClassNames = classNames( 'btn', 'btn-block', 'btn-danger', {
			'disabled': !! this.props.state.currentServerPowerAction
		});

		// TODO: Use CSSTransitionGroup or something to make a dynamically added pop-over.
		return (
			<div className="chcp-sidebar">
				<div className="chcp-sidebar-stats">
					<PlayersList/>
				</div>
				<div className="chcp-sidebar-servercontrols">
					<div data-action="start"
						onClick={ this.handleServerButtonClick }
						className={ startButtonClassNames }
						>Start Server</div>
					<div data-action="restart"
						onClick={ this.handleServerButtonClick }
						className={ restartButtonClassNames }
						>Restart Server</div>
					<div data-action="stop"
						onClick={ this.handleServerButtonClick }
						className={ stopButtonClassNames }
						>Stop Server</div>
				</div>
			</div>
		);
	},

	handleServerButtonClick( event ) {
		let action = event.target.getAttribute( 'data-action' );

		if( action ) {
			event.preventDefault();

			// this.props.onServerPowerAction( action );
			sendAction({
				type: 'mcpanel/power-server',
				serverId: this.props.state.currentServer,
				powerAction: action
			});
		}
	},
});

export const PlayersList = React.createClass({
	render() {
		return (
			<div className="chcp-playerslist">Players!</div>
		);
	}
});

export default ConsoleSideBar;
