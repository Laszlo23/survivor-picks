"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useSession } from "next-auth/react";
import { linkWallet } from "@/lib/actions/wallet";
import { ConnectWallet } from "./connect-wallet";
import { RefreshCw } from "lucide-react";

/**
 * Component that handles wallet connection + linking to the user's account.
 * Shows "Connect Wallet" button if not connected.
 * Automatically links wallet to account when connected and authenticated.
 * Includes error recovery with retry.
 */
export function WalletLink() {
  const { address, isConnected } = useAccount();
  const { data: session } = useSession();
  const [linked, setLinked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);

  const doLink = async () => {
    if (!isConnected || !address || !session?.user?.id) return;
    setRetrying(true);
    setError(null);
    try {
      const result = await linkWallet(address);
      if (result.error) {
        setError(result.error);
      } else {
        setLinked(true);
        setError(null);
      }
    } catch (err) {
      setError("Failed to link wallet. Please try again.");
    } finally {
      setRetrying(false);
    }
  };

  useEffect(() => {
    if (isConnected && address && session?.user?.id) {
      doLink();
    }
  }, [isConnected, address, session?.user?.id]);

  return (
    <div className="space-y-2">
      <ConnectWallet />
      {linked && (
        <p className="text-xs text-neon-cyan flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-neon-cyan" />
          Wallet linked to your account
        </p>
      )}
      {error && (
        <div className="flex items-center gap-2">
          <p className="text-xs text-red-400 flex-1">{error}</p>
          <button
            onClick={doLink}
            disabled={retrying}
            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
          >
            <RefreshCw className={`h-3 w-3 ${retrying ? "animate-spin" : ""}`} />
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
