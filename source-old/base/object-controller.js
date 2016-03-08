import Immutable from 'immutable';
import FluxStoreGroup from 'flux/lib/FluxStoreGroup';

// Small utility class to remove some boiler plate when controlling plain objects.

export default function ObjectController() {
	if( ! (typeof this.__proto__.constructor.getStores == 'function') ) {
		let error = new Error( `ObjectController ${ String( this.__proto__.constructor ) } must define the static method 'getStores'` );
		throw error;
	}

	this.addStoreListeners();
}

Object.assign( ObjectController.prototype, {
	addStoreListeners() {
		let stores = this.__proto__.constructor.getStores();
		let changed = false;

		let setChanged = () => { changed = true; };

		this.storeSubscriptions = stores
			.map( store => store.addListener( setChanged ) )
			;

		let handleDispatchComplete = () => {
			if( changed ) {
				this.handleStateChanged();
			}

			changed = false;
		};

		this.storeGroup = new FluxStoreGroup( stores, handleDispatchComplete );
	},

	handleStateChanged() {
		let error = new Error( `ObjectController ${ String( this.__proto__.constructor ) } must override the prototype/instance method 'handleStateChanged'` );
	},

	release() {
		this.storeGroup.release();
	}
});
