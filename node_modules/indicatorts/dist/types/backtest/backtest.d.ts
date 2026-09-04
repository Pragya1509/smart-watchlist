import { Asset } from '../strategy/asset';
import { StrategyInfo } from './strategyInfo';
import { StrategyResult } from './strategyResult';
/**
 * Backtests the given strategies.
 *
 * @param asset asset object.
 * @param infos strategy infos.
 * @return strategy results.
 */
export declare function backtest(asset: Asset, infos: StrategyInfo[]): StrategyResult[];
