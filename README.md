Creeperpanel in React
=====================

Reimplementing the Creeperpanel in Electron using React for the UI.

UI must be built from source before running Electron so as to translate the React stuff.  Run `gulp` for this.



Architectural Outline
---------------------

Like a typical Flux app, various parts of the App produce Actions, which they dispatch through the Dispatcher.  The Dispatcher tells all the Stores this Action occurred, and the Stores update themselves accordingly.  Once that's done, anything which depends on these Stores is notified of changes, and they refresh accordingly.  The cycle begins anew when anything dispatches another Action.

Things which produce Actions include the the Controllers which control Views and the Settings Reader/Writers which deal with persisting settings to the disk.

Because this is an Electron App, the Renderers live in separate Renderer Processes, apart from the Main Process.  This means a Controller and its associated Browser Window are actually in two different realms, and therefore can only communicate asynchronously.  Thus, Although ImmutableJS is used for the actual States within the Stores, anything dealing with Renderers uses plain JS objects.



TODO
----

- [Online/Offline detection](http://electron.atom.io/docs/v0.36.7/tutorial/online-offline-events/)
- Players in the players list are objects, not just strings.  Fix display of them.
	- `{"status":"success","method":"logScrape","players":[{"name":"atalhlla","rank":1,"style":null,"lastseen":null,"id":null,"steam_id":null}],"endPoint":"buffalo-api"}`
- Actually use Flow to do type checking.
- Add some unit tests.
- Deal with CHAPI errors better. (Currently APIWatcherController/APIWatcher just swallows them which is unhelpful.)
- Consider refactoring all requests to have representation in some Store so that other parts can display info about their status.
	- This could also result in having only one API object per account actually sending requests.
	- It also means rather than having separate stores for Console Commands and Server Power requests, there could be just one which stores API Requests.
	- Could store the request payloads there, (or error messages) while the payloads would be stored elsewhere processed. (in ServerInfoStore etc.)



Other Notes
-----------

- If a MC instance is not running, calls to it for, say, the console log will return an unsuccessful API call with the message "Server is not running."  The raw response is:
	- `{"status":"error","message":"Server is not running","code":62,"endPoint":"atlanta-api"}`
	- This seems like a possible way to determine if the server is running or not.
	- I don't know if it's always code 62, though, so checking the message may be better.  Or not.  Who knows.
