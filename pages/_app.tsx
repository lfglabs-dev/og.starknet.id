import "../styles/globals.css";
import type { AppProps } from "next/app";
import { InjectedConnector, StarknetProvider } from "@starknet-react/core";
import { ThemeProvider } from "@mui/material";
import theme from "../styles/theme";
import React from "react";

export default function App({ Component, pageProps }: AppProps) {
  const connectors = [
    new InjectedConnector({ options: { id: "argentX" } }),
    new InjectedConnector({ options: { id: "braavos" } }),
  ];

  return (
    <StarknetProvider connectors={connectors}>
      <ThemeProvider theme={theme}>
        <Component {...pageProps} />
      </ThemeProvider>
    </StarknetProvider>
  );
}
