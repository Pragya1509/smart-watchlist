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
exports.getDataSchema = exports.sleep = exports.getDateRangeChunks = void 0;
const moment_range_1 = require("moment-range");
const Moment = __importStar(require("moment"));
const moment = (0, moment_range_1.extendMoment)(Moment);
/**
 * @private
 */
const getDateRangeChunks = (startDate, endDate, chunkInDays) => {
    const range = moment.range(startDate, endDate);
    const chunks = Array.from(range.by('days', { step: chunkInDays }));
    const dateRanges = [];
    for (let i = 0; i < chunks.length; i++) {
        dateRanges.push({
            start: i > 0 ? chunks[i].add(1, 'day').format('DD-MM-YYYY') : chunks[i].format('DD-MM-YYYY'),
            end: chunks[i + 1] ? chunks[i + 1].format('DD-MM-YYYY') : range.end.format('DD-MM-YYYY')
        });
    }
    return dateRanges;
};
exports.getDateRangeChunks = getDateRangeChunks;
/**
 * @private
 */
const sleep = (ms) => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, ms);
    });
};
exports.sleep = sleep;
/**
 * @private
 * @param obj
 * @returns
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const getDataSchema = (data, isTypeStrict = true) => {
    if (typeof data !== 'object')
        return isTypeStrict ? `${typeof data}` : 'any';
    if (Array.isArray(data) && typeof data[0] !== 'object') {
        return isTypeStrict ? `${typeof data[0]}[]` : 'any';
    }
    return Object.entries(data).map(([key, value]) => {
        if (Moment.isDate(value))
            return `${key}: ${isTypeStrict ? 'Date' : 'any'}`;
        if (value === null || typeof value === 'string')
            return `${key}: ${isTypeStrict ? 'string | null' : 'any'}`;
        if (typeof value !== 'string' && Array.isArray(value)) {
            const typeForEmpty = isTypeStrict ? [] : 'any';
            return {
                [`${key}`]: value.length ? (0, exports.getDataSchema)(value[0], isTypeStrict) : typeForEmpty
            };
        }
        if (typeof value === 'object') {
            return {
                [`${key}`]: (0, exports.getDataSchema)(value, isTypeStrict)
            };
        }
        return `${key}: ${isTypeStrict ? typeof value : 'any'}`;
    });
};
exports.getDataSchema = getDataSchema;
//# sourceMappingURL=utils.js.map