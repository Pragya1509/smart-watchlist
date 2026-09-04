/**
 * Asset object.
 */
export interface Asset {
    dates: Date[];
    openings: number[];
    closings: number[];
    highs: number[];
    lows: number[];
    volumes: number[];
}
/**
 * New asset with length.
 *
 * @param length asset length.
 * @return asset object.
 */
export declare function newAssetWithLength(length: number): Asset;
/**
 * Concats the given assets.
 *
 * @param asset1 first asset.
 * @param asset2 second asset.
 * @return new asset.
 */
export declare function concatAssets(asset1: Asset, asset2: Asset): Asset;
