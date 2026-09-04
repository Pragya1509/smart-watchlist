import { Asset } from './asset';
import { Action } from './action';
/**
 * Buy and hold strategy.
 *
 * @param asset asset object.
 * @return strategy actions.
 */
export declare function buyAndHoldStrategy(asset: Asset): Action[];
