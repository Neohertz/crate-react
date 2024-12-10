import React, { useState } from "@rbxts/react";
import { Crate, InferCrateType } from "@rbxts/crate";

/**
 * Fetch and memoize the crate's state using a selector.
 * @param crate Crate Object
 * @param selector Selector to narrow down crate state.
 * @returns T
 */
function useCrate<T extends Crate<{}>, K extends InferCrateType<T>, R>(crate: T, selector: (state: K) => R): R {
	const latestSelector = React.useRef(selector);
	const didMount = React.useRef(true);

	const [state, setState] = useState<Readonly<R>>(() => {
		return crate.getState(selector as never);
	});

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

export default useCrate;
