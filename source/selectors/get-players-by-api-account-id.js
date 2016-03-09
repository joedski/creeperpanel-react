import { createSelector } from 'reselect';

// Leaving sorting to the views for now.
// const getPlayers = ( state ) => state.get( 'players' );
const getPlayers = ( state ) => state.players;

const getPlayersByAPIAccountId = createSelector(
	[ getPlayers ],
	( pendingCommands ) => pendingCommands.groupBy( ( pc ) => pc.get( 'apiAccountId' ) )
);

export default getPlayersByAPIAccountId;
