/**
 * Numeric range.
 */
export declare class NumRange {
    private min;
    private max;
    /**
     * Constructor.
     * @param min min value.
     * @param max max value.
     */
    constructor(min: number, max: number);
    /**
     * Gets the min value.
     * @return min value.
     */
    getMin(): number;
    /**
     * Gets the max value.
     * @return max value.
     */
    getMax(): number;
    /**
     * Calculates the span of the range.
     * @return span value.
     */
    span(): number;
    /**
     * Merge function merges the given ranges.
     * @param ranges range objects.
     * @return merged ranges.
     */
    static merge(ranges: NumRange[]): NumRange;
    /**
     * From function returns the range of the values.
     * @param values values array.
     * @return range of the values.
     */
    static from(values: number[]): NumRange;
}
