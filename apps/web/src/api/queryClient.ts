import { createStandaloneToast } from "@chakra-ui/react";
import { QueryCache, QueryClient } from "@tanstack/react-query";
import axios from "axios";

export const { ToastContainer, toast } = createStandaloneToast();

declare module "@tanstack/react-query" {
  interface Register {
    queryMeta: { errorMessage?: string };
  }
}

const shouldRetry = (failureCount: number, error: unknown) => {
  const status = axios.isAxiosError(error) ? error.response?.status : undefined;
  if (status && status < 500) return false;
  return failureCount < 2;
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: shouldRetry },
  },
  queryCache: new QueryCache({
    onError: (_error, query) => {
      toast({
        title: query.meta?.errorMessage ?? "Error loading data",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    },
  }),
});
