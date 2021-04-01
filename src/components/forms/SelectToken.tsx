import React, { useEffect, useState } from 'react';
import MicroModal from 'react-micro-modal';
import TokenList from '../tokens/TokenList';
import { TokenMetadata } from '../../services/token';
import DownArrow from '../../assets/misc/select-arrow.svg';
import { render } from 'react-dom';

export default function SelectToken({
  tokens,
  selected,
  render,
  onSelect,
}: {
  tokens: TokenMetadata[];
  selected: string | React.ReactElement;
  render?: (token: TokenMetadata) => React.ReactElement;
  onSelect?: (token: TokenMetadata) => void;
}) {
  return (
    <MicroModal
      trigger={(open) => (
        <button className="p-1" type="button" onClick={open}>
          {selected || <DownArrow />}
        </button>
      )}
      overrides={{
        Dialog: { style: { maxWidth: 'auto' } },
      }}
    >
      {(close) => (
        <section>
          <h2>Select Token</h2>
          <TokenList
            tokens={tokens}
            render={render}
            onClick={(token) => {
              onSelect && onSelect(token);
              close();
            }}
          />
        </section>
      )}
    </MicroModal>
  );
}
