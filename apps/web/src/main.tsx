import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import theme from "./theme";
import { USE_MOCKS } from "./config/runtime";

const startMockApi = async () => {
  if (!USE_MOCKS) return;
  const { worker } = await import("./mocks/api/browser");
  await worker.start({ onUnhandledRequest: "bypass", quiet: true });
};

startMockApi().then(() => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <ChakraProvider theme={theme}>
        <ColorModeScript initialColorMode={theme.config.initialColorMode} />
        <App />
      </ChakraProvider>
    </React.StrictMode>,
  );
});
