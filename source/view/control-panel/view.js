import React from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';

import themer from 'app-themer';
import comm from './controller-view-comm';

import ServerSelect from './components/server-select';
import ServerAdd from './components/server-add';



themer.write( 'default', window.document );



const ControlPanel = React.createClass({
	getInitialState() {
		// Hax?
		return Object.assign( comm.state, {
			addingServer: false,
			currentServer: null
		});
	},

	componentDidMount() {
		comm.on( 'state-update', ( state ) => {
			this.setState( state );
		});
	},

	componentWillUnmount() {
		comm.removeListener();
	},

	render() {
		return (
			<div className="chcp-panel">
				{ this.renderChild() }
			</div>
		);
	},

	renderChild() {
		// let child;

		if( this.state.addingServer ) {
			return (
				<ServerAdd
					onAddServer={ this.handleServerAdd }
					onCancel={ this.handleCancelServerAdd }
					/>
			);
		}
		else if( ! this.state.currentServer ) {
			return (
				<ServerSelect
					servers={ this.state.servers }
					currentServer={ this.state.currentServer }
					onChooseServer={ this.handleChooseServer }
					onWantToAddServer={ this.handleWantToAddServer }
					/>
			);
		}
		else {
			return (
				<ServerConsole
					state={ this.state }
					/>
			);
		}
	},

	handleChooseServer( serverId ) {
		this.setState({ currentServer: serverId });

		comm.sendAction({
			type: 'mcpanel/start-polling-api',
			serverId: this.state.currentServer
		});
	},

	handleWantToAddServer() {
		this.setState({ addingServer: true, currentServer: null });
	},

	handleCancelServerAdd() {
		this.setState({ addingServer: false });
	},

	handleServerAdd( server ) {
		this.setState({
			addingServer: false
		});

		comm.sendAction({
			type: 'mcpanel/add-server',
			server: server
		});
	}
});



comm.once( 'state-update:initial', ( state ) => {
	console.log( "Recieved state-update:initial." );
	ReactDOM.render(
		<ControlPanel/>,
		window.document.getElementById( 'view' )
	);
});

comm.sendReady();
