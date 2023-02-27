/* eslint-disable @next/next/no-img-element */
import Head from "next/head";
import styles from "../styles/Home.module.css";
import Button from "./components/button";
import { useEffect, useState } from "react";
import {
  Call,
  useAccount,
  useConnectors,
  useStarknet,
  useStarknetExecute,
} from "@starknet-react/core";
import Wallets from "./components/wallets";
import SelectIdentity from "./components/selectIdentity";
import { TextField } from "@mui/material";
import {
  hexToDecimal,
  simplifyAddress,
  useEncoded,
  useIsValid,
} from "../utils/utils";

export default function Home() {
  const [hasWallet, setHasWallet] = useState<boolean>(true);
  const [tokenId, setTokenId] = useState<number>(0);
  const [subdomain, setSubdomain] = useState<string>();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [signature, setSignature] = useState<string[]>([]);
  const [signedAddress, setSignedAddress] = useState<string>();
  const encodedSubdomain: string = useEncoded(subdomain ?? "").toString(10);
  const isDomainValid = useIsValid(subdomain ?? "");
  const [callData, setCallData] = useState<Call[]>([]);
  const [isNotMainnet, setIsNotMainnet] = useState<boolean>(false);
  const { library } = useStarknet();
  const { address } = useAccount();
  const { execute: transfer_domain } = useStarknetExecute({
    calls: callData as any,
  });
  const encodedRootDomain: string = useEncoded("fricoben").toString(10);
  const { disconnect } = useConnectors();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const signatureParam = params.get("signature") || "";
    const addressParam = params.get("wallet") || "";
    setSignature(signatureParam.split(","));
    setSignedAddress(addressParam);
  }, []);

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
    if (address && signedAddress) {
      if (simplifyAddress(address) === simplifyAddress(signedAddress)) {
        setErrorMessage(undefined);
      } else setErrorMessage("Wrong wallet");
    }
  }, [address, signedAddress]);

  function changeSubdomain(value: string): void {
    setSubdomain(value);
  }

  useEffect(() => {
    const newTokenId: number = Math.floor(Math.random() * 1000000000000);

    if (tokenId != 0) {
      setCallData([
        {
          contractAddress: process.env
            .NEXT_PUBLIC_DISTRIBUTION_CONTRACT as string,
          entrypoint: "register",
          calldata: [
            2,
            encodedSubdomain,
            encodedRootDomain,
            tokenId,
            signature?.[0],
            signature?.[1],
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
          contractAddress: process.env
            .NEXT_PUBLIC_DISTRIBUTION_CONTRACT as string,
          entrypoint: "register",
          calldata: [
            2,
            encodedSubdomain,
            encodedRootDomain,
            newTokenId,
            signature?.[0],
            signature?.[1],
          ],
        },
      ]);
    }
  }, [tokenId, encodedSubdomain, address, encodedRootDomain, signature]);

  function disconnectByClick(): void {
    disconnect();
    setHasWallet(true);
  }

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
            {!signedAddress || !signature ? (
              <>
                <h1 className={styles.subtitle}>
                  You need to use the /claim command on the StarknetID Discord
                  server
                </h1>
                <br></br>
                <Button
                  onClick={() => window.open("https://discord.gg/GpsW542ndB")}
                >
                  Join
                </Button>
              </>
            ) : errorMessage ? (
              <>
                <h1 className={styles.title}>{errorMessage}</h1>
                <div className="mt-3">
                  <Button onClick={() => disconnectByClick()}>
                    Try another account
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="mb-5">
                  <h1 className={styles.title}>Claim your OG domain</h1>
                </div>
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
              </>
            )}
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
