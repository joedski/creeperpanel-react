// View code for Panel.

// import EventEmitter from 'events';
// import { inherits } from 'util';

import React from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';

import { ipcRenderer as ipc } from 'electron';
// import { searchParams } from 'app-util'

import themer from 'app-themer';

console.log( 'Test.' );
themer.write( 'default', window.document );

// const params = searchParams( window );



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
					<div className="input-group">
						<input type="text" className="chcp-consolecommandinput-input form-control"
							placeholder="Command"
							value={ this.state.text }
							onChange={ this.handleCommandChange }
						/>
						<div className="input-group-btn">
							<input type="submit"
								value="Send"
								className="btn btn-primary"
							/>
						</div>
					</div>
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
		// let coverClassNames = classNames( 'chcp-stats-servercontrols-cover', 'fade', {
		// 	'in': !! this.props.currentServerAction
		// });

		let startButtonClassNames = classNames( 'btn', 'btn-block', 'btn-success', {
			'disabled': !! this.props.currentServerAction
		});

		let restartButtonClassNames = classNames( 'btn', 'btn-block', 'btn-warning', {
			'disabled': !! this.props.currentServerAction
		});

		let stopButtonClassNames = classNames( 'btn', 'btn-block', 'btn-danger', {
			'disabled': !! this.props.currentServerAction
		});

		// Obviously very FPO.
		return (
			<div className="chcp-stats">
				<div className="chcp-stats-stats">
					{/*<div>RAM: { this.getFractionOf( this.props.stats.ram ) * 100 << 0 }%</div>
					<div>CPU: { this.getFractionOf( this.props.stats.cpu ) * 100 << 0 }%</div>
					<div>HDD: { this.getFractionOf( this.props.stats.hdd ) * 100 << 0 }%</div>*/}
					<div>{ this.props.players.join( ', ' ) || "(Nobody on!)" }</div>
				</div>
				<div className="chcp-stats-servercontrols">
					{/*<div className={ coverClassNames }>
						<span>{ this.coverMessage() }</span>
					</div>*/}
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
			this.props.onServerPowerAction( action );
		}
	},

	// coverMessage() {
	// 	if( ! this.props.currentServerAction ) {
	// 		return '';
	// 	}

	// 	let action = this.props.currentServerAction.action;

	// 	return ({
	// 		'start': `Server is starting...`,
	// 		'stop': `Server is being stopped...`,
	// 		'restart': `Server is being restarted...`
	// 	}[ action ] || `Server is doing something...` );
	// }
});



////////

const ServerSelect = React.createClass({
	getInitialState() {
		return {
			currentServer: this.props.currentServer,
			// addingServer: false
		};
	},

	render() {
		let addButtonClassNames = classNames( 'btn', 'btn-secondary' );

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
					<div className="controlsgroup controlsgroup-left">
						<button type="button"
							className={ addButtonClassNames }
							onClick={ this.handleAddClick }
							>
							Add Server
						</button>
					</div>
					<div className="controlsgroup controlsgroup-right">
						<button type="button"
							className={ chooseButtonClassNames }
							onClick={ this.handleChooseClick }
							>
							Choose Server
						</button>
					</div>
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
				'active': i == this.state.currentServer
			});

			let buttonClassNames = classNames( 'btn', 'btn-secondary', 'btn-block', {
				'active': i == this.state.currentServer
			});

			return (
				<li key={ i }
					data-server={ i }
					classNames={ optionClassNames }
					>
					<button type="button"
						data-server={ i }
						className={ buttonClassNames }
						onClick={ this.handleOptionClick }
						>{ server.title }</button>
				</li>
			);
		});
	},

	handleOptionClick( event ) {
		this.setState({ currentServer: parseInt( event.target.getAttribute( 'data-server' ), 10 ) });
	},

	handleChooseClick( event ) {
		this.props.onSelect( this.state.currentServer );
	},

	handleAddClick( event ) {
		this.props.onWantToAddServer();
	}
});

////

const ServerAdd = React.createClass({
	getInitialState() {
		return {
			serverTitle: '',
			serverKey: '',
			serverSecret: ''
		};
	},

	render() {
		let cancelButtonClassNames = classNames( 'btn', 'btn-warning' );

		let addButtonClassNames = classNames( 'btn', 'btn-success', {
			'disabled': ! this.allValuesFilled()
		});

		return (
			<div className="chcp-serverselect">
				<div className="chcp-serverselect-addform">
					<fieldset className="form-group">
						<label htmlFor="input-server-title">Server Title</label>
						<input type="text" id="input-server-title" className="form-control"
							placeholder="The Best Server in the Universe..."
							onChange={ this.handleServerTitleChange }
							/>
					</fieldset>
					<fieldset className="form-group">
						<label htmlFor="input-server-key">API Key</label>
						<input type="text" id="input-server-key" className="form-control"
							placeholder="...@Instance.playat.ch"
							onChange={ this.handleServerKeyChange }
							/>
					</fieldset>
					<fieldset className="form-group">
						<label htmlFor="input-server-secret">API Secret</label>
						<input type="text" id="input-server-secret" className="form-control"
							placeholder="..."
							onChange={ this.handleServerSecretChange }
							/>
					</fieldset>
				</div>
				<div className="chcp-serverselect-controls">
					<div className="controlsgroup controlsgroup-left">
						<button type="button"
							className={ cancelButtonClassNames }
							onClick={ this.handleCancelClick }
							>
							Cancel
						</button>
					</div>
					<div className="controlsgroup controlsgroup-right">
						<button type="button"
							className={ addButtonClassNames }
							onClick={ this.handleAddClick }
							>
							Add This Server
						</button>
					</div>
				</div>
			</div>
		);
	},

	allValuesFilled() {
		return !! this.state.serverTitle && !! this.state.serverKey && !! this.state.serverSecret;
	},

	handleServerTitleChange( event ) {
		this.setState({
			serverTitle: event.target.value
		});
	},

	handleServerKeyChange( event ) {
		this.setState({
			serverKey: event.target.value
		});
	},

	handleServerSecretChange( event ) {
		this.setState({
			serverSecret: event.target.value
		});
	},

	handleCancelClick( event ) {
		this.props.onCancelServerAdd();
	},

	handleAddClick( event ) {
		let server = {
			title: this.state.serverTitle,
			key: this.state.serverKey,
			secret: this.state.serverSecret
		};

		this.setState({
			serverTitle: '',
			serverKey: '',
			serverSecret: ''
		});

		this.props.onServerAdd( server );
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
			currentServer: -1,
			addingServer: false
		};
	},

	getOSStats() {
		return { cpu: this.state.cpu, ram: this.state.ram, hdd: this.state.hdd };
	},

	componentDidMount() {
		controllerComms.onModelUpdate( ( model ) => this.setState( model ) );
		controllerComms.sendAction( 'model-request', {} );
	},

	render() {
		let children;

		if( this.state.addingServer ) {
			children = this.renderServerAddForm();
		}
		else if( this.state.currentServer == -1 ) {
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
				onWantToAddServer={ this.handleWantToAddServer }
				/>
		);
	},

	renderServerPanel() {
		// Note: Adding them in an array like this is frowned upon.
		return ([
			<Console log={ this.state.log } onCommand={ this.handleConsoleCommand }/>,
			<Stats
				stats={ this.getOSStats() }
				players={ this.state.players }
				currentServerAction={ this.state.currentServerAction }
				onServerPowerAction={ this.handleServerPowerAction }
				/>
		]);
	},

	renderServerAddForm() {
		return (
			<ServerAdd
				onServerAdd={ this.handleServerAdd }
				onCancelServerAdd={ this.handleCancelServerAdd }
				/>
		)
	},

	handleConsoleCommand( command ) {
		controllerComms.sendAction( 'send-console-command', { command } );
	},

	handleServerSelect( serverSelection ) {
		// Set it eagerly
		// then tell the controller
		// then wait for an update from the controller.
		this.setState({ currentServer: serverSelection });
		controllerComms.sendAction( 'select-server', { serverSelection } );
	},

	handleServerPowerAction( action ) {
		controllerComms.sendAction( 'power-server', { action } );
	},

	handleWantToAddServer() {
		this.setState({ addingServer: true });
	},

	handleServerAdd( server ) {
		this.setState({
			servers: this.state.servers.concat([ server ]),
			addingServer: false
		});

		controllerComms.sendAction( 'add-server', { server });
	},

	handleCancelServerAdd() {
		this.setState({ addingServer: false });
	}
});



let controllerComms = {
	onModelUpdate( handler ) {
		ipc.on( 'model-update', ( event, model ) => {
			handler( model );
		});
	},

	sendAction( action, parameters ) {
		ipc.send( 'ui-action', action, parameters );
	}
};



////////

ReactDOM.render(
	<Panel/>,
	window.document.getElementById( 'view' )
);
