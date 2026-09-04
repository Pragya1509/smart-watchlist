import { IndexEquityInfo, TechnicalIndicators } from './interface';
/**
 *
 * @param indexSymbol
 * @returns
 */
export declare const getGainersAndLosersByIndex: (indexSymbol: string) => Promise<{
    gainers: IndexEquityInfo[];
    losers: IndexEquityInfo[];
}>;
/**
 *
 * @param indexSymbol
 * @returns
 */
export declare const getMostActiveEquities: (indexSymbol: string) => Promise<{
    byVolume: IndexEquityInfo[];
    byValue: IndexEquityInfo[];
}>;
/**
 * Get technical indicators for a specific equity symbol
 * @param symbol - The equity symbol (e.g., 'RELIANCE', 'TCS')
 * @param period - Number of days for historical data (default: 200)
 * @param options - Optional configuration for indicators
 * @returns Promise<TechnicalIndicators>
 */
export declare const getTechnicalIndicators: (symbol: string, period?: number, options?: {
    smaPeriods?: number[];
    emaPeriods?: number[];
    rsiPeriod?: number;
    macdFast?: number;
    macdSlow?: number;
    macdSignal?: number;
    bbPeriod?: number;
    bbStdDev?: number;
    stochK?: number;
    stochD?: number;
    williamsRPeriod?: number;
    atrPeriod?: number;
    adxPeriod?: number;
    cciPeriod?: number;
    mfiPeriod?: number;
    rocPeriod?: number;
    momentumPeriod?: number;
}) => Promise<TechnicalIndicators>;
//# sourceMappingURL=helpers.d.ts.map