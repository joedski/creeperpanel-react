Creeperpanel in React
=====================

Reimplementing the Creeperpanel in Electron using React for the UI.

UI must be built from source before running Electron so as to translate the React stuff.  Run `gulp` for this.



TODO
----

- [Online/Offline detection](http://electron.atom.io/docs/v0.36.7/tutorial/online-offline-events/)
- Refactor to Flux style architecture, or at least something more resembling Elm.  Basically just Action, Dispatch, Store, View.
- Players in the players list are objects, not just strings.



Other Notes
-----------

- If a MC instance is not running, calls to it for, say, the console log will return an unsuccessful API call with the message "Server is not running."  The raw response is:
	- `{"status":"error","message":"Server is not running","code":62,"endPoint":"atlanta-api"}`
	- This seems like a possible way to determine if the server is running or not.
	- I don't know if it's always code 62, though, so checking the message may be better.  Or not.  Who knows.
