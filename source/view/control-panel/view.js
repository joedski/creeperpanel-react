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
	// initial state is passed as a prop so that
	// state is defined entirely by the view's controller.
	getInitialState() {
		// return this.props.initialState;
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
		let child;

		return (
			(this.state.servers && this.state.servers.size) ?
				this.state.servers.map( ( s, i ) => <div key={s.id}>s.title</div> )
				: [<div key="-1">(no servers)</div>]
		);

		// if( ! this.state.addingServer ) {
		// 	return (
		// 		<ServerSelect
		// 			servers={ this.state.servers }
		// 			currentServer
		// 	);
		// }
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
