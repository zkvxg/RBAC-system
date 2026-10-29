import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import theme from "./theme";
import { QueryClientProvider } from "@tanstack/react-query";
import { USE_MOCKS } from "./config/runtime";
import { queryClient, ToastContainer } from "./api/queryClient";

const startMockApi = async () => {
  if (!USE_MOCKS) return;
  const { worker } = await import("./mocks/api/browser");
  await worker.start({ onUnhandledRequest: "bypass", quiet: true });
};

startMockApi().then(() => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <ChakraProvider theme={theme}>
          <ColorModeScript initialColorMode={theme.config.initialColorMode} />
          <App />
          <ToastContainer />
        </ChakraProvider>
      </QueryClientProvider>
    </React.StrictMode>,
  );
});
