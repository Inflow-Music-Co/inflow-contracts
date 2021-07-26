import {
  Contract,
  ContractInterface,
  utils,
  providers,
  BigNumber,
  BigNumberish,
  ContractReceipt,
} from "ethers";
import { NFTStorage, Blob, File } from "nft.storage";
import {
  inflowAddressesByChainId,
  getAddressesByChainId,
  inflowABIs,
  getAbi,
} from "./constants";
import {
  ChainId,
  Contracts,
  FormattedAndBNTuple,
  Addresses,
  ABIs,
  Part,
  Token1155,
  NFT,
  WhitelistEnabled,
  ERC1155,
  ERC20,
  CIDString,
  NftStorageConfig,
  StoreDirectoryData,
  NFTContract,
  Inflow1155BC,
  Inflow1155,
  Inflow721,
  SocialToken,
  IERC20,
  SocialTokenOrInflow1155BC,
  SocialTokenFactory,
} from "./types";

export class Inflow {
  public provider: providers.Provider;
  public chainId: ChainId;
  public abis: ABIs;
  public addresses: Addresses;
  public inflow1155BC: Inflow1155BC;
  public inflow1155: Inflow1155;
  public inflow721: Inflow721;
  public usdc: IERC20;
  public socialTokenFactory: SocialTokenFactory;
  public ipfsClient?: NFTStorage;

  constructor(provider: providers.Provider, chainId?: ChainId) {
    this.chainId = chainId ?? 137;
    this.provider = provider;
    this.addresses = getAddressesByChainId(
      inflowAddressesByChainId,
      this.chainId
    );
    this.abis = inflowABIs;
    this.inflow1155BC = new Contract(
      this.addresses.Inflow1155BC,
      getAbi(this.abis, "Inflow1155BC"),
      provider
    ) as Inflow1155BC;
    this.inflow1155 = new Contract(
      this.addresses.Inflow1155,
      getAbi(this.abis, "Inflow1155"),
      provider
    ) as Inflow1155;
    this.inflow721 = new Contract(
      this.addresses.Inflow721,
      getAbi(this.abis, "Inflow721"),
      provider
    ) as Inflow721;
    this.usdc = new Contract(
      this.addresses.MockUSDC,
      getAbi(this.abis, "ERC20"),
      provider
    ) as IERC20;
    this.socialTokenFactory = new Contract(
      this.addresses.SocialTokenFactory,
      getAbi(this.abis, "SocialTokenFactory"),
      provider
    ) as SocialTokenFactory;
  }

  ////////////////////////////
  /// INFLOW1155BC METHODS ///
  ////////////////////////////

  async getMintPrice1155(
    curve: BigNumberish,
    supply: BigNumberish
  ): Promise<FormattedAndBNTuple> {
    try {
      const price = await this.inflow1155BC.getMintPrice(curve, supply);
      return [this.formatUsdc(price), price];
    } catch (err) {
      throw err;
    }
  }

  async getBurnPrice1155(
    curve: BigNumberish,
    supply: BigNumberish
  ): Promise<FormattedAndBNTuple> {
    try {
      const price = await this.inflow1155BC.getBurnPrice(curve, supply);
      return [this.formatUsdc(price), price];
    } catch (err) {
      throw err;
    }
  }

  async getNextMintPrice(tokenId: BigNumberish): Promise<FormattedAndBNTuple> {
    try {
      const { curve, supply } = await this.inflow1155BC.getToken(tokenId);
      const newSupply = supply._value.add(1);
      const price = await this.inflow1155BC.getMintPrice(curve, newSupply);
      return [this.formatUsdc(price), price];
    } catch (err) {
      throw err;
    }
  }

  async getNextBurnPrice(tokenId: BigNumberish): Promise<FormattedAndBNTuple> {
    try {
      const { curve, supply } = await this.inflow1155BC.getToken(tokenId);
      const price = await this.inflow1155BC.getBurnPrice(curve, supply._value);
      return [this.formatUsdc(price), price];
    } catch (err) {
      throw err;
    }
  }

  async getCreatePrice(): Promise<FormattedAndBNTuple> {
    try {
      const price = await this.inflow1155BC.createPrice();
      return [this.formatUsdc(price), price];
    } catch (err) {
      throw err;
    }
  }

  async getRoyaltiesPaid(
    tokenId: BigNumberish,
    next?: boolean
  ): Promise<BigNumber[]> {
    try {
      const { supply, curve, price } = await this.inflow1155BC.getToken(
        tokenId
      );
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
      return royalties.map(({ value }) =>
        totalCreatorFee.mul(value).div(10000)
      );
    } catch (err) {
      throw err;
    }
  }

  ///////////////////////////////
  /// GENERAL ERC1155 METHODS ///
  ///////////////////////////////

  async getToken(
    tokenType: ERC1155,
    tokenId: BigNumberish
  ): Promise<Token1155> {
    try {
      const contract =
        tokenType === "Inflow1155BC" ? this.inflow1155BC : this.inflow1155;
      const token = await contract.getToken(tokenId);
      return token;
    } catch (err) {
      throw err;
    }
  }

  async uri(tokenType: ERC1155, tokenId: BigNumberish): Promise<string> {
    try {
      const contract =
        tokenType === "Inflow1155BC" ? this.inflow1155BC : this.inflow1155;
      const uri = await contract.uri(tokenId);
      return uri;
    } catch (err) {
      throw err;
    }
  }

  async balanceOf1155(
    tokenType: ERC1155,
    account: string,
    tokenId: BigNumberish
  ): Promise<BigNumber> {
    try {
      const contract =
        tokenType === "Inflow1155BC" ? this.inflow1155BC : this.inflow1155;
      const balance = await contract.balanceOf(account, tokenId);
      return balance;
    } catch (err) {
      throw err;
    }
  }

  async balanceOfBatch(
    tokenType: ERC1155,
    accounts: string[],
    tokenIds: BigNumberish[]
  ): Promise<BigNumber[]> {
    try {
      const contract =
        tokenType === "Inflow1155BC" ? this.inflow1155BC : this.inflow1155;
      const balances = await contract.balanceOfBatch(accounts, tokenIds);
      return balances;
    } catch (err) {
      throw err;
    }
  }

  /////////////////////////
  /// INFLOW721 METHODS ///
  /////////////////////////

  async balanceOf721(owner: string): Promise<BigNumber> {
    try {
      const balance = await this.inflow721.balanceOf(owner);
      return balance;
    } catch (err) {
      throw err;
    }
  }

  async ownerOf(tokenId: BigNumberish): Promise<string> {
    try {
      const owner = await this.inflow721.ownerOf(tokenId);
      return owner;
    } catch (err) {
      throw err;
    }
  }

  async getApproved(tokenId: BigNumberish): Promise<string> {
    try {
      const approvedAccount = await this.inflow721.getApproved(tokenId);
      return approvedAccount;
    } catch (err) {
      throw err;
    }
  }

  ///////////////////////////
  /// GENERAL NFT METHODS ///
  ///////////////////////////

  async getRoyalties(tokenType: NFT, tokenId: BigNumberish): Promise<Part[]> {
    try {
      const contract = this.getNFTContract(tokenType);
      const royalties = await contract.getRoyalties(tokenId);
      return royalties;
    } catch (err) {
      throw err;
    }
  }

  async isApprovedForAll(
    tokenType: NFT,
    account: string,
    operator: string
  ): Promise<boolean> {
    try {
      const contract = this.getNFTContract(tokenType);
      const approvedForAll = await contract.isApprovedForAll(account, operator);
      return approvedForAll;
    } catch (err) {
      throw err;
    }
  }

  ///////////////////////////
  /// SOCIALTOKEN METHODS ///
  ///////////////////////////

  async getMintPriceSocial(
    socialTokenAddress: string,
    amount: BigNumberish
  ): Promise<FormattedAndBNTuple> {
    try {
      const socialToken = new Contract(
        socialTokenAddress,
        getAbi(this.abis, "SocialToken"),
        this.provider
      ) as SocialToken;
      const price = await socialToken.getMintPrice(amount);
      return [this.formatUsdc(price), price];
    } catch (err) {
      throw err;
    }
  }

  async getBurnPriceSocial(
    socialTokenAddress: string,
    amount: BigNumberish
  ): Promise<FormattedAndBNTuple> {
    try {
      const socialToken = new Contract(
        socialTokenAddress,
        getAbi(this.abis, "SocialToken"),
        this.provider
      ) as SocialToken;
      const price = await socialToken.getBurnPrice(amount);
      return [this.formatUsdc(price), price];
    } catch (err) {
      throw err;
    }
  }

  //////////////////////////////////
  /// SOCIALTOKENFACTORY METHODS ///
  //////////////////////////////////

  async getTokenSocialFactory(creator: string): Promise<string> {
    try {
      const socialTokenAddress = await this.socialTokenFactory.getToken(
        creator
      );
      return socialTokenAddress;
    } catch (err) {
      throw err;
    }
  }

  ///////////////////////////////////////////
  /// SOCIALTOKEN OR INFLOW1155BC METHODS ///
  ///////////////////////////////////////////

  async getCreatorFee(
    tokenType: SocialTokenOrInflow1155BC,
    fee: BigNumberish,
    socialTokenAddress?: string
  ): Promise<FormattedAndBNTuple> {
    try {
      this.checkSocialToken(tokenType, socialTokenAddress);
      const contract =
        tokenType === "SocialToken"
          ? (new Contract(
              socialTokenAddress as string,
              getAbi(this.abis, "SocialToken"),
              this.provider
            ) as SocialToken)
          : this.inflow1155BC;
      const creatorFee = await contract.getCreatorFee(fee);
      return [this.formatUsdc(creatorFee), creatorFee];
    } catch (err) {
      throw err;
    }
  }

  /////////////////////
  /// ERC20 METHODS ///
  ////////////////////

  async balanceOf(
    tokenType: ERC20,
    account: string,
    socialTokenAddress?: string
  ): Promise<FormattedAndBNTuple> {
    try {
      this.checkSocialToken(tokenType, socialTokenAddress);
      const contract =
        tokenType === "SocialToken"
          ? (new Contract(
              socialTokenAddress as string,
              getAbi(this.abis, "SocialToken"),
              this.provider
            ) as SocialToken)
          : this.usdc;
      const balance = await contract.balanceOf(account);
      return [this.formatERC20(tokenType, balance), balance];
    } catch (err) {
      throw err;
    }
  }

  async totalSupply(
    tokenType: ERC20,
    socialTokenAddress?: string
  ): Promise<FormattedAndBNTuple> {
    try {
      this.checkSocialToken(tokenType, socialTokenAddress);
      const contract =
        tokenType === "SocialToken"
          ? (new Contract(
              socialTokenAddress as string,
              getAbi(this.abis, "SocialToken"),
              this.provider
            ) as SocialToken)
          : this.usdc;
      const supply = await contract.totalSupply();
      return [this.formatERC20(tokenType, supply), supply];
    } catch (err) {
      throw err;
    }
  }

  async allowance(
    tokenType: ERC20,
    owner: string,
    spender: string,
    socialTokenAddress?: string
  ): Promise<FormattedAndBNTuple> {
    try {
      this.checkSocialToken(tokenType, socialTokenAddress);
      const contract =
        tokenType === "SocialToken"
          ? (new Contract(
              socialTokenAddress as string,
              getAbi(this.abis, "SocialToken"),
              this.provider
            ) as SocialToken)
          : this.usdc;
      const allowance = await contract.allowance(owner, spender);
      return [this.formatERC20(tokenType, allowance), allowance];
    } catch (err) {
      throw err;
    }
  }

  /////////////////////////
  /// WHITELIST METHODS ///
  /////////////////////////

  async isWhitelisted(
    tokenType: WhitelistEnabled,
    account: string
  ): Promise<boolean> {
    try {
      const contract =
        tokenType === "SocialTokenFactory"
          ? this.socialTokenFactory
          : this.getNFTContract(tokenType);
      const isAccountWhitelisted = await contract.isWhitelisted(account);
      return isAccountWhitelisted;
    } catch (err) {
      throw err;
    }
  }

  ////////////////////////////////////////////
  /// SMART CONTRACT EVENT HANDLER METHODS ///
  ////////////////////////////////////////////

  async getEventData(
    receipt: ContractReceipt,
    argsIdx?: number,
    eventsIdx?: number
  ): Promise<any> {
    try {
      const { events } = receipt;
      if (events === undefined) throw new Error("events array undefined");
      const { args } = events[eventsIdx ?? events.length - 1];
      if (args === undefined) throw new Error("args array undefined");
      return argsIdx === undefined ? args : args[argsIdx];
    } catch (err) {
      throw err;
    }
  }

  ////////////////////
  /// IPFS METHODS ///
  ////////////////////

  setIPFSClient(config: NftStorageConfig): void {
    this.ipfsClient = new NFTStorage(config);
  }

  async storeBlob(blobParts: any[], options?: any): Promise<CIDString> {
    if (this.ipfsClient === undefined) {
      throw new Error("IPFS client uninitialized");
    }
    try {
      const content = new Blob(blobParts, options);
      const cid = await this.ipfsClient.storeBlob(content);
      console.log("CID:", cid);
      return cid;
    } catch (err) {
      throw err;
    }
  }

  async storeDirectory(
    storeDirectoryData: StoreDirectoryData[]
  ): Promise<CIDString> {
    if (this.ipfsClient === undefined) {
      throw new Error("IPFS client uninitialized");
    }
    try {
      const data = storeDirectoryData.map(
        ({ fileBits, fileNames, options }) =>
          new File(fileBits, fileNames, options)
      );
      const cid = await this.ipfsClient.storeDirectory(data);
      console.log("CID:", cid);
      return cid;
    } catch (err) {
      throw err;
    }
  }

  ///////////////////
  /// NFT HELPERS ///
  ///////////////////

  getNFTContract(tokenType: NFT): NFTContract {
    if (tokenType === "Inflow1155BC") return this.inflow1155BC;
    if (tokenType === "Inflow1155") return this.inflow1155;
    return this.inflow721;
  }

  formatCreators(creators: string[]): Part[] {
    const value = BigNumber.from(10000).div(creators.length);
    return creators.map((account) => ({ account, value }));
  }

  ///////////////////////////
  /// SOCIALTOKEN HELPERS ///
  ///////////////////////////

  checkSocialToken(tokenType: string, socialTokenAddress?: string) {
    if (tokenType === "SocialToken" && socialTokenAddress === undefined) {
      throw new Error("SocialToken address required");
    }
  }

  ///////////////
  /// HELPERS ///
  ///////////////

  getAbi(abis: ABIs, contract: Contracts): ContractInterface {
    return getAbi(abis, contract);
  }

  //////////////////
  /// FORMATTERS ///
  //////////////////

  formatERC20(tokenType: ERC20, amount: BigNumber): string {
    return tokenType === "SocialToken"
      ? utils.formatEther(amount)
      : this.formatUsdc(amount);
  }

  parseERC20(tokenType: ERC20, amount: string): BigNumber {
    return tokenType === "SocialToken"
      ? utils.parseEther(amount)
      : this.parseUsdc(amount);
  }

  parseUsdc(value: string): BigNumber {
    return utils.parseUnits(value, 6);
  }

  formatUsdc(value: BigNumberish): string {
    const result = utils.formatUnits(value, 6);
    if (result.slice(-2) === ".0") return result.slice(0, -2);
    return result;
  }
}
