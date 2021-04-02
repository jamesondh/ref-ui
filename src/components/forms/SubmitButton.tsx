import React from 'react';
import { wallet } from '~services/near';
import { signIn } from '~services/account';

interface SubmitButtonProps {
  text: string;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent) => void;
}

function SubmitButton({ text, disabled, onClick }: SubmitButtonProps) {
  return (
    <>
      {wallet.isSignedIn() ? (
        <button
          type={onClick ? 'button' : 'submit'}
          disabled={disabled}
          onClick={onClick}
          className="flex flex-row justify-center py-4 mt-5 mb-5 items-center rounded-md w-full bg-secondary text-white hover:bg-green-300 hover:text-gray-800 disabled:text-gray-400  disabled:bg-gray-100"
        >
          <h1 className=" text-xl font-inter font-medium ">{text}</h1>
        </button>
      ) : (
        <button
          onClick={signIn}
          type="button"
          className="my-4 h-10 w-full border border-black flex-row-centered shadow-lg hover:bg-disabled rounded-lg transition-colors"
        >
          {' '}
          Sign in to continue
        </button>
      )}
    </>
  );
}

export default SubmitButton;
