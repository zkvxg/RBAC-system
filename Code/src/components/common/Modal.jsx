import PropTypes from "prop-types";
import {
  Modal as ChakraModal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useColorModeValue,
} from "@chakra-ui/react";

function Modal({ isOpen, onClose, title, children }) {
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue(
    "rbac-system.100",
    "rgba(255, 255, 255, 0.15)",
  );

  return (
    <ChakraModal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay bg="blackAlpha.200" backdropFilter="none" />
      <ModalContent
        bg={bgColor}
        borderColor={borderColor}
        borderWidth="0"
        borderRadius="0.25rem"
        mx={4}
        boxShadow="0 12px 32px rgba(17, 26, 51, 0.08)"
        overflow="hidden"
      >
        <ModalHeader
          bgGradient="linear(to-r, rbac-system.900, rbac-system.800, rbac-system.700)"
          color="white"
          py={4}
          fontWeight="500"
          borderBottom="none"
        >
          {title}
        </ModalHeader>
        <ModalCloseButton
          top={4}
          color="white"
          _hover={{ bg: "whiteAlpha.200" }}
          _focus={{ boxShadow: "none" }}
        />
        <ModalBody py={6}>{children}</ModalBody>
      </ModalContent>
    </ChakraModal>
  );
}

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default Modal;
