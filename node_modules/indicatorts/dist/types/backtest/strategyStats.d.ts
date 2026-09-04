import { CompanyResult } from './companyResult';
import { StrategyInfo } from './strategyInfo';
/**
 * Strategy stats.
 */
export interface StrategyStats {
    strategyInfo: StrategyInfo;
    score: number;
    minGain: number;
    maxGain: number;
    averageGain: number;
}
/**
 * Computes the strategy stats.
 *
 * @param companyResults company results.
 * @return stats array.
 */
export declare function computeStrategyStats(companyResults: CompanyResult[]): StrategyStats[];
/**
 * Strategy stats sort by.
 */
export declare enum StrategyStatsSortBy {
    STRATEGY = 0,
    SCORE = 1,
    MIN = 2,
    MAX = 3,
    AVERAGE = 4
}
/**
 * Sorts the strategy stats.
 *
 * @param strategyStats strategy stats.
 * @param sortBy sort by.
 * @param ascending ascending toggle.
 * @return sorted stats.
 */
export declare function sortStrategyStats(strategyStats: StrategyStats[], sortBy: StrategyStatsSortBy, ascending: boolean): StrategyStats[];
