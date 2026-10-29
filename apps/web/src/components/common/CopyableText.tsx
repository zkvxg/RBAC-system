import {
  HStack,
  IconButton,
  Text,
  Tooltip,
  useClipboard,
} from "@chakra-ui/react";
import { CheckIcon, CopyIcon } from "@chakra-ui/icons";

interface CopyableTextProps {
  value: string;
  color?: string;
}

function CopyableText({ value, color }: CopyableTextProps) {
  const { hasCopied, onCopy } = useClipboard(value);
  return (
    <HStack spacing={1}>
      <Text color={color} fontFamily="mono">
        {value}
      </Text>
      <Tooltip label={hasCopied ? "Copied" : "Copy"} hasArrow>
        <IconButton
          aria-label={`Copy ${value}`}
          icon={hasCopied ? <CheckIcon /> : <CopyIcon />}
          size="xs"
          variant="ghost"
          onClick={onCopy}
        />
      </Tooltip>
    </HStack>
  );
}

export default CopyableText;
