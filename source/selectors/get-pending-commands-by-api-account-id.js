import { createSelector } from 'reselect';

// Leaving sorting to the views for now.
const getPendingCommands = ( state ) => state.get( 'pendingCommands' );

const getPendingCommandsByAPIAccountId = createSelector(
	[ getPendingCommands ],
	( pendingCommands ) => pendingCommands.groupBy( ( pc ) => pc.get( 'apiAccountId' ) )
);

export default getPendingCommandsByAPIAccountId;
