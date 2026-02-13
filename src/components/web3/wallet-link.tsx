"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useSession } from "next-auth/react";
import { linkWallet } from "@/lib/actions/wallet";
import { ConnectWallet } from "./connect-wallet";

/**
 * Component that handles wallet connection + linking to the user's account.
 * Shows "Connect Wallet" button if not connected.
 * Automatically links wallet to account when connected and authenticated.
 */
export function WalletLink() {
  const { address, isConnected } = useAccount();
  const { data: session } = useSession();
  const [linked, setLinked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isConnected && address && session?.user?.id) {
      linkWallet(address).then((result) => {
        if (result.error) {
          setError(result.error);
        } else {
          setLinked(true);
          setError(null);
        }
      });
    }
  }, [isConnected, address, session?.user?.id]);

  return (
    <div className="space-y-2">
      <ConnectWallet />
      {linked && (
        <p className="text-xs text-green-400">Wallet linked to your account</p>
      )}
      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}
