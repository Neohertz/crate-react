import React, { Binding, useBinding, useState } from "@rbxts/react";
import { Crate, InferCrateType } from "@rbxts/crate";

/**
 * Fetch and memoize the crate's state using a selector.
 * Instead of returning a state like `useCrate()`, this method instead returns a binding.
 * @param crate Crate Object
 * @param selector Selector to narrow down crate state.
 * @returns Binding<T>
 */
function useCrateBinding<T extends Crate<{}>, K extends InferCrateType<T>, R>(
	crate: T,
	selector: (state: K) => R,
): Binding<R> {
	const latestSelector = React.useRef(selector);
	const didMount = React.useRef(true);

	const [state, setState] = useBinding<Readonly<R>>(crate.getState(selector as never));

	React.useEffect(() => {
		if (didMount.current) {
			didMount.current = false;
		} else {
			setState(crate.getState(selector as never));
			latestSelector.current = selector;
		}
	}, [selector]);

	React.useEffect(() => {
		const connection = crate.onUpdate(latestSelector.current as never, (object: unknown) =>
			setState(object as never),
		);

		return () => connection.Disconnect();
	}, [crate]);

	return state as any;
}

export default useCrateBinding;
