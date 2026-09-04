/**
 * Data set.
 */
export interface DataSet {
    legend: string;
    values: number[];
    style?: string | string[];
    width?: number;
}
/**
 * Chart object.
 */
export declare class Chart {
    private canvas;
    private context;
    private dataSets;
    private dateSetsChanged;
    private xScaler;
    private yScaler;
    private xFocus;
    /**
     * Constructor.
     * @param id canvas id.
     */
    constructor(id: string);
    /**
     * Add the data set.
     * @param dataSet data set.
     */
    add(dataSet: DataSet): void;
    /**
     * Removes the data set by the given legend.
     * @param legend data set legend value.
     * @return data set is removed.
     */
    remove(legend: string): boolean;
    /**
     * Draw canvas.
     */
    draw(): void;
    /**
     * Draws the data sets.
     */
    private drawDataSets;
    /**
     * Style at given index.
     * @param dataSet data set.
     * @param index at index.
     * @return at style.
     */
    private styleAtIndex;
    /**
     * Draws focus line and focused values.
     */
    private drawFocus;
    /**
     * Draws the focus line.
     */
    private drawFocusLine;
    /**
     * Draws the focused values.
     */
    private drawFocusedValues;
    /**
     * Calculates the chart height.
     * @return chart height.
     */
    private chartHeight;
    /**
     * Updates scalers.
     */
    private updateScalers;
    /**
     * On mouse move event.
     * @param ev mouse event.
     */
    private onMouseMove;
    /**
     * On mouse out event.
     */
    private onMouseOut;
}
