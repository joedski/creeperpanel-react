import { createStore, applyMiddleware } from 'redux';
import { creeperpanel } from './reducers';
import thunk from 'redux-thunk';
import reduxLogger from 'redux-logger';

import electron from 'electron';
const app = electron.app;



//////// Small demo.

import * as actions from './actions';

app.on( 'ready', () => {
	let logger = reduxLogger();

	let store = createStore(
		creeperpanel,
		applyMiddleware(
			thunk,
			logger
		)
	);

	store.dispatch( actions.configLoad() );

	// Don't quit early or else it terminates the async stuff, including file loads :P
	// app.quit();
});
