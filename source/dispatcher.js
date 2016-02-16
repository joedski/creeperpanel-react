
import Dispatcher from 'flux/lib/Dispatcher';
import Action from './actions';

const instance :Dispatcher<Action> = new Dispatcher();
export default instance;
export const dispatch = instance.dispatch.bind( instance );
