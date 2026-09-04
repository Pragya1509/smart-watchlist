import { StrategyFunction } from '../strategy/strategyFunction';
/**
 * Strategy info.
 */
export interface StrategyInfo {
    name: string;
    strategy: StrategyFunction;
}
/**
 * Strategy infos.
 */
export declare const STRATEGY_INFOS: StrategyInfo[];
