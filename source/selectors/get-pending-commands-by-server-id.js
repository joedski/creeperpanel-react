import { createSelector } from 'reselect';

// Leaving sorting to the views for now.
const getPendingCommands = ( state ) => state.get( 'pendingCommands' );

const getPendingCommandsByServerId = createSelector(
	[ getPendingCommands ],
	( pendingCommands ) => pendingCommands.groupBy( ( pc ) => pc.get( 'serverId' ) )
);

export default getPendingCommandsByServerId;
