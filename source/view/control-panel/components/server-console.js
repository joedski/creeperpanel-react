import React from 'react';
import classNames from 'classnames';

import CommandConsole from './command-console';
import ConsoleSideBar from './console-side-bar';

export const ServerConsole = React.createClass({
	render() {
		<div className="chcp-serverconsole">
			<CommandConsole/>
			<ConsoleSideBar/>
		</div>
	}
});

export default ServerConsole;
