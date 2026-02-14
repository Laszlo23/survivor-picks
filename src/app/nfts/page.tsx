import { Metadata } from "next";
import { NFTCollectionClient } from "./nft-client";

export const metadata: Metadata = {
  title: "NFT Collection | RealityPicks",
  description: "Mint exclusive RealityPicks NFTs. From Early Supporter to the ultra-rare Legend.",
};

export default function NFTsPage() {
  return <NFTCollectionClient />;
}
