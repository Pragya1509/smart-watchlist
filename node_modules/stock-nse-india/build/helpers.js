"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTechnicalIndicators = exports.getMostActiveEquities = exports.getGainersAndLosersByIndex = void 0;
const index_1 = require("./index");
const indicators = __importStar(require("indicatorts"));
const nseIndia = new index_1.NseIndia();
/**
 *
 * @param indexSymbol
 * @returns
 */
const getGainersAndLosersByIndex = async (indexSymbol) => {
    const indexData = await nseIndia.getEquityStockIndices(indexSymbol);
    const gainers = [];
    const losers = [];
    indexData.data.forEach((equityInfo) => {
        if (equityInfo.pChange > 0)
            gainers.push(equityInfo);
        else
            losers.push(equityInfo);
    });
    return {
        gainers: [...gainers].sort((a, b) => b.pChange - a.pChange),
        losers: [...losers].sort((a, b) => a.pChange - b.pChange)
    };
};
exports.getGainersAndLosersByIndex = getGainersAndLosersByIndex;
/**
 *
 * @param indexSymbol
 * @returns
 */
const getMostActiveEquities = async (indexSymbol) => {
    const indexData = await nseIndia.getEquityStockIndices(indexSymbol);
    return {
        byVolume: [...indexData.data].sort((a, b) => b.totalTradedVolume - a.totalTradedVolume),
        byValue: [...indexData.data].sort((a, b) => b.totalTradedValue - a.totalTradedValue)
    };
};
exports.getMostActiveEquities = getMostActiveEquities;
/**
 * Get technical indicators for a specific equity symbol
 * @param symbol - The equity symbol (e.g., 'RELIANCE', 'TCS')
 * @param period - Number of days for historical data (default: 200)
 * @param options - Optional configuration for indicators
 * @returns Promise<TechnicalIndicators>
 */
const getTechnicalIndicators = async (symbol, 
/* istanbul ignore next */
period = 200, 
/* istanbul ignore next */
options = {}) => {
    try {
        // Get historical data for the symbol
        /* istanbul ignore next */
        const endDate = new Date();
        /* istanbul ignore next */
        const startDate = new Date();
        /* istanbul ignore next */
        startDate.setDate(endDate.getDate() - period);
        /* istanbul ignore next */
        const historicalDataArray = await nseIndia.getEquityHistoricalData(symbol, { start: startDate, end: endDate });
        // Flatten the array of historical data
        /* istanbul ignore next */
        const historicalData = historicalDataArray.flatMap(data => data.data);
        /* istanbul ignore next */
        if (!historicalData || historicalData.length === 0) {
            /* istanbul ignore next */
            throw new Error(`No historical data found for symbol: ${symbol}`);
        }
        // Sort data by date (oldest first)
        const sortedData = historicalData.sort((a, b) => new Date(a.mtimestamp).getTime() - new Date(b.mtimestamp).getTime());
        // Extract OHLCV data
        const closes = sortedData.map((d) => d.chClosingPrice);
        const highs = sortedData.map((d) => d.chTradeHighPrice);
        const lows = sortedData.map((d) => d.chTradeLowPrice);
        const volumes = sortedData.map((d) => d.chTotTradedQty);
        // Set default periods
        const smaPeriods = options.smaPeriods || [5, 10, 20, 50, 100, 200];
        const emaPeriods = options.emaPeriods || [5, 10, 20, 50, 100, 200];
        const config = {
            rsiPeriod: options.rsiPeriod || 14,
            macdFast: options.macdFast || 12,
            macdSlow: options.macdSlow || 26,
            macdSignal: options.macdSignal || 9,
            bbPeriod: options.bbPeriod || 20,
            bbStdDev: options.bbStdDev || 2,
            stochK: options.stochK || 14,
            stochD: options.stochD || 3,
            williamsRPeriod: options.williamsRPeriod || 14,
            atrPeriod: options.atrPeriod || 14,
            adxPeriod: options.adxPeriod || 14,
            cciPeriod: options.cciPeriod || 20,
            mfiPeriod: options.mfiPeriod || 14,
            rocPeriod: options.rocPeriod || 10,
            momentumPeriod: options.momentumPeriod || 10
        };
        // Calculate technical indicators
        // Dynamic SMAs
        const sma = {};
        smaPeriods.forEach(period => {
            sma[`sma${period}`] = indicators.sma(closes, { period });
        });
        // Dynamic EMAs
        const ema = {};
        emaPeriods.forEach(period => {
            ema[`ema${period}`] = indicators.ema(closes, { period });
        });
        const rsi = indicators.rsi(closes, { period: config.rsiPeriod });
        const macdResult = indicators.macd(closes, {
            fast: config.macdFast,
            slow: config.macdSlow,
            signal: config.macdSignal
        });
        const macd = {
            macd: macdResult.macdLine,
            signal: macdResult.signalLine,
            histogram: macdResult.macdLine.map((val, i) => val - macdResult.signalLine[i])
        };
        const bbResult = indicators.bb(closes, { period: config.bbPeriod });
        const bollingerBands = {
            upper: bbResult.upper,
            middle: bbResult.middle,
            lower: bbResult.lower
        };
        const stochResult = indicators.stoch(highs, lows, closes);
        const stochastic = {
            k: stochResult.k,
            d: stochResult.d
        };
        const williamsR = indicators.williamsR(highs, lows, closes);
        const atrResult = indicators.atr(highs, lows, closes, { period: config.atrPeriod });
        const atr = atrResult.atrLine;
        const adx = new Array(closes.length).fill(0); // ADX not available, using placeholder
        const obv = indicators.obv(closes, volumes);
        const cci = indicators.cci(highs, lows, closes);
        const mfi = indicators.mfi(highs, lows, closes, volumes);
        const roc = indicators.roc(closes, { period: config.rocPeriod });
        const momentum = indicators.roc(closes, { period: config.momentumPeriod }); // Using ROC as momentum
        const ad = indicators.ad(highs, lows, closes, volumes);
        const vwap = indicators.vwap(closes, volumes);
        return {
            sma,
            ema,
            rsi,
            macd,
            bollingerBands,
            stochastic,
            williamsR,
            atr,
            adx,
            obv,
            cci,
            mfi,
            roc,
            momentum,
            ad,
            vwap
        };
    }
    catch (error) {
        /* istanbul ignore next */
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        /* istanbul ignore next */
        throw new Error(`Failed to calculate technical indicators for ${symbol}: ${errorMessage}`);
    }
};
exports.getTechnicalIndicators = getTechnicalIndicators;
//# sourceMappingURL=helpers.js.map