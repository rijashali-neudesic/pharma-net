const NETWORK_KEY = 'org.pharma-network.pharmanet';

export const REGISTRATION_CONTRACT_KEY = `${NETWORK_KEY}.registration`;
export const DRUG_TRANSFER_CONTRACT_KEY = `${NETWORK_KEY}.drugTransfer`;
export const LIFE_CYCLE_CONTRACT_KEY = `${NETWORK_KEY}.lifcycle`;

export const pharmaNameSpaces = Object.freeze({
    commpanyAsset: `${NETWORK_KEY}.company`,
    drugAsset: `${NETWORK_KEY}.drug`,
    drugPurchaseAsset: `${NETWORK_KEY}.drugPurchase`,
    drugShipmentAsset: `${NETWORK_KEY}.drugShipment`
})

export const deriveCompanyAssetKey =
    (ctx, companyCRN, companyName) => ctx.stub.createCompositeKey(pharmaNameSpaces.commpanyAsset, [companyCRN, companyName]);

export const deriveDrugAssetKey = (ctx, drugName, serialNo) => ctx.stub.createCompositeKey(pharmaNameSpaces.drugAsset, [drugName, serialNo]);

export const deriveDrugPurchaseAssetKey =
    (ctx, buyerCRN, drugName) => ctx.stub.createCompositeKey(pharmaNameSpaces.drugPurchaseAsset, [buyerCRN, drugName]);

export const deriveDrugShipmentAssetKey =
    (ctx, buyerCRN, drugName) => ctx.stub.createCompositeKey(pharmaNameSpaces.drugShipmentAsset, [buyerCRN, drugName]);
