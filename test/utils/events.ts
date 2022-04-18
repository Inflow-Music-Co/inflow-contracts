import { ContractTransaction } from "ethers";
import { EventFragment, Interface } from "@ethersproject/abi";

export async function getTxEventData(
  input: ContractTransaction | Promise<ContractTransaction>,
  eventFragment: string | EventFragment,
  contractInterface: Interface,
  _idx?: number
): Promise<any> {
  const tx = (
    input && Object.prototype.toString.call(input) === "[object Promise]"
      ? await input
      : input
  ) as ContractTransaction;
  const { logs } = await tx.wait();
  const idx = _idx ?? logs.length - 2;
  return contractInterface.decodeEventLog(
    eventFragment,
    logs[idx].data,
    logs[idx].topics
  );
}

export async function getEventData(
  input: ContractTransaction | Promise<ContractTransaction>,
  argsIdx?: number,
  eventsIdx?: number
): Promise<any> {
  const tx = (
    input && Object.prototype.toString.call(input) === "[object Promise]"
      ? await input
      : input
  ) as ContractTransaction;
  const { events } = await tx.wait();
  if (events === undefined) throw new Error("events array undefined");
  const { args } = events[eventsIdx ?? events.length - 2];
  if (args === undefined) throw new Error("args array undefined");
  return argsIdx === undefined ? args : args[argsIdx];
}
