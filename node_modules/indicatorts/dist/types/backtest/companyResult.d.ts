import { StrategyResult } from './strategyResult';
import { CompanyInfo } from '../company/companyInfo';
/**
 * Company result.
 */
export interface CompanyResult {
    companyInfo: CompanyInfo;
    strategyResults: StrategyResult[];
}
/**
 * Company result sort by.
 */
export declare enum CompanyResultSortBy {
    SYMBOL = 0,
    NAME = 1,
    STRATEGY = 2,
    GAIN = 3,
    ACTION = 4
}
/**
 * Sorts the company results.
 *
 * @param companyResults company results.
 * @param sortBy sort by.
 * @param ascending toggle.
 * @return sorted results.
 */
export declare function sortCompanyResults(companyResults: CompanyResult[], sortBy: CompanyResultSortBy, ascending: boolean): CompanyResult[];
