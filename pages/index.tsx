import Head from "next/head";
import React from "react";
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
import { TextField, useMediaQuery } from "@mui/material";
import {
  simplifyAddress,
  useEncoded,
  useIsValid,
  hexToDecimal,
  useAddressFromDomain,
} from "../utils/utils";
import { useRouter } from "next/router";
import ModalMessage from "./components/modalMessage";

export default function Home() {
  const network =
    process.env.NEXT_PUBLIC_IS_TESTNET === "true" ? "testnet" : "mainnet";
  const [hasWallet, setHasWallet] = useState<boolean>(true);
  const [tokenId, setTokenId] = useState<number>(0);
  const [subdomain, setSubdomain] = useState<string>();
  const [errorMessage, setErrorMessage] = useState<string>();
  const encodedSubdomain: string = useEncoded(subdomain ?? "").toString(10);
  const isDomainValid = useIsValid(subdomain ?? "");
  const [callData, setCallData] = useState<Call[]>([]);
  const [isWrongNetwork, setIsWrongNetwork] = useState<boolean>(false);
  const { library } = useStarknet();
  const { address } = useAccount();
  const { execute: register_domain } = useStarknetExecute({
    calls: callData as any,
  });
  const router = useRouter();
  const encodedRootDomain: string = useEncoded(
    process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? ""
  ).toString(10);
  const [hasMainDomain, setHasMainDomain] = useState<boolean>(false);
  const { disconnect } = useConnectors();
  const isTablet = useMediaQuery("(max-width:1024px)");
  const [isSubdomainTaken, setIsSubdomainTaken] = useState(true);
  const { address: domainData, error: domainError } = useAddressFromDomain(
    subdomain + "." + process.env.NEXT_PUBLIC_ROOT_DOMAIN
  );
  //
  useEffect(() => {
    if (domainError) {
      return;
    } else {
      if (domainData && subdomain && subdomain.length >= 4) {
        setIsSubdomainTaken(
          Boolean((domainData?.["address" as any].toString() as string) === "0")
        );
      }
    }
  }, [domainData, domainError]);

  useEffect(() => {
    if (hasWallet) return;

    const STARKNET_NETWORK = {
      mainnet: "0x534e5f4d41494e",
      testnet: "0x534e5f474f45524c49",
    };

    if (library.chainId === STARKNET_NETWORK.testnet && network === "mainnet") {
      setIsWrongNetwork(true);
    } else if (
      library.chainId === STARKNET_NETWORK.mainnet &&
      network === "testnet"
    ) {
      setIsWrongNetwork(true);
    } else {
      setIsWrongNetwork(false);
    }
  }, [library, network, hasWallet]);

  useEffect(() => {
    if (address && router.query.wallet) {
      if (
        simplifyAddress(address) ===
        simplifyAddress(router.query.wallet as string)
      ) {
        setErrorMessage(undefined);
      } else setErrorMessage("Wrong wallet");
    }
  }, [address, router.query.wallet]);

  useEffect(() => {
    if (address) {
      fetch(
        `${
          process.env.NEXT_PUBLIC_APP_LINK
        }/api/indexer/addr_to_domain?addr=${hexToDecimal(address)}`
      )
        .then((response) => response.json())
        .then((data) => {
          setHasMainDomain(Boolean(data?.domain));
        });
    }
  }, [address]);

  useEffect(() => {
    const newTokenId: number = Math.floor(Math.random() * 1000000000000);
    const signatures = (router.query.signature as string)?.split(",");

    if (tokenId != 0) {
      setCallData(
        hasMainDomain
          ? [
              {
                contractAddress: process.env
                  .NEXT_PUBLIC_DISTRIBUTION_CONTRACT as string,
                entrypoint: "register",
                calldata: [
                  2,
                  encodedSubdomain,
                  encodedRootDomain,
                  tokenId,
                  signatures?.[0],
                  signatures?.[1],
                ],
              },
              {
                contractAddress: process.env
                  .NEXT_PUBLIC_NAMING_CONTRACT as string,
                entrypoint: "set_domain_to_address",
                calldata: [
                  2,
                  encodedSubdomain,
                  encodedRootDomain,
                  hexToDecimal(address ?? ""),
                ],
              },
            ]
          : [
              {
                contractAddress: process.env
                  .NEXT_PUBLIC_DISTRIBUTION_CONTRACT as string,
                entrypoint: "register",
                calldata: [
                  2,
                  encodedSubdomain,
                  encodedRootDomain,
                  tokenId,
                  signatures?.[0],
                  signatures?.[1],
                ],
              },
              {
                contractAddress: process.env
                  .NEXT_PUBLIC_NAMING_CONTRACT as string,
                entrypoint: "set_domain_to_address",
                calldata: [
                  2,
                  encodedSubdomain,
                  encodedRootDomain,
                  hexToDecimal(address ?? ""),
                ],
              },
              {
                contractAddress: process.env
                  .NEXT_PUBLIC_NAMING_CONTRACT as string,
                entrypoint: "set_address_to_domain",
                calldata: [2, encodedSubdomain, encodedRootDomain],
              },
            ]
      );
    } else {
      setCallData(
        hasMainDomain
          ? [
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
                  signatures?.[0],
                  signatures?.[1],
                ],
              },
              {
                contractAddress: process.env
                  .NEXT_PUBLIC_NAMING_CONTRACT as string,
                entrypoint: "set_domain_to_address",
                calldata: [
                  2,
                  encodedSubdomain,
                  encodedRootDomain,
                  hexToDecimal(address ?? ""),
                ],
              },
            ]
          : [
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
                  signatures?.[0],
                  signatures?.[1],
                ],
              },
              {
                contractAddress: process.env
                  .NEXT_PUBLIC_NAMING_CONTRACT as string,
                entrypoint: "set_domain_to_address",
                calldata: [
                  2,
                  encodedSubdomain,
                  encodedRootDomain,
                  hexToDecimal(address ?? ""),
                ],
              },
              {
                contractAddress: process.env
                  .NEXT_PUBLIC_NAMING_CONTRACT as string,
                entrypoint: "set_address_to_domain",
                calldata: [2, encodedSubdomain, encodedRootDomain],
              },
            ]
      );
    }
  }, [tokenId, encodedSubdomain, address, encodedRootDomain, router.query]);

  function disconnectByClick(): void {
    disconnect();
    setHasWallet(true);
  }

  function changeSubdomain(value: string): void {
    setSubdomain(value);
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
          {isTablet ? null : (
            <img
              className={styles.identityTokenImage}
              src="/jungle.webp"
              alt="A Jungle image for a VIP domain"
            />
          )}
          <div className={styles.textSection}>
            {!router.query.wallet || !router.query.signature ? (
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
                <div className="mt-3 mb-3 w-full">
                  <TextField
                    fullWidth
                    id="outlined-basic"
                    label={
                      isDomainValid != true
                        ? `"${isDomainValid}" is not a valid character`
                        : subdomain && subdomain.length < 4
                        ? "Less than 4 letters OG domain are not allowed"
                        : !isSubdomainTaken
                        ? "OG subdomain is taken"
                        : "OG Subdomain"
                    }
                    placeholder="Subdomain"
                    variant="outlined"
                    onChange={(e) => changeSubdomain(e.target.value)}
                    color="primary"
                    required
                    error={
                      isDomainValid != true ||
                      Boolean(subdomain && subdomain.length < 4) ||
                      !isSubdomainTaken
                    }
                  />
                </div>
                <div className="mt-3 w-full">
                  <SelectIdentity
                    tokenId={tokenId}
                    changeTokenId={(value) => setTokenId(value)}
                  />
                </div>
                <div className="mt-3 w-full">
                  <Button
                    disabled={
                      address
                        ? Boolean(!subdomain) ||
                          typeof isDomainValid === "string" ||
                          Boolean(subdomain && subdomain.length < 4) ||
                          !isSubdomainTaken
                        : false
                    }
                    onClick={() =>
                      address ? register_domain() : setHasWallet(true)
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
        <ModalMessage
          open={isWrongNetwork && Boolean(address)}
          title={"Wrong network"}
          closeModal={() => setIsWrongNetwork(false)}
          message={
            <div className="mt-3 flex flex-col items-center justify-center text-center">
              <p className="text-brown-600">
                This app only supports Starknet {network}, you have to change
                your network to be able use it.
              </p>
              <div className="mt-3">
                <Button onClick={() => disconnectByClick()}>
                  {`Disconnect`}
                </Button>
              </div>
            </div>
          }
        />
      </main>
    </>
  );
}
