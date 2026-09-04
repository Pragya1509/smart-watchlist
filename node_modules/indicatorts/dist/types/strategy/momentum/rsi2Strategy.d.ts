import { Asset } from '../asset';
import { Action } from '../action';
/**
 * RSI 2. When 2-period RSI moves below 10, it is considered deeply oversold,
 * and the other way around when moves above 90.
 *
 * @param asset asset object.
 * @returns strategy actions.
 */
export declare function rsi2Strategy(asset: Asset): Action[];
