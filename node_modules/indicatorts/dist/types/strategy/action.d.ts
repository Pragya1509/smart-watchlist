/**
 * Strategy action.
 */
export declare enum Action {
    SELL = -1,
    HOLD = 0,
    BUY = 1
}
/**
 * Reverses the given actions.
 * @param actions strategy actions.
 * @return reversed actions.
 */
export declare function reverseActions(actions: Action[]): Action[];
/**
 * Apply the actions on the closing values to calculate gains.
 *
 * @param closings closing values.
 * @param actions strategy actions.
 * @return strategy gains.
 */
export declare function applyActions(closings: number[], actions: Action[]): number[];
