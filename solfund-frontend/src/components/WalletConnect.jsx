import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';

export default function WalletConnect() {
  const { publicKey } = useWallet();

  return (
    <div style={{ padding: "1rem 0"}}>
      <WalletMultiButton/>
      {publicKey && (
        <p style={{ marginTop: "1rem"}}>
          Connected as: <strong>{publicKey.toBase58()}</strong>
        </p>
      )}
    </div>
  );
}