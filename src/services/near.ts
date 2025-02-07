import { Near, keyStores, utils } from 'near-api-js';
import BN from 'bn.js';
import getConfig from './config';
import SpecialWallet from './SpecialWallet';
import { functionCall } from 'near-api-js/lib/transaction';

export const REF_FI_CONTRACT_ID =
  process.env.REF_FI_CONTRACT_ID || 'ref-finance.testnet';

export const ONE_YOCTO_NEAR = '0.000000000000000000000001';

export const near = new Near({
  keyStore: new keyStores.BrowserLocalStorageKeyStore(),
  ...getConfig(process.env.NEAR_ENV || 'testnet'),
});
export const wallet = new SpecialWallet(near, 'ref-fi');

export const getGas = (gas: string) =>
  gas ? new BN(gas) : new BN('30000000000000');
export const getAmount = (amount: string) =>
  amount ? new BN(utils.format.parseNearAmount(amount)) : new BN('0');

export interface RefFiViewFunctionOptions {
  methodName: string;
  args?: object;
}

export interface RefFiFunctionCallOptions extends RefFiViewFunctionOptions {
  gas?: string;
  amount?: string;
}

export const refFiFunctionCall = ({
  methodName,
  args,
  gas,
  amount,
}: RefFiFunctionCallOptions) => {
  return wallet
    .account()
    .functionCall(
      REF_FI_CONTRACT_ID,
      methodName,
      args,
      getGas(gas),
      getAmount(amount)
    );
};

export const refFiViewFunction = ({
  methodName,
  args,
}: RefFiViewFunctionOptions) => {
  return wallet.account().viewFunction(REF_FI_CONTRACT_ID, methodName, args);
};

export const refFiManyFunctionCalls = (
  functionCalls: RefFiFunctionCallOptions[]
) => {
  const actions = functionCalls.map((fc) =>
    functionCall(fc.methodName, fc.args, getGas(fc.gas), getAmount(fc.amount))
  );

  return wallet
    .account()
    .sendTransactionWithActions(REF_FI_CONTRACT_ID, actions);
};

export interface Transaction {
  receiverId: string;
  functionCalls: RefFiFunctionCallOptions[];
}

export const executeMultipleTransactions = async (
  transactions: Transaction[],
  callbackUrl?: string
) => {
  const nearTransactions = await Promise.all(
    transactions.map((t, i) => {
      return wallet.createTransaction({
        receiverId: t.receiverId,
        nonceOffset: i + 1,
        actions: t.functionCalls.map((fc) =>
          functionCall(
            fc.methodName,
            fc.args,
            getGas(fc.gas),
            getAmount(fc.amount)
          )
        ),
      });
    })
  );

  return wallet.requestSignTransactions(nearTransactions, callbackUrl);
};
