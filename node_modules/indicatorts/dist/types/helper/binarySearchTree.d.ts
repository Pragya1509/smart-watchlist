/**
 * Binary search tree object.
 */
export declare class BinarySearchTree {
    private root;
    /**
     * Inserts the given value.
     * @param value numeric value.
     */
    insert(value: number): void;
    /**
     * Removes the given value.
     * @param value numeric value.
     * @return value removed.
     */
    remove(value: number): boolean;
    /**
     * Min value.
     * @return min value.
     */
    min(): number;
    /**
     * Max value.
     * @return max value.
     */
    max(): number;
    /**
     * Removes the node info.
     * @param info node info.
     */
    private removeNode;
    /**
     * Min node function returns the min node and its parent.
     * @param root root node.
     * @return node info.
     */
    private static minNode;
    /**
     * Max node funection returns the mac node and its parent.
     * @param root root node.
     * @return node info.
     */
    private static maxNode;
}
