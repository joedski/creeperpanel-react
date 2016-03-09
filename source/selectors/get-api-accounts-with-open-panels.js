import { createSelector } from 'reselect';

/*
Used to determine which API Accounts need to have watches created for them.
*/

const getAPIAccounts = state => state.apiAccounts;
const getPanels = state => state.getPanels;

const getAPIAccountsWithOpenPanels = createSelector(
	[ getAPIAccounts, getPanels ],
	( apiAccounts, panels ) =>
		apiAccounts.filter( acc => panels.find( p => p.apiAccountId == acc.id ) )
);

export default getAPIAccountsWithOpenPanels;
