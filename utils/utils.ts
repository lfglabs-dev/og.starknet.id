import { useContract, useStarknetCall } from "@starknet-react/core";
import BN from "bn.js";
import { Abi } from "starknet";
import naming_abi from "../abi/naming_abi.json";

export const basicAlphabet = "abcdefghijklmnopqrstuvwxyz0123456789-";
export const bigAlphabet = "这来";
export const totalAlphabet = basicAlphabet + bigAlphabet;

const basicSizePlusOne = new BN(basicAlphabet.length + 1);
const basicAlphabetSize = new BN(basicAlphabet.length);
const bigAlphabetSize = new BN(bigAlphabet.length);

function isHexString(str: string): boolean {
  if (str === "") return true;
  if (str.toLowerCase().startsWith("0x")) {
    return /^[0123456789abcdefABCDEF]+$/.test(str.slice(2));
  } else {
    return false;
  }
}

export function hexToDecimal(hex: string): string {
  if (!isHexString(hex)) {
    throw new Error("Invalid hex string");
  }

  return new BN(hex.slice(2), 16).toString(10);
}

export function useIsValid(domain: string): boolean | string {
  for (const char of domain)
    if (!basicAlphabet.includes(char) && !bigAlphabet.includes(char))
      return char;
  return true;
}

function extractStars(str: string): [string, number] {
  let k = 0;
  while (str.endsWith(bigAlphabet[bigAlphabet.length - 1])) {
    str = str.substring(0, str.length - 1);
    k++;
  }
  return [str, k];
}

export function useEncoded(decoded: string): BN {
  let encoded = new BN(0);
  let multiplier = new BN(1);

  if (decoded.endsWith(bigAlphabet[0] + basicAlphabet[1])) {
    const [str, k] = extractStars(decoded.substring(0, decoded.length - 2));
    decoded = str + bigAlphabet[bigAlphabet.length - 1].repeat(2 * (k + 1));
  } else {
    const [str, k] = extractStars(decoded);
    if (k)
      decoded =
        str + bigAlphabet[bigAlphabet.length - 1].repeat(1 + 2 * (k - 1));
  }

  for (let i = 0; i < decoded.length; i++) {
    const char = decoded[i];
    const index = basicAlphabet.indexOf(char);
    const bnIndex = new BN(basicAlphabet.indexOf(char));

    if (index !== -1) {
      // add encoded + multiplier * index
      if (i === decoded.length - 1 && decoded[i] === basicAlphabet[0]) {
        encoded = encoded.add(multiplier.mul(basicAlphabetSize));
        multiplier = multiplier.mul(basicSizePlusOne);
        // add 0
        multiplier = multiplier.mul(basicSizePlusOne);
      } else {
        encoded = encoded.add(multiplier.mul(bnIndex));
        multiplier = multiplier.mul(basicSizePlusOne);
      }
    } else if (bigAlphabet.indexOf(char) !== -1) {
      // add encoded + multiplier * (basicAlphabetSize)
      encoded = encoded.add(multiplier.mul(basicAlphabetSize));
      multiplier = multiplier.mul(basicSizePlusOne);
      // add encoded + multiplier * index
      const newid =
        (i === decoded.length - 1 ? 1 : 0) + bigAlphabet.indexOf(char);
      encoded = encoded.add(multiplier.mul(new BN(newid)));
      multiplier = multiplier.mul(bigAlphabetSize);
    }
  }

  return encoded;
}

export function simplifyAddress(address: string): string {
  // Remove the first zeros
  if (!isHexString(address)) {
    throw new Error("Invalid hex string");
  }
  let simplified = address.slice(2);
  while (simplified.startsWith("0")) {
    simplified = simplified.slice(1);
  }
  // Add the 0x back
  simplified = "0x" + simplified;
  return simplified.toLowerCase();
}

type AddressData = {
  address?: BN[][];
  error?: string;
};

export function useAddressFromDomain(domain: string): AddressData {
  const { contract } = useNamingContract();
  const encoded = [];
  for (const subdomain of domain.split("."))
    encoded.push(useEncoded(subdomain).toString(10));

  const { data, error } = useStarknetCall({
    contract,
    method: "domain_to_address",
    args: [encoded],
  });

  return { address: data as any, error };
}

export function useNamingContract() {
  return useContract({
    abi: naming_abi as Abi,
    address: process.env.NEXT_PUBLIC_NAMING_CONTRACT,
  });
}
