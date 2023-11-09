import { Contract } from "fabric-contract-api";
import { LIFE_CYCLE_CONTRACT_KEY } from "../utils/assetKeys";
import { ContractRepository } from "../repository";

export class LifeCycleContract extends Contract {
  constructor() {
    super(LIFE_CYCLE_CONTRACT_KEY);
  }

  /**
   * View lifecycle of drug transactions on the network
   * @param ctx - The transaction context object
   * @param drugName - Name of the drug
   * @param serialNo - Serial number of the drug
   * @returns
   */
  async viewHistory(ctx, drugName, serialNo) {
    //Get composite key of the drug
    const drugKey = deriveDrugAssetKey(ctx, drugName, serialNo);

    //Check if drug exists
    if (!await ContractRepository.assetExists(ctx, drugKey)) {
      throw new Error(`Serial number ${serialNo} of drug ${drugName} is not available on pharma network!!!`);
    }

    //Get drug history iterator from ledger
    let drugHistoryIterator = await ContractRepository.getAssetHistory(ctx, drugKey);

    //Initialize an empty array to hold the drug history
    let drugHistory = [];

    //Iterate over the drug history and add each transaction assoicated with the drug
    //along with timestamp and details of the drug for each transaction
    while (!drugHistoryIterator.done()) {
      let historyValue = await drugHistoryIterator.next();
      let keyModificationObject = historyValue.value;

      if (keyModificationObject) {
        let drugHistoryTransaction = {
          TransactionId: keyModificationObject.tx_id,
          //Add timestamp to history object after converting it from ledger format to readable date
          Timestamp: ViewLifecycleContract.normalizeTimestamp(keyModificationObject.timestamp)
        };

        //If transaction is for key deletion then add a default string as transaction data
        //else convert the data from bytes to string and add it to history object
        if (keyModificationObject.is_delete) {
          drugHistoryTransaction.Data = 'KEY DELETED';
        }
        else {
          drugHistoryTransaction.Data = keyModificationObject.value.toString('utf8');
        }

        drugHistory.push(drugHistoryTransaction);
      }

      //If iterator has reached its end close the iterator and return drug history array
      if (historyValue.done) {
        await drugHistoryIterator.close();
        return drugHistory;
      }
    }
  }

  /**
   * View current state of drug on the network
   * @param ctx - The transaction context object
   * @param drugName - Name of the drug
   * @param serialNo - Serial number of the drug
   * @returns
   */
  viewDrugCurrentState = async (ctx, drugName, serialNo) => {
    const key = deriveDrugAssetKey(ctx, drugName, serialNo);
    const asset = await ContractRepository.getState(key);

    if (!asset)
      throw new Error(`Drug ${drugName} with serialNo ${serialNo} doesn't exist on the network!`);

    return asset;
  };
}