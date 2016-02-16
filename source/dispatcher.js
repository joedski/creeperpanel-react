
import Dispatcher from 'flux/lib/Dispatcher';
import type Action from './actions';

const instance :Dispatcher<Action> = new Dispatcher();
export default instance;
export const dispatch = instance.dispatch.bind( instance );
