Creeperpanel in React
=====================

Reimplementing the Creeperpanel in Electron using React for the UI.

UI must be built from source before running Electron so as to translate the React stuff.  Run `gulp` for this.



Architectural Outline
---------------------

Like a typical Flux app, various parts of the App produce Actions, which they dispatch through the Dispatcher.  The Dispatcher tells all the Stores this Action occurred, and the Stores update themselves accordingly.  Once that's done, anything which depends on these Stores is notified of changes, and they refresh accordingly.  The cycle begins anew when anything dispatches another Action.

Things which produce Actions include the the Controllers which control Views and the Settings Reader/Writers which deal with persisting settings to the disk.

Because this is an Electron App, the Renderers live in separate Renderer Processes, apart from the Main Process.  This means a Controller and its associated Browser Window are actually in two different realms, and therefore can only communicate asynchronously.

Although ImmutableJS is used for the actual States within the Stores, everything else uses plain JS objects.  This is due trying to keep use of Stores' States uniform through out the app, and is driven primarily by the Controllers living in the Main Process but being associated with Renderer Processes.



TODO
----

- [Online/Offline detection](http://electron.atom.io/docs/v0.36.7/tutorial/online-offline-events/)
- Refactor to Flux style architecture, or at least something more resembling Elm.  Basically just Action, Dispatch, Store, View.
	- Well, Action Producers in general, really, not just View.
- Players in the players list are objects, not just strings.  Fix display of them.
- Actually use Flow to do type checking.
- Add some unit tests.
- Rename `auto/` to `controllers/`, or something else that makes more sense.  It's basically where the viewless controllers are going, as opposed to the viewful controllers in `view/`



Other Notes
-----------

- If a MC instance is not running, calls to it for, say, the console log will return an unsuccessful API call with the message "Server is not running."  The raw response is:
	- `{"status":"error","message":"Server is not running","code":62,"endPoint":"atlanta-api"}`
	- This seems like a possible way to determine if the server is running or not.
	- I don't know if it's always code 62, though, so checking the message may be better.  Or not.  Who knows.
