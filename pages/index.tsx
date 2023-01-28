/* eslint-disable @next/next/no-img-element */
import Head from "next/head";
import styles from "../styles/Home.module.css";
import Button from "./components/button";
import { useEffect, useState } from "react";
import {
  Call,
  useAccount,
  useStarknet,
  useStarknetExecute,
} from "@starknet-react/core";
import Wallets from "./components/wallets";
import SelectIdentity from "./components/selectIdentity";
import { TextField } from "@mui/material";
import { hexToDecimal, useEncoded, useIsValid } from "../utils/utils";

export default function Home() {
  const [hasWallet, setHasWallet] = useState<boolean>(true);
  const [tokenId, setTokenId] = useState<number>(0);
  const [subdomain, setSubdomain] = useState<string>();
  const encodedSubdomain: string = useEncoded(subdomain ?? "").toString(10);
  const isDomainValid = useIsValid(subdomain ?? "");
  const [callData, setCallData] = useState<Call[]>([]);
  const [isNotMainnet, setIsNotMainnet] = useState<boolean>(false);
  const { library } = useStarknet();
  const { address } = useAccount();
  const { execute: transfer_domain } = useStarknetExecute({
    calls: callData as any,
  });
  const encodedRootDomain: string = useEncoded("og").toString(10);

  useEffect(() => {
    const STARKNET_NETWORK = {
      mainnet: "0x534e5f4d41494e",
      testnet: "0x534e5f474f45524c49",
    };

    if (library.chainId != STARKNET_NETWORK.mainnet) {
      setIsNotMainnet(true);
    }
  }, [library]);

  useEffect(() => {
    if (address) {
      setHasWallet(false);
    } else {
      setHasWallet(true);
    }
  }, [address]);

  function changeSubdomain(value: string): void {
    setSubdomain(value);
  }

  useEffect(() => {
    const newTokenId: number = Math.floor(Math.random() * 1000000000000);

    if (tokenId != 0) {
      setCallData([
        {
          contractAddress: process.env.NEXT_PUBLIC_NAMING_CONTRACT as string,
          entrypoint: "transfer_domain",
          calldata: [2, encodedSubdomain, encodedRootDomain, tokenId],
        },
        {
          contractAddress: process.env.NEXT_PUBLIC_NAMING_CONTRACT as string,
          entrypoint: "set_domain_to_address",
          calldata: [
            2,
            encodedSubdomain,
            encodedRootDomain,
            hexToDecimal(address ?? ""),
          ],
        },
      ]);
    } else {
      setCallData([
        {
          contractAddress: process.env
            .NEXT_PUBLIC_STARKNETID_CONTRACT as string,
          entrypoint: "mint",
          calldata: [newTokenId],
        },
        {
          contractAddress: process.env.NEXT_PUBLIC_NAMING_CONTRACT as string,
          entrypoint: "transfer_domain",
          calldata: [2, encodedSubdomain, encodedRootDomain, newTokenId],
        },
        {
          contractAddress: process.env.NEXT_PUBLIC_NAMING_CONTRACT as string,
          entrypoint: "set_domain_to_address",
          calldata: [
            2,
            encodedSubdomain,
            encodedRootDomain,
            hexToDecimal(address ?? ""),
          ],
        },
      ]);
    }
  }, [tokenId, encodedSubdomain, address, encodedRootDomain]);

  return (
    <>
      <Head>
        <title>Starknet Id: Og domains</title>
        <meta name="description" content="Get your og domain" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/starknetIdLogo.svg" />
      </Head>
      <main className={styles.main}>
        <div className={styles.card}>
          <img
            className={styles.identityTokenImage}
            src="/jungle.jpg"
            alt="Some image"
          />
          <div className={styles.textSection}>
            <h1 className={styles.title}>Claim your OG domain</h1>
            <TextField
              fullWidth
              id="outlined-basic"
              label={
                isDomainValid != true
                  ? `"${isDomainValid}" is not a valid character`
                  : "Subdomain"
              }
              placeholder="Subdomain"
              variant="outlined"
              onChange={(e) => changeSubdomain(e.target.value)}
              color="primary"
              required
              error={isDomainValid != true}
            />
            <SelectIdentity
              tokenId={tokenId}
              changeTokenId={(value) => setTokenId(value)}
            />
            <div className="mt-3">
              <Button
                onClick={() =>
                  address ? transfer_domain() : setHasWallet(true)
                }
              >
                {address ? "Mint your subdomain" : "Connect to mainnet"}
              </Button>
            </div>
          </div>
        </div>
        <Wallets
          closeWallet={() => setHasWallet(false)}
          hasWallet={hasWallet}
        />
      </main>
    </>
  );
}
