"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.showHistorical = exports.showEquityDetails = exports.showMarketStatus = exports.showIndexDetails = exports.showIndexOverview = void 0;
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable no-console */
const index_1 = require("../index");
const ora_1 = __importDefault(require("ora"));
const chalk_1 = __importDefault(require("chalk"));
const ohlc_1 = __importDefault(require("ohlc"));
const moment_1 = __importDefault(require("moment"));
const asciichart_1 = __importDefault(require("asciichart"));
const rupee = '₹';
const nse = new index_1.NseIndia();
async function showIndexOverview() {
    const spinner = (0, ora_1.default)();
    spinner.text = 'Loading Indices deatils';
    spinner.start();
    const { data: allIndexData } = await nse.getDataByEndpoint(index_1.ApiList.ALL_INDICES);
    spinner.text = '';
    spinner.stop();
    const indexTypes = [
        'BROAD MARKET INDICES',
        'SECTORAL INDICES',
        // 'STRATEGY INDICES',
        // 'THEMATIC INDICES',
        // 'FIXED INCOME INDICES'
    ];
    indexTypes.forEach(indexType => {
        const allIndexTableData = allIndexData
            .filter((item) => item.key === indexType)
            .map((item) => {
            return {
                // 'Index Name': item.index,
                'Index Symbol': item.indexSymbol,
                'Last Price': item.last,
                'Previous Close': item.previousClose,
                'Change': item.variation,
                'Change Percent': item.percentChange,
                'Open': item.open,
                'High': item.high,
                'Low': item.low,
            };
        });
        console.log(`${indexType} Details`);
        console.table(allIndexTableData);
    });
}
exports.showIndexOverview = showIndexOverview;
async function showIndexDetails(argv) {
    const { indexSymbol: index } = argv;
    const spinner = (0, ora_1.default)();
    spinner.text = `Loading ${index} Details`;
    spinner.start();
    const { data } = await nse.getEquityStockIndices(index);
    spinner.text = '';
    spinner.stop();
    if (data) {
        const indexTableData = data.map((item) => {
            return {
                'Symbol': item.symbol,
                'Open': item.open,
                'High': item.dayHigh,
                'Low': item.dayLow,
                'Last Price': item.lastPrice,
                'Previous Close': item.previousClose,
                'Change': Number(item.change.toFixed(2)),
                'Change Percent': item.pChange
            };
        });
        console.log(`${index} deatils`);
        console.table(indexTableData);
    }
    else {
        console.log(chalk_1.default.red(`${index} index symbol is invalid. Try to enclose the index symbols with quotes.`));
    }
}
exports.showIndexDetails = showIndexDetails;
async function showMarketStatus() {
    const spinner = (0, ora_1.default)();
    spinner.text = 'Loading Market status';
    spinner.start();
    const { marketState } = await nse.getDataByEndpoint(index_1.ApiList.MARKET_STATUS);
    spinner.text = '';
    spinner.stop();
    console.table(marketState);
}
exports.showMarketStatus = showMarketStatus;
async function showEquityDetails(argv) {
    const { symbol } = argv;
    const spinner = (0, ora_1.default)();
    spinner.text = 'Loading Equity details';
    spinner.start();
    try {
        const { info, priceInfo, metadata, securityInfo } = await nse.getEquityDetails(symbol);
        spinner.text = 'Loading Trading details';
        const { marketDeptOrderBook } = await nse.getEquityTradeInfo(symbol);
        spinner.text = '';
        spinner.stop();
        if (info && marketDeptOrderBook) {
            const { tradeInfo } = marketDeptOrderBook;
            const changePrice = Number(priceInfo.change.toFixed(2));
            const changePercent = Number(priceInfo.pChange.toFixed(2));
            const tableData = {
                'Last Updated Time': metadata.lastUpdateTime,
                'Symbol': symbol,
                'Company Name': info.companyName,
                'Industry': metadata.industry,
                'Sectoral Index': metadata.pdSectorInd.trim(),
                'Sectoral PE': metadata.pdSectorPe,
                'Symbol PE': metadata.pdSymbolPe,
                'Listing Status': metadata.status,
                'Listing Since': metadata.listingDate,
                [`Price Change (in ${rupee})`]: changePrice,
                'Change Percentage (in %)': changePercent,
                'Open': priceInfo.open,
                'High': priceInfo.intraDayHighLow.max,
                'Low': priceInfo.intraDayHighLow.min,
                'Close': priceInfo.close,
                'Previous Close': priceInfo.previousClose,
                'Last Traded Price': priceInfo.lastPrice,
                'Volume Weighted Average Price (VWAP)': priceInfo.vwap,
                'Total Traded Volume': tradeInfo.totalTradedVolume,
                [`Total Traded Value (${rupee} Lakhs)`]: tradeInfo.totalTradedValue,
                [`Total Market Capital (${rupee} Lakhs)`]: tradeInfo.totalMarketCap
            };
            const changeStatus = changePrice <= 0 ? `${rupee}${changePrice} (${changePercent}%)${chalk_1.default.red('▼')}` :
                `${rupee}${changePrice} (${changePercent}%)${chalk_1.default.green('▲')}`;
            const derivativeStatus = securityInfo.derivatives === 'Yes' ?
                chalk_1.default.black.bgGreen(' Derivatives ') : chalk_1.default.black.bgRed(' Derivatives ');
            const slbStatus = securityInfo.slb === 'Yes' ?
                chalk_1.default.black.bgGreen(' SLB ') : chalk_1.default.black.bgRed(' SLB ');
            const ltpStatus = changePrice <= 0 ? chalk_1.default.black.bgRed(` LTP: ${priceInfo.lastPrice} `) :
                chalk_1.default.black.bgGreen(` LTP: ${priceInfo.lastPrice} `);
            console.table(tableData);
            console.log(`Change: ${changeStatus}`);
            console.log(`${ltpStatus} ${derivativeStatus} ${slbStatus}`);
        }
        else {
            console.log(chalk_1.default.red('Please provide valid NSE symbol.'));
        }
    }
    catch (error) {
        spinner.text = '';
        spinner.stop();
        console.log(chalk_1.default.red(error.message));
    }
}
exports.showEquityDetails = showEquityDetails;
async function showHistorical(argv) {
    console.time('Done In');
    const { symbol } = argv;
    const spinner = (0, ora_1.default)();
    spinner.text = 'Loading Historical Data';
    spinner.start();
    const startDate = (0, moment_1.default)().subtract(3, 'months').format('YYYY-MM-DD');
    const results = await nse.getEquityHistoricalData(symbol, { start: new Date(startDate), end: new Date() });
    spinner.text = '';
    spinner.stop();
    const ohlcData = [];
    results.forEach(({ data: historicalData }) => {
        historicalData.forEach(info => {
            ohlcData.push([
                info.mtimestamp,
                info.chOpeningPrice,
                info.chTradeHighPrice,
                info.chTradeLowPrice,
                info.chClosingPrice,
                info.chTotTradedVal
            ]);
        });
    });
    const fullOhlcData = (0, ohlc_1.default)(ohlcData);
    console.log();
    const ohlcDataFromStartDate = fullOhlcData.start(startDate).sma(5).toDaily();
    const CloseData = ohlcDataFromStartDate.map((obj) => obj.Close);
    const Volume = ohlcDataFromStartDate.map((obj) => obj.Volume / 100000);
    const chartConfig = {
        height: 10
    };
    console.log(chalk_1.default.black.bgCyan(' Price Chart - SMA5 (Last 3 months) '));
    console.log();
    console.log(asciichart_1.default.plot(CloseData, { ...chartConfig, colors: [asciichart_1.default.cyan] }));
    console.log();
    console.log(chalk_1.default.black.bgYellow(' Volume Chart - In Lakhs (Last 3 months) '));
    console.log();
    console.log(asciichart_1.default.plot(Volume, { ...chartConfig, colors: [asciichart_1.default.yellow] }));
    console.log();
    console.timeEnd('Done In');
}
exports.showHistorical = showHistorical;
//# sourceMappingURL=api.js.map