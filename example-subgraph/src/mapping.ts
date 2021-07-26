import {
  Approval as ApprovalEvent,
  Burned as BurnedEvent,
  Minted as MintedEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  Transfer as TransferEvent,
} from "../generated/Contract/Contract";
import {
  Approval,
  Burned,
  Minted,
  OwnershipTransferred,
  Transfer,
} from "../generated/schema";

export function handleApproval(event: ApprovalEvent): void {
  let entity = new Approval(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  );
  entity.owner = event.params.owner;
  entity.spender = event.params.spender;
  entity.value = event.params.value;
  entity.timestamp = event.block.timestamp;
  entity.save();
}

export function handleBurned(event: BurnedEvent): void {
  let entity = new Burned(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  );
  entity.burner = event.params.burner;
  entity.amount = event.params.amount;
  entity.burnPrice = event.params.burnPrice;
  entity.tokenSupply = event.params.tokenSupply;
  entity.reserve = event.params.reserve;
  entity.timestamp = event.block.timestamp;
  entity.save();
}

export function handleMinted(event: MintedEvent): void {
  let entity = new Minted(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  );
  entity.minter = event.params.minter;
  entity.amount = event.params.amount;
  entity.mintPrice = event.params.mintPrice;
  entity.tokenSupply = event.params.tokenSupply;
  entity.royaltyPaid = event.params.royaltyPaid;
  entity.reserve = event.params.reserve;
  entity.timestamp = event.block.timestamp;
  entity.save();
}

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  let entity = new OwnershipTransferred(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  );
  entity.previousOwner = event.params.previousOwner;
  entity.newOwner = event.params.newOwner;
  entity.timestamp = event.block.timestamp;
  entity.save();
}

export function handleTransfer(event: TransferEvent): void {
  let entity = new Transfer(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  );
  entity.from = event.params.from;
  entity.to = event.params.to;
  entity.value = event.params.value;
  entity.timestamp = event.block.timestamp;
  entity.save();
}
