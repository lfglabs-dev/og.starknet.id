/* eslint-disable @next/next/no-img-element */
import Head from "next/head";
import styles from "../styles/Home.module.css";
import Button from "./components/button";
import { useEffect, useState } from "react";
import { useAccount, useStarknet } from "@starknet-react/core";
import Wallets from "./components/wallets";

export default function Home() {
  const [hasWallet, setHasWallet] = useState<boolean>(true);
  const [isNotMainnet, setIsNotMainnet] = useState<boolean>(false);
  const { library } = useStarknet();
  const { address } = useAccount();

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

  return (
    <>
      <Head>
        <title>Starknet Id: Og domains</title>
        <meta name="description" content="Get your og domain" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/starknetIdLogo.svg" />
      </Head>
      <main className={styles.main}>
        {/* This is from starknet id UI (you can delete and replace with your own) */}
        <div className={styles.firstLeaf}>
          <img width="100%" alt="leaf" src="/leaves/leaf_2.png" />
        </div>
        <div className={styles.secondLeaf}>
          <img width="100%" alt="leaf" src="/leaves/leaf_1.png" />
        </div>

        <div>
          <h1 className={styles.title}>Claim your OG domain</h1>
          {!address ? (
            <div className="mt-3">
              <Button onClick={() => setHasWallet(true)}>
                Connect to mainnet
              </Button>
            </div>
          ) : null}
        </div>

        {/* This is from starknet id UI (you can delete and replace with your own) */}
        <div className={styles.thirdLeaf}>
          <img width="100%" alt="leaf" src="/leaves/leaf_2.png" />
        </div>
        <div className={styles.fourthLeaf}>
          <img width="100%" alt="leaf" src="/leaves/leaf_1.png" />
        </div>
        <Wallets
          closeWallet={() => setHasWallet(false)}
          hasWallet={hasWallet}
        />
      </main>
    </>
  );
}
