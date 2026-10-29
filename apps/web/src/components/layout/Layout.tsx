import { Outlet } from "react-router-dom";
import { Box, Flex, useColorModeValue } from "@chakra-ui/react";
import Header from "./Header";

function Layout() {
  const bgColor = useColorModeValue("white", "#000000");

  return (
    <Flex
      h="100vh"
      bg={bgColor}
      position="relative"
      overflow="hidden"
      direction="column"
    >
      <Header />
      <Box flex="1" overflow="hidden" position="relative" zIndex="1">
        <Box
          as="main"
          h="calc(100vh - 4rem)"
          overflow="auto"
          position="relative"
          css={{
            "&::-webkit-scrollbar": {
              width: "4px",
            },
            "&::-webkit-scrollbar-track": {
              width: "6px",
            },
            "&::-webkit-scrollbar-thumb": {
              background: useColorModeValue("gray.200", "gray.700"),
              borderRadius: "24px",
            },
          }}
        >
          <Box position="relative" zIndex="2">
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Flex>
  );
}

export default Layout;
