/*
If trying to indicate a one time load,
a separate boolean value should be stored somewhere in the state.
*/

/*
IDLE indicates that a given item is not in the middle of a request to a server or hard drive
or other slow process.

This should be the initial status value, and is also the value that should be set
when a service came back successful.
*/
export const IDLE = 'IDLE';

/*
REQUESTED indicates that a request has been made to a server or other slow/async process.
*/
export const REQUESTED = 'REQUESTED';

/*
ERRORED indicates an error occurred during the process of requesting this service.
*/
export const ERRORED = 'ERRORED';
