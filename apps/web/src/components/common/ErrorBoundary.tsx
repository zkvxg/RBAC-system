import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button, Center, Heading, Text, VStack } from "@chakra-ui/react";

interface ErrorBoundaryProps {
  children: ReactNode;
  resetKey?: unknown;
}

interface ErrorBoundaryState {
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Unhandled render error:", error, info.componentStack);
  }

  override componentDidUpdate(prev: ErrorBoundaryProps) {
    if (this.state.error && prev.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  override render() {
    if (!this.state.error) return this.props.children;
    return (
      <Center minH="60vh" p={8}>
        <VStack spacing={4} textAlign="center">
          <Heading size="md">Something went wrong</Heading>
          <Text color="gray.500">
            This page failed to load. You can try again or go back.
          </Text>
          <Button
            colorScheme="rbac-system"
            onClick={() => this.setState({ error: null })}
          >
            Try again
          </Button>
        </VStack>
      </Center>
    );
  }
}

export default ErrorBoundary;
