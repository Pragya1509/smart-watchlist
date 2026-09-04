import { NumRange } from './numRange';
/**
 * Numeric scaler.
 */
export declare class NumScaler {
    private fromDelta;
    private toDelta;
    private multiplier;
    /**
     * Constructor.
     * @param from from range.
     * @param to to range.
     */
    constructor(from: NumRange, to: NumRange);
    /**
     * Scales the given number.
     * @param n current value.
     * @return scaled value.
     */
    scale(n: number): number;
    /**
     * Descales the given number.
     * @param n scaled value.
     * @return descaled value.
     */
    descale(n: number): number;
}
