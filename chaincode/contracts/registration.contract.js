'use strict';
import { Contract } from "fabric-contract-api";
import { ContractRepository } from "../repository";
import { REGISTRATION_CONTRACT_KEY, deriveCompanyAssetKey, pharmaNameSpaces } from "../utils/assetKeys";
import { PharmaNetOrgs, PharmaNetRoles } from "../utils/enums";
import moment from 'moment';

export class RegistrationContract extends Contract {
  #repository;

  constructor() {
    super(REGISTRATION_CONTRACT_KEY);
    this.#repository = new ContractRepository();
  }

  async instantiate(ctx) {
    console.log('Pharmanet Smart Contract Instantiated');
  }

  /**
   * Register a new company on the network
   * @param ctx - The transaction context object
   * @param companyCRN - Company Registration Number
   * @param companyName - Name of the company
   * @param location - Location of the company
   * @param organisationRole - Role of the company
   * @returns
   */
  async registerCompany(ctx, companyCRN, companyName, location, organisationRole) {

    if (ctx.clientIdentity.getMSPID() === PharmaNetOrgs.consumer)
      throw new Error("Sorry, consumers are not allowed to register companies on pharma network!");

    if (!!(await this.#repository.getFirstAssetFromKeyPrefix(pharmaNameSpaces.commpanyAsset, companyCRN)))
      throw new Error(`Company with CRN ${companyCRN} is already registered on the network`);

    if (!Object.key(PharmaNetRoles).includes(organisationRole))
      throw new Error(`Invlaid role - ${organisationRole}`);

    const key = deriveCompanyAssetKey(ctx, companyCRN, companyName);
    const asset = {
      companyID: key,
      name: companyName,
      location,
      /** Manufacturer | Distributor | Retailer | Transporter */
      organisationRole,
      /** Manufacturer (1st level) → Distributor (2nd level) → Retailer (3rd level)
       * Note: There will be no hierarchy key for transporters.
        */
      hierarchyKey: organisationRole === "Manufacturer" ? PharmaNetRoles.Manufacturer
        : organisationRole === "Distributor" ? PHARMANETROLES.Distributor
          : organisationRole === "Retailer" ? PHARMANETROLES.Retailer
            : PHARMANETROLES.Transporter
    };

    await this.#repository.putAsset(ctx, key, asset);

    return asset
  };

  /**
	 * Add a new drug on the network
	 * @param ctx - The transaction context object
	 * @param drugName - Name of the drug
	 * @param serialNo - Serial number of the drug
	 * @param mfgDate - Manufacturing date of the drug
	 * @param expDate - Expiry date of the drug
   * @param companyCRN - Company Registration Number of manufacturer
	 * @returns
	 */
  async addDrug(ctx, drugName, serialNo, mfgDate, expDate, companyCRN) {
    /** Check if drug is added by manufacturer organisation */
    if (ctx.clientIdentity.getMSPID() !== PharmaNetOrgs.manufacturer)
      throw new Error("Only manufacturing companies are allowed to add drugs on pharma network!");

    /** Check id company is registered on the network */
    const manufacturer = await this.#repository.getFirstAssetFromKeyPrefix(pharmaNameSpaces.commpanyAsset, companyCRN);
    if (!(manufacturer))
      throw new Error(`Company with given CRN - ${companyCRN} is not registered on the network`);

    const mfgMoment = moment(mfgDate);
    if (!mfgMoment.isValid()) throw new Error("Invalid manufacturing date.");

    const expMoment = moment(expDate);
    if (!expMoment.isValid()) throw new Error("Invalid expiry date.");

    if (!expMoment.isAfter(mfgMoment))
      throw new Error("Expiry date must be greater than manufacture date!");

    const key = deriveDrugAssetKey(ctx, drugName, serialNo);

    const asset = {
      productID: key,
      name: drugName,
      manufacturer: manufacturer.key,
      manufacturingDate: mfgDate,
      expiryDate: expDate,
      owner: manufacturer.key,
      shipment: [],
    };

    await this.#repository.putAsset(key, asset);

    return asset;
  }
}