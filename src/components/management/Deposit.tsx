import React, { useEffect, useState } from 'react';
import FormWrap from '../forms/FormWrap';
import TokenAmount from '../forms/TokenAmount';
import { TokenMetadata } from '../../services/ft-contract';
import { deposit } from '../../services/token';
import { useDepositableBalance } from '../../state/token';
import { toPrecision, toReadableNumber } from '../../utils/numbers';
import { nearMetadata, wrapNear } from '../../services/wrap-near';
import { wallet } from '../../services/near';
import { useCurrentStorageBalance } from '../../state/account';
import { ACCOUNT_MIN_STORAGE_AMOUNT } from '../../services/account';
import { STORAGE_PER_TOKEN } from '../../services/creators/storage';
import copy from '../../utils/copy';

export default function Deposit({ tokens }: { tokens: TokenMetadata[] }) {
  const [amount, setAmount] = useState<string>();
  const [selectedToken, setSelectedToken] = useState<TokenMetadata>(
    nearMetadata
  );
  const [nearBalance, setNearBalance] = useState<string>();

  const storageBalances = useCurrentStorageBalance();
  const depositable = useDepositableBalance(selectedToken?.id);
  const max =
    toReadableNumber(
      selectedToken?.decimals,
      selectedToken?.id === nearMetadata.id ? nearBalance : depositable
    ) || '0';
  const info =
    selectedToken.id === nearMetadata.id ? copy.nearDeposit : copy.deposit;

  useEffect(() => {
    wallet
      .account()
      .getAccountBalance()
      .then(({ available }) => setNearBalance(available));
  }, []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (selectedToken.id === nearMetadata.id) {
      return wrapNear(amount);
    }

    return deposit({
      token: selectedToken,
      amount,
    });
  };

  return (
    <FormWrap
      buttonText="Deposit"
      canSubmit={!!amount && !!selectedToken}
      onSubmit={handleSubmit}
      info={info}
    >
      {selectedToken && (
        <div className="text-center">
          <span> You can deposit up to </span>
          <span className="font-bold">{toPrecision(max, 4, true)} </span>
          <span>{selectedToken.symbol}.</span>
        </div>
      )}
      <TokenAmount
        amount={amount}
        max={String(max)}
        tokens={[nearMetadata, ...tokens]}
        selectedToken={selectedToken}
        onSelectToken={setSelectedToken}
        onChangeAmount={setAmount}
      />

      {storageBalances === null && (
        <h2 className="my-4 leading-snug">
          <p>
            Your first deposit includes an extra{' '}
            <span className="font-semibold">
              {ACCOUNT_MIN_STORAGE_AMOUNT} Ⓝ
            </span>{' '}
            to cover your{' '}
            <a
              className="text-secondaryScale-600 underline"
              href="https://docs.near.org/docs/concepts/storage-staking"
              target="_blank"
            >
              account storage.
            </a>
          </p>
          <p className="mt-3">
            Also, an additional{' '}
            <span className="font-semibold">{STORAGE_PER_TOKEN} Ⓝ</span> storage
            fee is applied for each unique token type you deposit.
          </p>
        </h2>
      )}
    </FormWrap>
  );
}
