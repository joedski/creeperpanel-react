Tracking API Watches
====================

One result of centralizing app state into Stores is that anything that has to actually interact between systems is available to all systems.  This also means things such as little autonomous watchers that poll an API server periodically have to have something to actually result in activity.

A result of this regarding API pollers specifically is that if we track Active Pollers as one of the Stores, all parts of the App can look at what Active Pollers are as well as what their most recent results were.  In our case, there can be a one-to-one correspondence with Server IDs and Active Pollers, since one Server ID corresponds to one and only one API Key/Secret Pair.  If multiple windows end up viewing the same server, they all see the same results, and all receive updates to those results at the same time.

Outline of process.
- Creating or Removing APIPollers
	- Action Producer dispatches a new action requesting the start of a new polling of the remote API.
	- ServerPollerStore receives Action
	- ServerPollerStore merges new Poller into State which lists existing Pollers. (probably by Server ID.)
	- If the new Poller really is new, then ServerPollerStore will indicate it has changed.
	- Actual PollerController will then reconcile existing Polling Implementations to match the list in the Store.
		- Ones it does not have will be added.
		- Ones it does have, but which are not in the Store, are deleted.
		- Ones both it and the Store have are left as is.
	- Exact timing details and whatnot are internal to the PollerController.
- Executing APIPollers
	- ServerInfoStore holds whatever the current information is.
	- A PollerImplementation in PollerController receives a response from the API Server.
		- The PollerImplementation then dispatches an Action with the info to update for a given ServerInfoStore's key.
	- ServerInfoStore receives an Action indicating some info should be updated.
		- ServerInfoStore updates this information.

Other Questions:
- Should creating an APIPoller lead to creating an entry in both ServerPollerStore and ServerInfoStore?
	- I don't see why not, they can both respond to the same action, and it's not like they actually depend on info from eachother.
	- Additionally, since what record fields are available must be known somewhere, creating an initial record with default values is plenty doable.



Store
-----

ServerInfoStore
- Key: serverId
	- info: ServerInfo - Composit info received by querying the APIs for a given server.

APIWatcherStore: Just a set of serverIds that are being watched.  maybe more info should be stored than just what watchers exist?



Actions
-------

Well, there'll be one kind of action for each API end point, which updates the stuff it updates.  Yup.
