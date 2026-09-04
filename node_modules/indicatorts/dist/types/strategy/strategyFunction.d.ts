import { Action } from './action';
import { Asset } from './asset';
/**
 * Strategy function.
 */
export type StrategyFunction = (asset: Asset) => Action[];
