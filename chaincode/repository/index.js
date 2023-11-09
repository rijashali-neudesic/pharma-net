export class ContractRepository {

  /**
   * Helper function to get asset data buffer from ledger
   * @param ctx - The transaction context object
   * @param assetKey - Composite key of asset to be fetched
   * @returns
   */
  static async getAsset(ctx, assetKey) {
    const dataBuffer = await ctx.stub
      .getState(assetKey)
      .catch(err => console.log(err));

    return !!dataBuffer.length ? JSON.parse(dataBuffer.toString()) : null;
  }

  /**
   * Helper function to put asset data on ledger
   * @param ctx - The transaction context object
   * @param assetKey - Composite key of asset to be created or updated
   * @param assetData - Asset data to put on ledger
   * @returns
   */
  static async putAsset(ctx, assetKey, asset) {
    await ctx.stub.putState(assetKey, Buffer.from(JSON.stringify(asset)));
  }

  /**
   * Helper function to get asset iterator from ledger based on given partial composite key prefix
   * @param ctx - The transaction context object
   * @param assetNamespace - Namespace of the asset to be fetched
   * @param partialAssetKey - Partial composite key prefix of asset to be fetched
   * @returns
   */
  static async getAssetIterator(ctx, assetNamespace, partialAssetKey) {
    return ctx.stub
      .getStateByPartialCompositeKey(assetNamespace, [partialAssetKey])
      .catch(err => console.log(err));
  }

  /**
	 * Helper function to get first asset from the list of assets starting with a partial key
	 * @param ctx - The transaction context object
	 * @param assetNamespace - Namespace of the asset to be fetched
	 * @param assetKeyPrefix - Partial composite key prefix of asset to be fetched
	 * @returns
	 */
	static async getFirstAssetFromKeyPrefix(ctx, assetNamespace, assetKeyPrefix) {
		//Get iterator of assets based on asset type partial composite key provided
		let assetIterator = await this.getAssetIterator(ctx, assetNamespace, assetKeyPrefix);
		let asset = await assetIterator.next();

		//If there are no assets for given key then iterator will have no results
		//Thus accessing next() result from iterator will give only done status
		//If next() returns value then at least one asset is existing with given partial key prefix
		let assetValue = asset.value;
		
		//Close the iterator if matching assets are existing, if not then iterator is already closed by this point
		if(assetValue){
			await assetIterator.close();
		}

		return assetValue;
	}

  /**
   * Helper function to get history of an asset from ledger
   * @param ctx - The transaction context object
   * @param assetKey - Composite key of asset whose history is to be fetched
   * @returns
   */
  static async getAssetHistory(ctx, assetKey) {
    return await ctx.stub
      .getHistoryForKey(assetKey)
      .catch(err => console.log(err));
  }

  /**
   * Helper function to verify if given asset exists
   * @param ctx - The transaction context object
   * @param assetKey - Composite key of asset to be verified
   * @returns
   */
  static async assetExists(ctx, assetKey) {
    const dataBuffer = await ctx.stub
      .getState(assetKey)
      .catch(err => console.log(err));

    return !!dataBuffer.length;
  }
}