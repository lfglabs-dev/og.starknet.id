import "../styles/globals.css";
import type { AppProps } from "next/app";
import { InjectedConnector, StarknetProvider } from "@starknet-react/core";

export default function App({ Component, pageProps }: AppProps) {
  const connectors = [
    new InjectedConnector({ options: { id: "argentX" } }),
    new InjectedConnector({ options: { id: "braavos" } }),
  ];

  return (
    <StarknetProvider connectors={connectors}>
      <Component {...pageProps} />
    </StarknetProvider>
  );
}
