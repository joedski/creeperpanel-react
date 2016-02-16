import EventEmitter from 'events';
import { inherits } from 'util';

import React from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';

import themer from 'app-themer';
// import { searchParams } from 'app-util';
import comm from './controller-view-comm';

themer.write( 'default', window.document );
// const params = searchParams( window );
// const comm = new ControllerViewComm();



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
		let serversArray = this.getStateServersArray();
		let child;

		return (
			(serversArray && serversArray.length) ?
				serversArray.map( ( s, i ) => <div key={ s.id }>{ s.title }</div> )
				: [<div key="-1">(no servers)</div>]
		);

		// if( ! this.state.addingServer ) {
		// 	return (
		// 		<ServerSelect
		// 			servers={ this.state.servers }
		// 			currentServer
		// 	);
		// }
	},

	getStateServersArray() {
		return Object.keys( this.state.servers )
			.map( ( key ) => this.state.servers[ key ] )
			;
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
