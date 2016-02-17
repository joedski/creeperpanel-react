Actions, Stores, and Immutable.js
=================================

So I wanted to use Immutable to guarantee that data wasn't being munged from anywhere else.  I suppose technically this is doable, but since I'm involving IPC due to actions being passed between Render Processes and the Main Process, objects in one context don't make the journey wholly intact.

This presents two options that I can think of:
- Eagerly transform action parameters at time of reception.
- Transform action parameters at the Store level.

Currently I'm going with the latter, as the former could theoretically mean duplicated transforms.  I suppose another option would be to have a set of Action Transformer functions which do this, but one would have to remember to run them.

A result of that, though, would mean there are effectively two action types:
- Actions with plain JS objects.
- Actions with Immutable objects.

Between that and just doing all the JS->Immutable conversion in the Store's own code, I've decided to just do the latter.

An action transformer may still be useful, though, if I find myself repeating too many such JS->Immutable conversions between different stores.  Or even in the same Store's action appliers.

One last note: The current strategy results in two facts that must be respected when dealing with Stores:
- all values flowing into any Stores are plain JS objects.
- all direct calls to any Store's `getState()` method returns Immutable objects.

Perhaps a `getStateAsJS()` method is in order?
