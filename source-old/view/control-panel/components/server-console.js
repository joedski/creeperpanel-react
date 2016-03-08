import React from 'react';
import classNames from 'classnames';

import CommandConsole from './command-console';
import ConsoleSideBar from './console-side-bar';

export const ServerConsole = React.createClass({
	render() {
		return (
			<div className="chcp-serverconsole">
				<CommandConsole
					state={ this.props.state }
					/>
				<ConsoleSideBar
					state={ this.props.state }
					/>
			</div>
		);
	}
});

export default ServerConsole;
