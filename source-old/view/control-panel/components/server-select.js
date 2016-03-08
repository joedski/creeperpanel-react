import React from 'react';
import classNames from 'classnames';

// import comm from './controller-view-comm';

export const ServerSelect = React.createClass({
	getInitialState() {
		return {
			currentServer: this.props.currentServer
		};
	},

	getServersInOrder() {
		let servers = Object.keys( this.props.servers ).map( key => this.props.servers[ key ] );
		servers.sort( ( a, b ) => {
			let alc = a.toLowerCase(), blc = b.toLowerCase();

			if( alc < blc ) return -1;
			else if( alc > blc ) return 1;
			else return 0;
		});
		return servers;
	},

	render() {
		let addButtonClassNames = classNames( 'btn', 'btn-secondary' );

		let chooseButtonClassNames = classNames( 'btn', 'btn-primary', {
			'disabled': ! this.getServersInOrder().length || ! this.state.currentServer
		});

		return (
			<div className="chcp-serverselect">
				<div className="chcp-serverselect-serverlist">
					<div className="scroll-container">
						<ul>
							{ this.renderOptions() }
						</ul>
					</div>
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
			return [
				<li className="disabled chcp-serverselectoption chcp-serverselectoption-none" key="-1">
					(Loading servers...)
				</li>
			];
		}

		let servers = this.getServersInOrder();

		if( ! servers.length ) {
			return [
				<li className="disabled chcp-serverselectoption chcp-serverselectoption-none" key="-1">
					(You have no servers!  Add one!)
				</li>
			];
		}

		return servers.map( ( server, i ) => {
			return (
				<ServerSelectOption key={ server.id }
					isCurrentOption={ server.id == this.state.currentServer }
					server={ server }
					onSelect={ () => { this.handleOptionSelect( server.id ); } }
					/>
			);
		});
	},

	handleOptionSelect( serverId ) {
		this.setState({ currentServer: serverId });
	},

	handleChooseClick( event ) {
		this.props.onChooseServer( this.state.currentServer );
	},

	handleAddClick( event ) {
		this.props.onWantToAddServer();
	}
});

export const ServerSelectOption = React.createClass({
	render() {
		let optionClassNames = classNames( 'chcp-serverselectoption', {
			'active': this.props.isCurrentOption
		});

		let buttonClassNames = classNames( 'btn', 'btn-secondary', 'btn-block', {
			'active': this.props.isCurrentOption
		});

		return (
			<li data-server={ this.props.server.id }
				classNames={ optionClassNames }
				>
				<button type="button"
					data-server={ this.props.server.id }
					className={ buttonClassNames }
					onClick={ this.handleOptionClick }
					>{ this.props.server.title }</button>
			</li>
		);
	},

	handleOptionClick( event ) {
		this.props.onSelect( this.props.server.id );
	}
});

export default ServerSelect;
