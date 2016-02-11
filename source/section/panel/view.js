// View code for Panel.

import React from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';

import { ipcRenderer as ipc } from 'electron';

import themer from 'app-themer';

console.log( 'Test.' );
themer.write( 'default', window.document );

const searchParams = new Map(
	window.location.search
		.replace( /^\?/, '' )
		.split( '&' )
		.map( pairString => {
			return pairString.split( '=' );
		})
);



////////

const Console = React.createClass({
	render() {
		return (
			<div className="chcp-console">
				<ConsoleLog log={ this.props.log }/>
				<ConsoleCommandInput onCommand={ this.handleCommand }/>
			</div>
		);
	},

	handleCommand( command ) {
		// console.log( `Console: Received command: "${ command.text }"` );
		this.props.onCommand( command );
	}
});

////

const ConsoleLog = React.createClass({
	render() {
		return (
			<div className="chcp-consolelog">
				<div className="chcp-consolelog-logcontainer">{ this.renderLogLines() }</div>
			</div>
		);
	},

	renderLogLines() {
		// NOTE: Need a better key.  Not sure what to do about this, though.
		return this.props.log.map( ( logLine, i ) =>
			<ConsoleLogLine key={ i } text={ logLine } />
		);
	}
});

////

const ConsoleLogLine = React.createClass({
	render() {
		return (
			<div className="chcp-consolelogline">{ this.props.text }</div>
		);
	}
});

////

const ConsoleCommandInput = React.createClass({
	getInitialState() {
		return {
			text: ''
		};
	},

	render() {
		return (
			<div className="chcp-consolecommandinput">
				<form onSubmit={ this.handleSubmit } className="chcp-consolecommandinput-form">
					<input type="text" className="chcp-consolecommandinput-input"
						placeholder="Command"
						value={ this.state.text }
						onChange={ this.handleCommandChange }
					/>
					<input type="submit"
						value="Send"
					/>
				</form>
			</div>
		)
	},

	handleSubmit( event ) {
	    event.preventDefault();

		let text = this.state.text.trim();

		if( ! text ) return;

		this.props.onCommand({ text });

		this.setState({
			text: ''
		});
	},

	handleCommandChange( event ) {
		this.setState({ text: event.target.value });
	},
});



////////

const Stats = React.createClass({
	getFractionOf( stat ) {
		return stat.used / stat.total;
	},

	render() {
		// Obviously very FPO.
		return (
			<div className="chcp-stats">
				<div>RAM: { this.getFractionOf( this.props.stats.ram ) * 100 << 0 }%</div>
				<div>CPU: { this.getFractionOf( this.props.stats.cpu ) * 100 << 0 }%</div>
				<div>HDD: { this.getFractionOf( this.props.stats.hdd ) * 100 << 0 }%</div>
				<div>{ this.props.players.join( ', ' ) }</div>
			</div>
		);
	}
});



////////

const ServerSelect = React.createClass({
	getInitialState() {
		return {
			currentServer: this.props.currentServer
		};
	},

	render() {
		let chooseButtonClassNames = classNames( 'btn', 'btn-primary', {
			'disabled': ! this.props.servers.length || this.state.currentServer == -1
		});

		return (
			<div className="chcp-serverselect">
				<div className="chcp-serverselect-serverlist">
					<ul>
						{ this.renderOptions() }
					</ul>
				</div>
				<div className="chcp-serverselect-controls">
					<button type="button"
						className={ chooseButtonClassNames }
						onClick={ this.handleChooseClick }
						>
						Choose Server
					</button>
				</div>
			</div>
		);
	},

	renderOptions() {
		if( ! this.props.servers ) {
			return (
				[ <li className="disabled" key="-1">(Loading servers...)</li> ]
			);
		}

		return this.props.servers.map( ( server, i ) => {
			let optionClassNames = classNames({
				'selected': i == this.state.currentServer
			});

			return (
				<li key={ i }
					classNames={ optionClassNames }
					onClick={ this.handleOptionClick }
					>
					{ server.title }
				</li>
			);
		});
	},

	handleOptionClick( event ) {
		this.setState({ currentServer: parseInt( event.target.getAttribute( 'key' ), 10 ) });
	},

	handleChooseClick( event ) {
		this.props.onSelect( this.state.currentServer );
	}
});



////////

const Panel = React.createClass({
	getInitialState() {
		return {
			log: [],
			players: [],
			// Percent. (0.0 ~ 100.0)
			cpu: { free: 0, used: 0, total: 0 },
			// Gigs
			ram: { free: 0, used: 0, total: 0 },
			// Bytes?  Blocks?  Something.
			hdd: { free: 0, used: 0, total: 0 },
			servers: [],
			currentServer: -1
		};
	},

	getOSStats() {
		return { cpu: this.state.cpu, ram: this.state.ram, hdd: this.state.hdd };
	},

	componentDidMount() {
		this.connectIPC();
	},

	render() {
		let children;

		if( this.state.currentServer == -1 ) {
			children = this.renderServerSelect();
		}
		else {
			children = this.renderServerPanel();
		}

		return (
			<div className="chcp-panel">
				{ children }
			</div>
		);
	},

	renderServerSelect() {
		return (
			<ServerSelect
				servers={ this.state.servers }
				currentServer={ this.state.currentServer }
				onSelect={ this.handleServerSelect }
				/>
		);
	},

	renderServerPanel() {
		return ([
			<Console log={ this.state.log } onCommand={ this.handleConsoleCommand }/>,
			<Stats stats={ this.getOSStats() } players={ this.state.players }/>
		]);
	},

	connectIPC() {
		ipc.on( 'panel-model-update', this.updateStateFromPanelModel );
		ipc.send( 'panel-model-request' );
	},

	updateStateFromPanelModel( event, model ) {
		this.setState( model );
	},

	handleConsoleCommand( command ) {
		ipc.send( 'panel-command', command );
	},

	handleServerSelect( serverSelection ) {
		// Set it eagerly
		// then tell the controller
		// then wait for an update from the controller.
		this.setState({ currentServer: serverSelection });
		ipc.send( 'panel-server-select', serverSelection );
	}
});



////////

ReactDOM.render(
	<Panel/>,
	window.document.getElementById( 'view' )
);
