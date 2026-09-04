/**
 * Least square result object.
 */
export interface LeastSquareResult {
    m: number;
    b: number;
}
/**
 * Moving least square result.
 */
export interface MovingLeastSquareResult {
    m: number[];
    b: number[];
}
/**
 * Least square.
 *
 * y = mx + b
 * b = y-intercept
 * y = slope
 *
 * m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
 * b = (sumY - m * sumX) / n
 *
 * @param x x values.
 * @param y y values.
 * @return least square result object.
 */
export declare function leastSquare(x: number[], y: number[]): LeastSquareResult;
/**
 * Moving least square over a period.
 *
 * y = mx + b
 * b = y-intercept
 * y = slope
 *
 * m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
 * b = (sumY - m * sumX) / n
 *
 * @param period window period.
 * @param x x values.
 * @param y y values.
 * @return moving least square result.
 */
export declare function movingLeastSquare(period: number, x: number[], y: number[]): MovingLeastSquareResult;
/**
 * Linear regression using least square method.
 *
 * y = mx + b
 *
 * @param x x values.
 * @param y y values.
 * @return regression values.
 */
export declare function linearRegressionUsingLeastSquare(x: number[], y: number[]): number[];
/**
 * Moving linear regression using least square.
 *
 * y = mx + b
 *
 * @param period window period.
 * @param x x values.
 * @param y y values.
 * @return regression values.
 */
export declare function movingLinearRegressionUsingLeastSquare(period: number, x: number[], y: number[]): number[];
