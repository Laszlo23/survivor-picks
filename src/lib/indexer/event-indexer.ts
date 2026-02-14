/**
 * Event Indexer for RealityPicks
 *
 * Listens to on-chain events from PredictionEngine, StakingVault, BadgeNFT, and SeasonPass
 * contracts and syncs relevant data back to PostgreSQL for fast reads.
 *
 * Can be run as a standalone process: `npx tsx src/lib/indexer/event-indexer.ts`
 * Or triggered periodically via a cron job / API route.
 */

import { createPublicClient, http, parseAbiItem, type Log, type Address } from "viem";
import { base, baseSepolia, hardhat } from "viem/chains";

// ─── Configuration ──────────────────────────────────────────────────

const CHAIN = process.env.NEXT_PUBLIC_CHAIN === "mainnet" ? base
  : process.env.NEXT_PUBLIC_CHAIN === "testnet" ? baseSepolia
  : hardhat;

const RPC_URL = process.env.NEXT_PUBLIC_CHAIN === "mainnet"
  ? (process.env.BASE_MAINNET_RPC || "https://mainnet.base.org")
  : process.env.NEXT_PUBLIC_CHAIN === "testnet"
    ? (process.env.BASE_SEPOLIA_RPC || "https://sepolia.base.org")
    : "http://127.0.0.1:8545";

const PREDICTION_ENGINE_ADDRESS = (process.env.NEXT_PUBLIC_PREDICTION_ENGINE_ADDRESS || "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0") as Address;
const STAKING_VAULT_ADDRESS = (process.env.NEXT_PUBLIC_STAKING_VAULT_ADDRESS || "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9") as Address;
const BADGE_NFT_ADDRESS = (process.env.NEXT_PUBLIC_BADGE_NFT_ADDRESS || "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9") as Address;
const SEASON_PASS_ADDRESS = (process.env.NEXT_PUBLIC_SEASON_PASS_ADDRESS || "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707") as Address;

// ─── Event ABIs ─────────────────────────────────────────────────────

const PREDICTION_MADE_EVENT = parseAbiItem(
  "event PredictionMade(bytes32 indexed questionId, address indexed user, uint8 option, uint256 amount, bool isRisk)"
);

const QUESTION_RESOLVED_EVENT = parseAbiItem(
  "event QuestionResolved(bytes32 indexed questionId, uint8 correctOption, uint256 totalPool, uint256 platformFee)"
);

const REWARD_CLAIMED_EVENT = parseAbiItem(
  "event RewardClaimed(bytes32 indexed questionId, address indexed user, uint256 amount)"
);

const STAKED_EVENT = parseAbiItem(
  "event Staked(address indexed user, uint256 amount)"
);

const UNSTAKED_EVENT = parseAbiItem(
  "event Unstaked(address indexed user, uint256 amount)"
);

const BADGE_MINTED_EVENT = parseAbiItem(
  "event BadgeMinted(uint256 indexed tokenId, address indexed to)"
);

const PASS_PURCHASED_EVENT = parseAbiItem(
  "event PassPurchased(address indexed buyer, uint256 indexed tokenId, uint256 price, uint256 tokensBurned)"
);

// ─── Types ──────────────────────────────────────────────────────────

export interface IndexedEvent {
  type: string;
  blockNumber: bigint;
  transactionHash: string;
  logIndex: number;
  data: Record<string, unknown>;
  timestamp?: number;
}

// ─── Indexer Class ──────────────────────────────────────────────────

export class EventIndexer {
  private client;
  private lastProcessedBlock: bigint = 0n;
  private eventHandlers: Map<string, (event: IndexedEvent) => Promise<void>> = new Map();

  constructor() {
    this.client = createPublicClient({
      chain: CHAIN,
      transport: http(RPC_URL),
    });
  }

  /**
   * Register a handler for a specific event type
   */
  onEvent(type: string, handler: (event: IndexedEvent) => Promise<void>) {
    this.eventHandlers.set(type, handler);
  }

  /**
   * Fetch and process events from a given block range
   */
  async indexFromBlock(fromBlock: bigint, toBlock?: bigint): Promise<IndexedEvent[]> {
    const currentBlock = toBlock || await this.client.getBlockNumber();
    const events: IndexedEvent[] = [];

    // PredictionEngine events
    try {
      const predictionLogs = await this.client.getLogs({
        address: PREDICTION_ENGINE_ADDRESS,
        event: PREDICTION_MADE_EVENT,
        fromBlock,
        toBlock: currentBlock,
      });

      for (const log of predictionLogs) {
        const event: IndexedEvent = {
          type: "PredictionMade",
          blockNumber: log.blockNumber,
          transactionHash: log.transactionHash,
          logIndex: log.logIndex,
          data: {
            questionId: log.args.questionId,
            user: log.args.user,
            option: log.args.option,
            amount: log.args.amount?.toString(),
            isRisk: log.args.isRisk,
          },
        };
        events.push(event);
        await this.dispatchEvent(event);
      }
    } catch (err) {
      console.error("Error fetching PredictionMade logs:", err);
    }

    try {
      const resolveLogs = await this.client.getLogs({
        address: PREDICTION_ENGINE_ADDRESS,
        event: QUESTION_RESOLVED_EVENT,
        fromBlock,
        toBlock: currentBlock,
      });

      for (const log of resolveLogs) {
        const event: IndexedEvent = {
          type: "QuestionResolved",
          blockNumber: log.blockNumber,
          transactionHash: log.transactionHash,
          logIndex: log.logIndex,
          data: {
            questionId: log.args.questionId,
            correctOption: log.args.correctOption,
            totalPool: log.args.totalPool?.toString(),
            platformFee: log.args.platformFee?.toString(),
          },
        };
        events.push(event);
        await this.dispatchEvent(event);
      }
    } catch (err) {
      console.error("Error fetching QuestionResolved logs:", err);
    }

    try {
      const claimLogs = await this.client.getLogs({
        address: PREDICTION_ENGINE_ADDRESS,
        event: REWARD_CLAIMED_EVENT,
        fromBlock,
        toBlock: currentBlock,
      });

      for (const log of claimLogs) {
        const event: IndexedEvent = {
          type: "RewardClaimed",
          blockNumber: log.blockNumber,
          transactionHash: log.transactionHash,
          logIndex: log.logIndex,
          data: {
            questionId: log.args.questionId,
            user: log.args.user,
            amount: log.args.amount?.toString(),
          },
        };
        events.push(event);
        await this.dispatchEvent(event);
      }
    } catch (err) {
      console.error("Error fetching RewardClaimed logs:", err);
    }

    // StakingVault events
    try {
      const stakeLogs = await this.client.getLogs({
        address: STAKING_VAULT_ADDRESS,
        event: STAKED_EVENT,
        fromBlock,
        toBlock: currentBlock,
      });

      for (const log of stakeLogs) {
        const event: IndexedEvent = {
          type: "Staked",
          blockNumber: log.blockNumber,
          transactionHash: log.transactionHash,
          logIndex: log.logIndex,
          data: {
            user: log.args.user,
            amount: log.args.amount?.toString(),
          },
        };
        events.push(event);
        await this.dispatchEvent(event);
      }
    } catch (err) {
      console.error("Error fetching Staked logs:", err);
    }

    // Badge events
    try {
      const badgeLogs = await this.client.getLogs({
        address: BADGE_NFT_ADDRESS,
        event: BADGE_MINTED_EVENT,
        fromBlock,
        toBlock: currentBlock,
      });

      for (const log of badgeLogs) {
        const event: IndexedEvent = {
          type: "BadgeMinted",
          blockNumber: log.blockNumber,
          transactionHash: log.transactionHash,
          logIndex: log.logIndex,
          data: {
            tokenId: log.args.tokenId?.toString(),
            to: log.args.to,
          },
        };
        events.push(event);
        await this.dispatchEvent(event);
      }
    } catch (err) {
      console.error("Error fetching BadgeMinted logs:", err);
    }

    // SeasonPass events
    try {
      const passLogs = await this.client.getLogs({
        address: SEASON_PASS_ADDRESS,
        event: PASS_PURCHASED_EVENT,
        fromBlock,
        toBlock: currentBlock,
      });

      for (const log of passLogs) {
        const event: IndexedEvent = {
          type: "PassPurchased",
          blockNumber: log.blockNumber,
          transactionHash: log.transactionHash,
          logIndex: log.logIndex,
          data: {
            buyer: log.args.buyer,
            tokenId: log.args.tokenId?.toString(),
            price: log.args.price?.toString(),
            tokensBurned: log.args.tokensBurned?.toString(),
          },
        };
        events.push(event);
        await this.dispatchEvent(event);
      }
    } catch (err) {
      console.error("Error fetching PassPurchased logs:", err);
    }

    this.lastProcessedBlock = currentBlock;
    return events;
  }

  /**
   * Start watching for new events in real-time
   */
  async startWatching() {
    console.log(`[Indexer] Starting event watcher on chain ${CHAIN.id}...`);
    const currentBlock = await this.client.getBlockNumber();
    this.lastProcessedBlock = currentBlock;

    // Poll every 12 seconds (Base block time is ~2s, but we batch)
    const pollInterval = setInterval(async () => {
      try {
        const latestBlock = await this.client.getBlockNumber();
        if (latestBlock > this.lastProcessedBlock) {
          const events = await this.indexFromBlock(this.lastProcessedBlock + 1n, latestBlock);
          if (events.length > 0) {
            console.log(`[Indexer] Processed ${events.length} events (blocks ${this.lastProcessedBlock + 1n}-${latestBlock})`);
          }
        }
      } catch (err) {
        console.error("[Indexer] Poll error:", err);
      }
    }, 12000);

    // Cleanup on process exit
    process.on("SIGINT", () => {
      clearInterval(pollInterval);
      console.log("[Indexer] Stopped.");
      process.exit(0);
    });
  }

  private async dispatchEvent(event: IndexedEvent) {
    const handler = this.eventHandlers.get(event.type);
    if (handler) {
      try {
        await handler(event);
      } catch (err) {
        console.error(`[Indexer] Handler error for ${event.type}:`, err);
      }
    }
  }
}

export default EventIndexer;
