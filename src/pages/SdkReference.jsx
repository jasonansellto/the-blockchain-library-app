import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ArrowRight, BookOpen } from 'lucide-react';
import Seo from '@/components/Seo';
import { buildBreadcrumbSchema } from '@/lib/seoSchemas';
import CodeBlock from '@/components/CodeBlock';

const SDKS = [
  {
    name: 'ethers.js',
    version: 'v6',
    language: 'javascript',
    desc: 'Complete Ethereum wallet and smart contract library for JavaScript.',
    docs: 'https://docs.ethers.org',
    install: 'npm install ethers',
    snippet: `import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider("https://rpc.ankr.com/eth");
const balance = await provider.getBalance("0x...");
console.log(ethers.formatEther(balance));`,
    tags: ['ethereum', 'evm'],
  },
  {
    name: 'viem',
    version: 'v2',
    language: 'typescript',
    desc: 'TypeScript interface for Ethereum — fast, lightweight, modular.',
    docs: 'https://viem.sh',
    install: 'npm install viem',
    snippet: `import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";

const client = createPublicClient({
  chain: mainnet,
  transport: http(),
});

const blockNumber = await client.getBlockNumber();`,
    tags: ['ethereum', 'evm', 'typescript'],
  },
  {
    name: 'web3.js',
    version: 'v4',
    language: 'javascript',
    desc: 'Ethereum JavaScript API — interact with smart contracts and nodes.',
    docs: 'https://docs.web3js.org',
    install: 'npm install web3',
    snippet: `import Web3 from "web3";

const web3 = new Web3("https://rpc.ankr.com/eth");
const balance = await web3.eth.getBalance("0x...");
console.log(web3.utils.fromWei(balance, "ether"));`,
    tags: ['ethereum', 'evm'],
  },
  {
    name: 'wagmi',
    version: 'v2',
    language: 'typescript',
    desc: 'React Hooks for Ethereum — wallets, contracts, transactions.',
    docs: 'https://wagmi.sh',
    install: 'npm install wagmi viem',
    snippet: `import { useAccount, useBalance } from "wagmi";

function Wallet() {
  const { address } = useAccount();
  const { data: balance } = useBalance({ address });
  return <p>{balance?.formatted} {balance?.symbol}</p>;
}`,
    tags: ['ethereum', 'react', 'evm'],
  },
  {
    name: 'solana-web3',
    version: 'v1',
    language: 'javascript',
    desc: 'Solana JavaScript SDK for interacting with the Solana blockchain.',
    docs: 'https://solana-labs.github.io/solana-web3.js',
    install: 'npm install @solana/web3.js',
    snippet: `import { Connection, PublicKey } from "@solana/web3.js";

const conn = new Connection("https://api.mainnet-beta.solana.com");
const balance = await conn.getBalance(
  new PublicKey("...")
);
console.log(balance / 1e9);`,
    tags: ['solana'],
  },
  {
    name: 'web3.py',
    version: 'v6',
    language: 'python',
    desc: 'Python library for interacting with Ethereum.',
    docs: 'https://web3py.readthedocs.io',
    install: 'pip install web3',
    snippet: `from web3 import Web3

w3 = Web3(Web3.HTTPProvider("https://rpc.ankr.com/eth"))
balance = w3.eth.get_balance("0x...")
print(w3.from_wei(balance, "ether"))`,
    tags: ['ethereum', 'python', 'evm'],
  },
  {
    name: 'RainbowKit',
    version: 'v2',
    language: 'typescript',
    desc: 'React wallet connection UI built on wagmi — beautiful, customizable.',
    docs: 'https://rainbowkit.com',
    install: 'npm install @rainbow-me/rainbowkit wagmi viem',
    snippet: `import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";

const config = getDefaultConfig({
  appName: "My DApp",
  projectId: "YOUR_PROJECT_ID",
  chains: [mainnet],
  ssr: true,
});

export default function App() {
  return (
    <RainbowKitProvider>
      <YourApp />
    </RainbowKitProvider>
  );
}`,
    tags: ['ethereum', 'react', 'wallet', 'evm'],
  },
  {
    name: 'ConnectKit',
    version: 'v1',
    language: 'typescript',
    desc: 'Family-friendly wallet connector for React built on wagmi.',
    docs: 'https://docs.family.co/connectkit',
    install: 'npm install connectkit wagmi viem',
    snippet: `import { ConnectKitProvider, getDefaultConfig } from "connectkit";

const config = getDefaultConfig({
  appName: "My DApp",
  walletConnectProjectId: "YOUR_PROJECT_ID",
  chains: [mainnet],
});`,
    tags: ['ethereum', 'react', 'wallet', 'evm'],
  },
  {
    name: 'Web3-Onboard',
    version: 'v2',
    language: 'typescript',
    desc: 'Framework-agnostic wallet connection framework by Blocknative.',
    docs: 'https://onboard.blocknative.com',
    install: 'npm install @web3-onboard/react',
    snippet: `import Onboard from "@web3-onboard/core";

const onboard = Onboard({
  wallets: [injectedModule()],
  chains: [{ id: "0x1", token: "ETH", label: "Ethereum", rpcUrl: "https://rpc.ankr.com/eth" }],
  appMetadata: { name: "My DApp" },
});`,
    tags: ['ethereum', 'wallet', 'evm'],
  },
  {
    name: 'Moralis',
    version: 'v2',
    language: 'typescript',
    desc: 'Unified API for NFTs, tokens, transactions, and blockchain data across chains.',
    docs: 'https://docs.moralis.io',
    install: 'npm install moralis',
    snippet: `import Moralis from "moralis";

await Moralis.start({ apiKey: "YOUR_API_KEY" });

const balance = await Moralis.EvmApi.token.getWalletTokenBalances({
  address: "0x...",
  chain: "0x1",
});`,
    tags: ['ethereum', 'multi-chain', 'api', 'evm'],
  },
  {
    name: 'Alchemy SDK',
    version: 'v3',
    language: 'typescript',
    desc: 'Official SDK for Alchemy APIs — enhanced NFT, token, and transaction data.',
    docs: 'https://docs.alchemy.com/reference/api-sdk-3',
    install: 'npm install @alchemy/alchemy-sdk',
    snippet: `import { Alchemy, Network } from "alchemy-sdk";

const alchemy = new Alchemy({ apiKey: "demo", network: Network.ETH_MAINNET });
const balance = await alchemy.core.getBalance("0x...");
console.log(balance);`,
    tags: ['ethereum', 'multi-chain', 'api', 'evm'],
  },
  {
    name: 'Hardhat',
    version: 'v2',
    language: 'javascript',
    desc: 'Ethereum development environment for compiling, testing, and deploying contracts.',
    docs: 'https://hardhat.org/docs',
    install: 'npm install --save-dev hardhat',
    snippet: `// scripts/deploy.js
const hre = require("hardhat");

async function main() {
  const Token = await hre.ethers.getContractFactory("Token");
  const token = await Token.deploy();
  await token.waitForDeployment();
  console.log("Deployed to:", await token.getAddress());
}
main();`,
    tags: ['ethereum', 'tooling', 'evm'],
  },
  {
    name: 'Foundry',
    version: 'v1',
    language: 'rust',
    desc: 'Blazing-fast Solidity toolkit — forge, cast, anvil. Written in Rust.',
    docs: 'https://book.getfoundry.sh',
    install: 'curl -L https://foundry.paradigm.xyz | bash',
    snippet: `// Deploy & verify with forge
forge create --rpc-url $RPC \\
  --private-key $PK \\
  src/Token.sol:Token \\
  --verify --etherscan-api-key $KEY

// Cast a call to read balance
cast call 0xTOKEN "balanceOf(address)(uint256)" 0xUSER \\
  --rpc-url $RPC`,
    tags: ['ethereum', 'tooling', 'solidity', 'evm'],
  },
  {
    name: 'OpenZeppelin',
    version: 'v5',
    language: 'solidity',
    desc: 'Battle-tested smart contract libraries — ERC-20, ERC-721, access control, security.',
    docs: 'https://docs.openzeppelin.com/contracts',
    install: 'npm install @openzeppelin/contracts',
    snippet: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyToken is ERC20 {
  constructor() ERC20("MyToken", "MTK") {
    _mint(msg.sender, 1_000_000 * 10 ** decimals());
  }
}`,
    tags: ['ethereum', 'solidity', 'evm', 'security'],
  },
  {
    name: 'Solady',
    version: 'v0.1',
    language: 'solidity',
    desc: 'Gas-optimized Solidity snippets and alternative to OpenZeppelin.',
    docs: 'https://github.com/Vectorized/solady',
    install: 'forge install vectorized/solady',
    snippet: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { ERC20 } from "solady/tokens/ERC20.sol";

contract MyToken is ERC20 {
  function name() public pure override returns (string memory) { return "MyToken"; }
  function symbol() public pure override returns (string memory) { return "MTK"; }
}`,
    tags: ['ethereum', 'solidity', 'gas-optimized', 'evm'],
  },
  {
    name: 'Brownie',
    version: 'v1',
    language: 'python',
    desc: 'Python-based development and testing framework for Solidity smart contracts.',
    docs: 'https://eth-brownie.readthedocs.io',
    install: 'pip install eth-brownie',
    snippet: `from brownie import accounts, Token

def main():
    acct = accounts.load("dev")
    token = Token.deploy("MyToken", "MTK", 1e24, {"from": acct})
    print(f"Deployed: {token.address}")`,
    tags: ['ethereum', 'python', 'tooling', 'evm'],
  },
  {
    name: 'Ape',
    version: 'v0.8',
    language: 'python',
    desc: 'Smart contract development framework for Python — the successor to Brownie.',
    docs: 'https://docs.apeworx.io',
    install: 'pip install ape',
    snippet: `from ape import accounts, project

def main():
    acct = accounts.load("dev")
    token = acct.deploy(project.Token)
    print(f"Deployed: {token.address}")`,
    tags: ['ethereum', 'python', 'tooling', 'evm'],
  },
  {
    name: 'Truffle',
    version: 'v5',
    language: 'javascript',
    desc: 'Classic Ethereum development suite for contracts, tests, and migrations.',
    docs: 'https://trufflesuite.com/docs/truffle',
    install: 'npm install -g truffle',
    snippet: `// migrations/2_deploy.js
const Token = artifacts.require("Token");

module.exports = function (deployer) {
  deployer.deploy(Token);
};`,
    tags: ['ethereum', 'tooling', 'evm'],
  },
  {
    name: 'ethers.rs',
    version: 'v2',
    language: 'rust',
    desc: 'Rust port of ethers.js — EVM wallet, provider, and contract bindings.',
    docs: 'https://docs.rs/ethers',
    install: 'cargo add ethers',
    snippet: `use ethers::providers::{Provider, Http};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let provider = Provider::<Http>::try_from("https://rpc.ankr.com/eth")?;
    let block = provider.get_block_number().await?;
    println!("Block: {block}");
    Ok(())
}`,
    tags: ['ethereum', 'rust', 'evm'],
  },
  {
    name: 'go-ethereum',
    version: 'v1.14',
    language: 'go',
    desc: 'Official Go implementation of Ethereum — Geth client and ethclient SDK.',
    docs: 'https://geth.ethereum.org/docs',
    install: 'go get github.com/ethereum/go-ethereum',
    snippet: `package main

import (
  "context"
  "fmt"
  "github.com/ethereum/go-ethereum/ethclient"
)

func main() {
  client, _ := ethclient.Dial("https://rpc.ankr.com/eth")
  block, _ := client.BlockByNumber(context.Background(), nil)
  fmt.Println("Block:", block.Number())
}`,
    tags: ['ethereum', 'go', 'evm'],
  },
  {
    name: 'cosmos-sdk',
    version: 'v0.50',
    language: 'go',
    desc: 'Framework for building application-specific blockchains in the Cosmos ecosystem.',
    docs: 'https://docs.cosmos.network',
    install: 'go get github.com/cosmos/cosmos-sdk',
    snippet: `package main

import (
  "github.com/cosmos/cosmos-sdk/client"
  "github.com/cosmos/cosmos-sdk/types/tx"
)

// Broadcast a Cosmos transaction
func main() {
  ctx := client.Context{}
  _ = ctx.WithTxConfig(tx.NewTxConfig())
}`,
    tags: ['cosmos', 'go'],
  },
  {
    name: 'CosmWasm',
    version: 'v2',
    language: 'rust',
    desc: 'Smart contract platform for Cosmos chains — write contracts in Rust.',
    docs: 'https://docs.cosmwasm.com',
    install: 'cargo install cosmwasm-check',
    snippet: `use cosmwasm_std::{entry_point, DepsMut, MessageInfo, Response};

#[entry_point]
pub fn execute(
  _deps: DepsMut,
  _info: MessageInfo,
  msg: ExecuteMsg,
) -> Result<Response, cosmwasm_std::StdError> {
  match msg {
    ExecuteMsg::Increment {} => Ok(Response::new()
      .add_attribute("action", "increment")),
  }
}`,
    tags: ['cosmos', 'rust', 'wasm'],
  },
  {
    name: 'polkadot.js',
    version: 'v14',
    language: 'typescript',
    desc: 'JavaScript SDK for Polkadot & Substrate chains — RPC, keys, extrinsics.',
    docs: 'https://polkadot.js.org/docs',
    install: 'npm install @polkadot/api',
    snippet: `import { ApiPromise, WsProvider } from "@polkadot/api";

const provider = new WsProvider("wss://rpc.polkadot.io");
const api = await ApiPromise.create({ provider });
const block = await api.rpc.chain.getBlock();
console.log("Block:", block.block.header.number.toString());`,
    tags: ['polkadot', 'substrate'],
  },
  {
    name: 'near-api-js',
    version: 'v3',
    language: 'javascript',
    desc: 'JavaScript SDK for NEAR Protocol — accounts, contracts, transactions.',
    docs: 'https://docs.near.org/tools/near-api-js',
    install: 'npm install near-api-js',
    snippet: `import { connect, keyStores } from "near-api-js";

const near = await connect({
  networkId: "mainnet",
  keyStore: new keyStores.BrowserLocalStorageKeyStore(),
  nodeUrl: "https://rpc.mainnet.near.org",
});
const account = await near.account("example.near");
const balance = await account.getAccountBalance();
console.log(balance.total);`,
    tags: ['near'],
  },
  {
    name: 'aptos-sdk',
    version: 'v1',
    language: 'typescript',
    desc: 'Official SDK for the Aptos blockchain — accounts, transactions, resources.',
    docs: 'https://aptos.dev/sdks/ts-sdk',
    install: 'npm install @aptos-labs/ts-sdk',
    snippet: `import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

const aptos = new Aptos(new AptosConfig({ network: Network.MAINNET }));
const balance = await aptos.getAccountBalance({
  accountAddress: "0x...",
});
console.log(balance);`,
    tags: ['aptos', 'move'],
  },
  {
    name: 'starknet.js',
    version: 'v6',
    language: 'typescript',
    desc: 'JavaScript SDK for Starknet — accounts, contracts, and RPC calls.',
    docs: 'https://www.starknetjs.com',
    install: 'npm install starknet',
    snippet: `import { RpcProvider, Account } from "starknet";

const provider = new RpcProvider({ nodeUrl: "https://starknet-mainnet.public.blastapi.io" });
const account = new Account(provider, "0x...", "0x...");
const balance = await account.getBalance();
console.log(balance);`,
    tags: ['starknet', 'evm', 'zk'],
  },
  {
    name: 'fuels-ts',
    version: 'v0.95',
    language: 'typescript',
    desc: 'TypeScript SDK for Fuel Network — the fastest modular execution layer.',
    docs: 'https://docs.fuel.network/docs/fuels-ts',
    install: 'npm install fuels',
    snippet: `import { Provider, Wallet } from "fuels";

const provider = await Provider.create("https://mainnet.fuel.network/v1/graphql");
const wallet = Wallet.fromPrivateKey("0x...", provider);
const balance = await wallet.getBalance();
console.log(balance.toString());`,
    tags: ['fuel', 'modular'],
  },
  {
    name: 'hedera-sdk',
    version: 'v2',
    language: 'javascript',
    desc: 'Official SDK for Hedera Hashgraph — crypto transfers, tokens, smart contracts.',
    docs: 'https://docs.hedera.com/hedera/sdks-and-tools/sdks',
    install: 'npm install @hashgraph/sdk',
    snippet: `import { Client, AccountBalanceQuery } from "@hashgraph/sdk";

const client = Client.forMainnet();
client.setOperator(myAccountId, myPrivateKey);

const balance = await new AccountBalanceQuery()
  .setAccountId("0.0.1")
  .execute(client);
console.log(balance.hbars.toString());`,
    tags: ['hedera', 'dag'],
  },
  {
    name: 'tronweb',
    version: 'v6',
    language: 'javascript',
    desc: 'JavaScript SDK for TRON — interact with nodes, contracts, and TRC tokens.',
    docs: 'https://developers.tron.network/docs/tron-web-intro',
    install: 'npm install tronweb',
    snippet: `import TronWeb from "tronweb";

const tronWeb = new TronWeb({
  fullHost: "https://api.trongrid.io",
  privateKey: "YOUR_PRIVATE_KEY",
});
const balance = await tronWeb.trx.getBalance("...");
console.log(balance / 1e6);`,
    tags: ['tron', 'evm'],
  },
  {
    name: 'eosjs',
    version: 'v22',
    language: 'javascript',
    desc: 'JavaScript SDK for EOSIO blockchains — actions, transactions, and RPC.',
    docs: 'https://developers.eos.io/welcome/v2.1/introduction-to-eosio/index',
    install: 'npm install eosjs',
    snippet: `import { Api, JsonRpc } from "eosjs";

const rpc = new JsonRpc("https://eos.greymass.com", { fetch });
const api = new Api({ rpc });
const info = await rpc.get_info();
console.log(info.head_block_num);`,
    tags: ['eosio', 'dpos'],
  },
  {
    name: 'taquito',
    version: 'v22',
    language: 'typescript',
    desc: 'TypeScript SDK for Tezos — smart contracts, wallets, and baking operations.',
    docs: 'https://tezostaquito.io',
    install: 'npm install @taquito/taquito',
    snippet: `import { TezosToolkit } from "@taquito/taquito";

const Tezos = new TezosToolkit("https://mainnet.api.tez.ie");
const balance = await Tezos.tz.getBalance("tz1...");
console.log(balance.toNumber() / 1e6);`,
    tags: ['tezos'],
  },
  {
    name: 'stellar-sdk',
    version: 'v12',
    language: 'javascript',
    desc: 'Official JavaScript SDK for Stellar — payments, assets, and transactions.',
    docs: 'https://developers.stellar.org/docs/sdks/js',
    install: 'npm install stellar-sdk',
    snippet: `import { Horizon } from "stellar-sdk";

const server = new Horizon.Server("https://horizon.stellar.org");
const account = await server.loadAccount("G...");
console.log(account.balances);`,
    tags: ['stellar'],
  },
  {
    name: 'cardano-serialization-lib',
    version: 'v14',
    language: 'rust',
    desc: 'Rust library for Cardano transaction building, signing, and serialization.',
    docs: 'https://github.com/Emurgo/cardano-serialization-lib',
    install: 'npm install @emurgo/cardano-serialization-lib-browser',
    snippet: `import * as CSL from "@emurgo/cardano-serialization-lib-browser";

const amount = CSL.Value.new(CSL.BigNum.from_str("1000000"));
console.log(amount.coin().to_str());`,
    tags: ['cardano', 'rust', 'utxo'],
  },
  {
    name: 'multiversx-sdk',
    version: 'v13',
    language: 'typescript',
    desc: 'Official SDK for Multiversx (formerly Elrond) — wallets, transactions, contracts.',
    docs: 'https://docs.multiversx.com/sdk-and-tools/sdk-ts',
    install: 'npm install @multiversx/sdk-core @multiversx/sdk-network-providers',
    snippet: `import { ApiNetworkProvider } from "@multiversx/sdk-network-providers";

const provider = new ApiNetworkProvider("https://api.multiversx.com");
const account = await provider.getAccount("erd1...");
console.log(account.balance);`,
    tags: ['multiversx', 'elrond'],
  },
  {
    name: 'avalanchejs',
    version: 'v4',
    language: 'typescript',
    desc: 'JavaScript SDK for Avalanche — C-Chain, P-Chain, X-Chain, and subnets.',
    docs: 'https://docs.avax.network/tooling/avalanchejs',
    install: 'npm install avalanche',
    snippet: `import { Avalanche } from "avalanche";

const avax = new Avalanche("api.avax.network", 443, "https");
const xchain = avax.XChain();
const balance = await xchain.getBalance("X-avax1...", "AVAX");
console.log(balance.balance);`,
    tags: ['avalanche', 'evm', 'subnet'],
  },
  {
    name: 'neo3',
    version: 'v3',
    language: 'javascript',
    desc: 'JavaScript SDK for NEO N3 blockchain — smart contracts and wallets.',
    docs: 'https://dojo.coz.io/neo3/indexer',
    install: 'npm install @cityofzion/neon-js',
    snippet: `import { rpc } from "@cityofzion/neon-js";

const client = new rpc.RPCClient("https://mainnet1.neo.coz.io:443");
const block = await client.getBlockCount();
console.log("Block:", block);`,
    tags: ['neo', 'evm'],
  },
  {
    name: 'flow-js',
    version: 'v1',
    language: 'javascript',
    desc: 'JavaScript SDK for Flow blockchain — Cadence scripts, transactions, and accounts.',
    docs: 'https://developers.flow.com/tools/clients/flobot-js',
    install: 'npm install @onflow/fcl',
    snippet: `import * as fcl from "@onflow/fcl";

fcl.config()
  .put("accessNode.api", "https://rest-mainnet.onflow.org");

const balance = await fcl.query({
  cadence: \`
    import FungibleToken from 0xf233dcee88fe0abe
    pub fun main(addr: Address): UFix64 {
      return 0.0
    }
  \`,
  args: (arg, t) => [arg("0x...", t.Address)],
});
console.log(balance);`,
    tags: ['flow', 'cadence'],
  },
  {
    name: 'iota-sdk',
    version: 'v1',
    language: 'typescript',
    desc: 'Official SDK for IOTA — Tangle-based transactions and digital assets.',
    docs: 'https://wiki.iota.org/tutorials',
    install: 'npm install @iota/sdk',
    snippet: `import { Client } from "@iota/sdk";

const client = new Client({ nodes: ["https://api.mainnet.iota.cafe"] });
const info = await client.getInfo();
console.log(info.nodeInfo.name);`,
    tags: ['iota', 'dag'],
  },
  {
    name: 'lisk-sdk',
    version: 'v6',
    language: 'javascript',
    desc: 'SDK for building Lisk-compatible sidechains and applications.',
    docs: 'https://lisk.com/documentation/lisk-sdk',
    install: 'npm install lisk-sdk',
    snippet: `import { apiClient } from "lisk-sdk";

const client = await apiClient.createWSClient("wss://mainnet.lisk.com/ws");
const info = await client.node.getNodeInfo();
console.log(info.height);`,
    tags: ['lisk', 'dpos'],
  },
  {
    name: 'gear-js',
    version: 'v0.42',
    language: 'typescript',
    desc: 'JavaScript SDK for Gear Network — wasm smart contracts on Substrate.',
    docs: 'https://wiki.gear-tech.io',
    install: 'npm install @gear-js/api',
    snippet: `import { GearApi } from "@gear-js/api";

const api = await GearApi.create({ providerAddress: "wss://rpc-vara.gear-tech.io" });
const block = await api.blocks.getLatest();
console.log(block);`,
    tags: ['gear', 'substrate', 'wasm'],
  },
  {
    name: 'ethers-php',
    version: 'v0.3',
    language: 'php',
    desc: 'PHP Ethereum client and wallet library, inspired by ethers.js.',
    docs: 'https://docs.web3p.org/ethers.php',
    install: 'composer require web3p/ethers',
    snippet: `use Ethers\\Provider\\Provider;

$provider = Provider::fromJsonRpc("https://rpc.ankr.com/eth");
$balance = $provider->getBalance("0x...");
echo $balance->toString();`,
    tags: ['ethereum', 'php', 'evm'],
  },
  {
    name: 'Nethereum',
    version: 'v4',
    language: 'csharp',
    desc: '.NET integration library for Ethereum — RPC, contracts, signing.',
    docs: 'https://docs.nethereum.com',
    install: 'dotnet add package Nethereum.Web3',
    snippet: `using Nethereum.Web3;

var web3 = new Web3("https://rpc.ankr.com/eth");
var balance = await web3.Eth.GetBalance.SendRequestAsync("0x...");
Console.WriteLine(balance.Value);`,
    tags: ['ethereum', 'dotnet', 'evm'],
  },
  {
    name: 'web3j',
    version: 'v4',
    language: 'java',
    desc: 'Java/Android library for Ethereum — wallets, smart contracts, and RPC.',
    docs: 'https://docs.web3j.io',
    install: "implementation 'org.web3j:core:4.12.0'",
    snippet: `import org.web3j.protocol.Web3j;
import org.web3j.protocol.http.HttpService;

Web3j web3 = Web3j.build(new HttpService("https://rpc.ankr.com/eth"));
var balance = web3.ethGetBalance("0x...", DefaultBlockParameterName.LATEST)
  .send();
System.out.println(balance.getBalance());`,
    tags: ['ethereum', 'java', 'evm'],
  },
];

export default function SdkReference() {
  const schemas = [buildBreadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'Developer Hub', url: '/developers' }, { name: 'SDK Reference', url: '/developers/sdks' }])];

  return (
    <div>
      <Seo title="SDK Reference" description="Quick-start guides and code examples for 40+ blockchain developer SDKs — ethers.js, viem, wagmi, Foundry, OpenZeppelin, Cosmos SDK, polkadot.js, and more across every major ecosystem." schemas={schemas} />
      <div className="border-b border-slate-100 bg-slate-50">
        <div className="container-tbl py-10">
          <nav className="flex items-center gap-1.5 text-sm text-slate-400 mb-3 flex-wrap">
            <Link to="/" className="hover:text-blue-600">Home</Link><ChevronRight className="w-3.5 h-3.5" />
            <Link to="/developers" className="hover:text-blue-600">Developer Hub</Link><ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-700 font-medium">SDK Reference</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-2">SDK Reference</h1>
          <p className="text-slate-500 max-w-2xl">Quick-start guides and code examples for {SDKS.length} blockchain developer SDKs across every major ecosystem — EVM, Solana, Cosmos, Polkadot, NEAR, Aptos, Starknet, and more. Each card includes install instructions and a working code example.</p>
        </div>
      </div>

      <div className="container-tbl py-10">
        <div className="space-y-8">
          {SDKS.map(sdk => (
            <div key={sdk.name} className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight font-mono">{sdk.name}</h2>
                  <span className="px-2 py-0.5 text-xs font-mono font-medium bg-slate-100 text-slate-600 rounded-full">{sdk.version}</span>
                  <span className="px-2 py-0.5 text-xs font-mono font-medium bg-purple-50 text-purple-700 rounded-full capitalize">{sdk.language}</span>
                </div>
                <a href={sdk.docs} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:gap-2 transition-all">
                  Official Docs <ArrowRight className="w-4 h-4" />
                </a>
              </div>
              <p className="text-sm text-slate-500 mb-4">{sdk.desc}</p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Install</p>
                  <CodeBlock code={sdk.install} language="bash" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Quick Start</p>
                  <CodeBlock code={sdk.snippet} language={sdk.language} />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 flex-wrap">
                {sdk.tags.map(t => (
                  <span key={t} className="px-2.5 py-0.5 text-xs font-medium bg-slate-100 text-slate-600 rounded-full capitalize">{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}