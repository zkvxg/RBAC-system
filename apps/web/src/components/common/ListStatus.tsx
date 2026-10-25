import { Button, Flex, Spinner, Text, VStack } from "@chakra-ui/react";
import type { ListStatusKind } from "../../utils/listStatus";

interface ListStatusProps {
  kind: ListStatusKind;
  entity: string;
  onRetry?: () => void;
}

function ListStatus({ kind, entity, onRetry }: ListStatusProps) {
  switch (kind) {
    case "loading":
      return (
        <Flex justify="center" align="center" py={8}>
          <Spinner size="sm" mr={2} />
          <Text>Loading...</Text>
        </Flex>
      );
    case "error":
      return (
        <VStack py={8} spacing={3}>
          <Text>Could not load {entity}.</Text>
          {onRetry && (
            <Button size="sm" variant="outline" onClick={onRetry}>
              Try again
            </Button>
          )}
        </VStack>
      );
    case "empty":
      return (
        <Text textAlign="center" py={8} color="gray.500">
          No {entity} yet
        </Text>
      );
    case "no-match":
      return (
        <Text textAlign="center" py={8} color="gray.500">
          No {entity} found matching the filters
        </Text>
      );
  }
}

export default ListStatus;
