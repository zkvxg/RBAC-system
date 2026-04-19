import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Alert,
  AlertIcon,
  useColorModeValue,
  Card,
  CardBody,
  Heading,
  Text,
  HStack,
  Badge,
  Collapse,
  IconButton,
  useDisclosure,
  useToast,
  InputGroup,
  InputRightElement,
  Divider,
  Textarea,
} from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../services/authService";
import {
  InformationCircleIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
  MoonIcon as HeroMoonIcon,
  SunIcon as HeroSunIcon,
} from "@heroicons/react/24/outline";
import { useColorMode } from "@chakra-ui/react";

function Login() {
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("rbac-system.700", "rbac-system.600");
  const textColor = useColorModeValue("gray.600", "gray.400");
  const demoButtonBg = useColorModeValue(
    "rbac-system.50",
    "rgba(0, 0, 0, 0.3)",
  );
  const demoButtonColor = useColorModeValue(
    "rbac-system.600",
    "rbac-system.200",
  );
  const alertBg = useColorModeValue("rbac-system.50", "rgba(0, 0, 0, 0.3)");
  const alertColor = useColorModeValue("rbac-system.700", "gray.300");
  const alertIconColor = useColorModeValue(
    "rbac-system.500",
    "rbac-system.200",
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();

  const testCredentials = [
    { role: "Admin", 
      email: "admin@example.com", 
      password: "test123"
    },
    { role: "Manager", 
      email: "manager@example.com", 
      password: "test123" 
    },
    {
      role: "Employee",
      email: "employee@example.com",
      password: "test123"
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await authService.login(email, password);
      toast({
        title: "Login Successful",
        status: "success",
        duration: 3000,
      });
      navigate("/");
    } catch (err) {
      setError("Invalid email or password");
      toast({
        title: "Login Failed",
        description: "Invalid email or password",
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const rightSideGradient = `
    radial-gradient(49% 81% at 45% 47%, rgba(43, 64, 102, 0.35) 0%, rgba(17, 26, 51, 0) 100%),
    radial-gradient(113% 91% at 17% -2%, rgba(58, 85, 144, 0.9) 1%, rgba(17, 26, 51, 0) 99%),
    radial-gradient(142% 91% at 83% 7%, rgba(79, 111, 178, 0.75) 1%, rgba(17, 26, 51, 0) 99%),
    radial-gradient(142% 91% at -6% 74%, rgba(32, 50, 88, 1) 1%, rgba(17, 26, 51, 0) 99%),
    radial-gradient(142% 91% at 111% 84%, rgba(58, 85, 144, 0.8) 0%, rgba(17, 26, 51, 1) 100%)
  `;

  return (
    <Box
      h="100vh"
      w="100vw"
      display="flex"
      overflow="hidden"
      position="relative"
    >
      {/* Left Side - Now with solid color */}
      <Box
        display={{ base: "none", lg: "flex" }}
        w="50%"
        h="100%"
        bg={useColorModeValue("white", "#000000")}
        position="relative"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        p={10}
        color={useColorModeValue("rbac-system.900", "white")}
      >
        <Box maxW="480px" textAlign="center" position="relative" zIndex={2}>
          <Heading
            size="2xl"
            mb={6}
            color={useColorModeValue("rbac-system.900", "white")}
          >
            RBAC System
          </Heading>
          <Divider opacity={1} />
          <Text
            fontSize="xl"
            color={useColorModeValue("gray.700", "gray.100")}
            mt={8}
            mb={8}
          >
            Manage users, roles, permissions, and organizational hierarchies
          </Text>
        </Box>
      </Box>

      {/* Right Side - Now with gradient */}
      <Box
        w={{ base: "100%", lg: "50%" }}
        h="100%"
        position="relative"
        display="flex"
        alignItems="center"
        justifyContent="center"
        p={4}
        bgGradient="linear(to-r, rbac-system.900, rbac-system.800, rbac-system.700)"
      >
        <Card
          bg={useColorModeValue("white", "#000000")}
          w={{ base: "full", md: "600px" }}
          maxW="100%"
          position="relative"
          s
          boxShadow="xl"
          borderRadius="xl"
          border="1px solid"
          borderColor={useColorModeValue(
            "rbac-system.200",
            "rgba(255, 255, 255, 0.2)",
          )}
          p={{ base: 4, md: 8 }}
          backdropFilter="blur(10px)"
          zIndex={1}
        >
          <CardBody bg={useColorModeValue("white", "#000000")}>
            <Stack spacing={6}>
              <Box textAlign="center">
                <Heading
                  size="xl"
                  mb={2}
                  color={useColorModeValue("rbac-system.900", "white")}
                >
                  Sign in
                </Heading>
              </Box>

              {/* Test Credentials */}
              <Box>
                <Text
                  fontWeight="medium"
                  mb={2}
                  color={useColorModeValue("rbac-system.900", "white")}
                >
                  Test credentials:
                </Text>
                <Stack spacing={2}>
                  {testCredentials.map((cred) => (
                    <HStack key={cred.role} fontSize="sm" spacing={3}>
                      <Badge
                        bg={
                          cred.role === "Admin"
                            ? "rbac-system.700"
                            : cred.role === "Manager"
                              ? "rbac-system.600"
                              : "rbac-system.300"
                        }
                        color={
                          cred.role === "Employee" ? "rbac-system.900" : "white"
                        }
                        px={2}
                        py={1}
                        borderRadius="0.125rem"
                      >
                        {cred.role}
                      </Badge>
                      <Text color={useColorModeValue("gray.700", "gray.300")}>
                        {cred.email} / {cred.password}
                      </Text>
                    </HStack>
                  ))}
                </Stack>
              </Box>

              {error && (
                <Alert status="error" borderRadius="xl">
                  <AlertIcon />
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <Stack spacing={5}>
                  <FormControl isRequired>
                    <FormLabel>Email</FormLabel>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      size="lg"
                      borderRadius="lg"
                      bg={useColorModeValue("white", "gray.800")}
                      borderColor={useColorModeValue("gray.200", "gray.600")}
                      _hover={{
                        borderColor: useColorModeValue(
                          "rbac-system.400",
                          "rbac-system.300",
                        ),
                      }}
                      _focus={{
                        borderColor: useColorModeValue(
                          "rbac-system.500",
                          "rbac-system.400",
                        ),
                        boxShadow: useColorModeValue(
                          "0 0 0 1px var(--chakra-colors-rbac-system-500)",
                          "0 0 0 1px var(--chakra-colors-rbac-system-400)",
                        ),
                      }}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Password</FormLabel>
                    <InputGroup size="lg">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        borderRadius="lg"
                        bg={useColorModeValue("white", "gray.800")}
                        borderColor={useColorModeValue("gray.200", "gray.600")}
                        _hover={{
                          borderColor: useColorModeValue(
                            "rbac-system.400",
                            "rbac-system.300",
                          ),
                        }}
                        _focus={{
                          borderColor: useColorModeValue(
                            "rbac-system.500",
                            "rbac-system.400",
                          ),
                          boxShadow: useColorModeValue(
                            "0 0 0 1px var(--chakra-colors-rbac-system-500)",
                            "0 0 0 1px var(--chakra-colors-rbac-system-400)",
                          ),
                        }}
                      />
                      <InputRightElement>
                        <IconButton
                          variant="ghost"
                          onClick={() => setShowPassword(!showPassword)}
                          icon={
                            showPassword ? (
                              <EyeSlashIcon className="h-5 w-5" />
                            ) : (
                              <EyeIcon className="h-5 w-5" />
                            )
                          }
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                          color={useColorModeValue("gray.400", "gray.500")}
                          _hover={{
                            bg: "transparent",
                            color: useColorModeValue("gray.600", "gray.400"),
                          }}
                        />
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>

                  <Button
                    type="submit"
                    colorScheme="rbac-system"
                    size="lg"
                    isLoading={isLoading}
                    borderRadius="lg"
                    boxShadow="md"
                    _hover={{
                      transform: "translateY(-1px)",
                      boxShadow: "lg",
                    }}
                    _active={{
                      transform: "translateY(0)",
                      boxShadow: "md",
                    }}
                  >
                    Sign In
                  </Button>
                </Stack>
              </form>
            </Stack>
          </CardBody>
        </Card>
      </Box>
    </Box>
  );
}

export default Login;
