import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { mainnet } from "wagmi/chains";
import "@rainbow-me/rainbowkit/styles.css";

import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { publicProvider } from "wagmi/providers/public";

const { chains, publicClient } = configureChains([mainnet], [publicProvider()]);

const { connectors } = getDefaultWallets({
  appName: "Dune",
  projectId: String(process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID),
  chains,
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: connectors().filter(
    // We use eth_signTypedData_v4 which is not supported by WalletConnect v2
    // https://github.com/wagmi-dev/wagmi/discussions/2240
    // See https://dune.height.app/T-31769
    (connector) => !["walletConnect"].includes(connector.id)
  ),
  publicClient,
});

export const Web3Provider: React.FC = ({ children }) => {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>{children}</RainbowKitProvider>
    </WagmiConfig>
  );
};
