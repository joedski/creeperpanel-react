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
					<PlayersList
						players={ this.getPlayerList() }
					/>
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

	getPlayerList() {
		// Race condition: the serverInfo for a server may or may not be created yet...
		let serverInfo = this.props.state.serverInfos[ this.props.state.currentServer ];

		if( ! serverInfo ) {
			return [];
		}

		return serverInfo.players;
	}
});

export const PlayersList = React.createClass({
	render() {
		return (
			<div className="chcp-playerslist">
				<ul>{ this.renderPlayerItems() }</ul>
			</div>
		);
	},

	renderPlayerItems() {
		let players = this.props.players;

		if( ! players.length ) {
			return [
				<li className="disabled">(No players on at the moment!)</li>
			];
		}

		return players.map( p => (
			<li>{ p.name }</li>
		));
	}
});

export default ConsoleSideBar;
