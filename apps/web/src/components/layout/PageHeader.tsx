import type { ComponentType } from "react";
import {
  Box,
  Button,
  Heading,
  Text,
  Stack,
  useColorModeValue,
  useBreakpointValue,
} from "@chakra-ui/react";

interface PageHeaderProps {
  title: string;
  description: string;
  buttonLabel?: string;
  buttonIcon?: ComponentType<{ className?: string }>;
  onButtonClick?: () => void;
}

function PageHeader({
  title,
  description,
  buttonLabel,
  buttonIcon: Icon,
  onButtonClick,
}: PageHeaderProps) {
  const textColor = useColorModeValue("gray.600", "gray.300");
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <Stack
      direction={{ base: "column", md: "row" }}
      justify="space-between"
      align={{ base: "stretch", md: "center" }}
      spacing={{ base: 4, md: 0 }}
      mb={6}
    >
      <Box>
        <Heading size="lg" mb={1}>
          {title}
        </Heading>
        <Text color={textColor}>{description}</Text>
      </Box>

      {buttonLabel && (
        <Button
          leftIcon={Icon && <Icon className="h-5 w-5" />}
          colorScheme="rbac-system"
          onClick={onButtonClick}
          width={{ base: "full", md: "auto" }}
          size={isMobile ? "md" : "md"}
        >
          {buttonLabel}
        </Button>
      )}
    </Stack>
  );
}

export default PageHeader;
