# <h1 align="center"> inflow-js </h1>

# Introduction

inflow-js provides an ES6 class interface for calling inflow protocol smart contract functions as well as non-smart contract methods for formatting inputs and outputs.

# API

### Data

```typescript
class Inflow {
  // provider is an object holding data and functions for interfacing with a blockchain node
  // It is our connection to the blockchain
  public provider: providers.Provider;
  // chainId is the numeric id associated with the blockchain we intend to connect to.
  // matic's chainId is 137
  public chainId: ChainId;
  // abis is a Map where keys are names of smart contracts and values are application binary interfaces for that contract
  // Our JS convenience library needs ABIs in order to make executable GET/POST requests to a blockchain node
  public abis: ABIs;
  // addresses is an object mapping contract names to addresses on the blockchain
  // ex. socialToken: 0xa4fa..
  public addresses: Addresses;
  // inflow1155BC is the ES6 class representation of the Inflow1155BC smart contract
  // we call methods on these ES6 classes as a convenience
  // Under the hood, these classes are formatting data payloads for proper GET/POSTs to blockchain nodes.
  public inflow1155BC: Inflow1155BC;
  // socialToken is the ES6 class representation of the SocialToken smart contract
  public socialToken: SocialToken;
  // inflow1155 is the ES6 class representation of the Inflow1155 smart contract
  public inflow1155: Inflow1155;
  // inflow721 is the ES6 class representation of the Inflow721 smart contract
  public inflow721: Inflow721;
  // usdc is the ES6 class representation of the USDC smart contract
  public usdc: IERC20;
  // ipfsClient is a class/object representation of the client from which we can store NFT metadata on IPFS
  public ipfsClient?: NFTStorage;
}
```

### Constructor

```typescript
/// @param blockchain provider class/object
/// @param chainId is an optional number representing this blockchain's numeric ID
constructor(provider: providers.Provider, chainId?: ChainId) {
    // if no chainId passed in, set chainId to matic
    this.chainId = chainId ?? 137;
    // store provider
    this.provider = provider;
    // store addresses object based on chainId
    this.addresses = getAddressesByChainId(addressesByChainId, this.chainId);
    // store contract ABIs
    this.abis = inflowABIs;
    // store configured contract classes/objects
    this.inflow1155BC = new Contract(
      this.addresses.inflow1155BC, // address
      getAbi(this.abis, "inflow1155BC"), // ABI
      provider // web3/blockchain provider
    ) as Inflow1155BC;
    this.socialToken = new Contract(
      this.addresses.socialToken,
      getAbi(this.abis, "socialToken"),
      provider
    ) as SocialToken;
    this.inflow1155 = new Contract(
      this.addresses.inflow1155,
      getAbi(this.abis, "inflow1155"),
      provider
    ) as Inflow1155;
    this.inflow721 = new Contract(
      this.addresses.inflow721,
      getAbi(this.abis, "inflow721"),
      provider
    ) as Inflow721;
    this.usdc = new Contract(
      this.addresses.usdc,
      getAbi(this.abis, "erc20"),
      provider
    ) as IERC20;
  }
```

### Inflow1155BC Methods

```typescript
/// @dev Get Mint price given bonding curve and supply
/// @param curve: Can be number, string, BigNumber, but must resolve to 0, 1, or 2
/// @param supply: Current supply of the token. Can be number, string, BigNumber
/// @param format? Optional formatting boolean to receive formatted USDC value
/// @return If formatted, returns scaled down price as string, otherwise BigNumber object
async getMintPrice1155(
   curve: BigNumberish,
   supply: BigNumberish,
   format?: boolean
 ): Promise<BigNumOrStr> {
   // smart contract returns mint price
   const price = await this.inflow1155BC.getMintPrice(curve, supply);
   // return price
   return format ? this.formatUsdc(price) : price;
 }

/// @dev Get Burn price given bonding curve and supply
/// @param curve: Can be number, string, BigNumber, but must resolve to 0, 1, or 2
/// @param supply: Current supply of the token. Can be number, string, BigNumber
/// @param format? Optional formatting boolean to receive formatted USDC value
/// @return If formatted, returns scaled down price as string, otherwise BigNumber object
 async getBurnPrice1155(
   curve: BigNumberish,
   supply: BigNumberish,
   format?: boolean
 ): Promise<BigNumOrStr> {
   // smart contract returns burn price
   const price = await this.inflow1155BC.getBurnPrice(curve, supply);
   // return price
   return format ? this.formatUsdc(price) : price;
 }

/// @dev Get next Mint price given tokenId
/// @param tokenId: numeric identifier of token in smart contract
/// @param format? Optional formatting boolean to receive formatted USDC value
/// @return If formatted, returns scaled down price as string, otherwise BigNumber object
 async getNextMintPrice(
   tokenId: BigNumberish,
   format?: boolean
 ): Promise<BigNumOrStr> {
   // get token data from smart contract
   // destructure token's current supply and bonding curve number value
   const { curve, supply } = await this.inflow1155BC.getToken(tokenId);
   // Calculate new supply by incrementing current supply
   const newSupply = supply._value.add(1);
   // smart contract returns mint price
   const price = await this.inflow1155BC.getMintPrice(curve, newSupply);
   // return price
   return format ? this.formatUsdc(price) : price;
 }

/// @dev Get next Burn price given tokenId
/// @param tokenId: numeric identifier of token in smart contract
/// @param format? Optional formatting boolean to receive formatted USDC value
/// @return If formatted, returns scaled down price as string, otherwise BigNumber object
  async getNextBurnPrice(
   tokenId: BigNumberish,
   format?: boolean
 ): Promise<BigNumOrStr> {
   // get token data from smart contract
   // destructure token's current supply and bonding curve number value
   const { curve, supply } = await this.inflow1155BC.getToken(tokenId);
   // smart contract returns burn price
   // use current supply because we are burning token at this supply
   const price = await this.inflow1155BC.getBurnPrice(curve, supply._value);
   // return price
   return format ? this.formatUsdc(price) : price;
 }

/// @dev Returns price for an aritst to create an origianl NFT
/// @param format? Optional formatting boolean to receive formatted USDC value
/// @return If formatted, returns scaled down price as string, otherwise BigNumber object
  async getCreatePrice(format?: boolean): Promise<BigNumOrStr> {
   // smart contract returns original NFT creation price
   const price = await this.inflow1155BC.createPrice();
   // return price
   return format ? this.formatUsdc(price) : price;
 }

/// @dev Returns last {user, value} array where user is royalty address and value is royalty value
/// @param next: optional boolean flag to calculate next royalty array as opposed to previous
 async getRoyaltiesPaid(
   tokenId: BigNumberish,
   next?: boolean
 ): Promise<BigNumber[]> {
   const { supply, curve, price } = await this.inflow1155BC.getToken(tokenId);
   const mintPrice =
     curve === 0
       ? price
       : await this.inflow1155BC.getMintPrice(
           curve,
           next ? supply._value.add(1) : supply._value
         );
   const burnPrice =
     curve === 0
       ? price.mul(85).div(100)
       : await this.inflow1155BC.getBurnPrice(
           curve,
           next ? supply._value.add(1) : supply._value
         );
   const totalFee = mintPrice.sub(burnPrice);
   const totalCreatorFee = await this.inflow1155BC.getCreatorFee(totalFee);
   const royalties = await this.inflow1155BC.getRoyalties(tokenId);
   return royalties.map(({ value }) => totalCreatorFee.mul(value).div(10000));
 }
```
