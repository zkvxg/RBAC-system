import { useState } from "react";
import {
  Box,
  Flex,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Text,
  HStack,
  useColorMode,
  useColorModeValue,
  Tooltip,
  Divider,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  Stack,
  Circle,
} from "@chakra-ui/react";
import {
  BellIcon,
  MoonIcon,
  SunIcon,
  UserIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { useNavigate, Link, NavLink } from "react-router-dom";
import { authService } from "../../services/authService";

function Header() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const { colorMode, toggleColorMode } = useColorMode();

  const bgColor = useColorModeValue("rbac-system.800", "rbac-system.900");
  const borderColor = useColorModeValue("whiteAlpha.300", "whiteAlpha.300");
  const activeItemBg = useColorModeValue("rbac-system.700", "rbac-system.800");
  const hoverBg = useColorModeValue("rbac-system.700", "rbac-system.800");
  const notificationBg = useColorModeValue("white", "rbac-system.900");

  const menuBg = useColorModeValue("white", "gray.800");
  const menuBorderColor = useColorModeValue("gray.200", "gray.700");
  const menuItemBg = useColorModeValue("white", "gray.800");
  const menuItemHoverBg = useColorModeValue(
    "rbac-system.50",
    "rbac-system.800",
  );
  const menuTextColor = useColorModeValue("gray.700", "gray.200");
  const iconBg = useColorModeValue("rbac-system.50", "whiteAlpha.100");
  const iconColor = useColorModeValue("rbac-system.500", "whiteAlpha.900");

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "New User Added",
      description: "Ninth Test-User has been added to the system",
      time: "2 hours ago",
      isRead: false,
      type: "user",
    },
    {
      id: 2,
      title: "Update successful",
      description: "Recent system improvements are now live",
      time: "5 hours ago",
      isRead: false,
      type: "role",
    },
    {
      id: 3,
      title: "New User Added",
      description: "Tenth Test-User has been added to the system",
      time: "7 hours ago",
      isRead: true,
      type: "system",
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleNotificationClick = (notificationId) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification,
      ),
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, isRead: true })),
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const hoverBgColor = useColorModeValue("rbac-system.50", "rbac-system.800");
  const navActiveBg = useColorModeValue("whiteAlpha.200", "whiteAlpha.200");
  const navHoverBg = useColorModeValue("whiteAlpha.150", "whiteAlpha.150");

  const navigation = [
    { name: "Dashboard", href: "/", roles: ["Admin", "Manager", "Employee"] },
    { name: "Users", href: "/users", roles: ["Admin", "Manager"] },
    { name: "Roles", href: "/roles", roles: ["Admin"] },
    { name: "Analytics", href: "/analytics", roles: ["Admin", "Manager"] },
    { name: "Departments", href: "/departments", roles: ["Admin", "Manager"] },
  ].filter((item) => item.roles.includes(user?.role));

  return (
    <Box
      bg={bgColor}
      bgGradient={useColorModeValue(
        "linear(to-r, rbac-system.900, rbac-system.800, rbac-system.700)",
        "linear(to-r, rbac-system.900, rbac-system.800, rbac-system.800)",
      )}
      px={4}
      borderBottom="1px"
      borderColor={borderColor}
    >
      <Flex h={16} alignItems="center" justifyContent="space-between">
        <HStack spacing={6} align="center">
          <Text
            fontSize={{ base: "lg", md: "xl" }}
            fontWeight="semibold"
            color="white"
            pl={{ base: 3, md: 0 }}
          >
            RBAC System
          </Text>
          <HStack spacing={1} display={{ base: "none", md: "flex" }}>
            {navigation.map((item) => (
              <Box
                key={item.name}
                as={NavLink}
                to={item.href}
                px={3}
                py={2}
                rounded="md"
                fontSize="sm"
                color="white"
                _hover={{ bg: navHoverBg }}
                _activeLink={{ bg: navActiveBg }}
              >
                {item.name}
              </Box>
            ))}
          </HStack>
        </HStack>

        <HStack spacing={{ base: 2, md: 4 }}>
          <Box position="relative">
            <Popover>
              <PopoverTrigger>
                <Box position="relative">
                  <IconButton
                    size={{ base: "sm", md: "md" }}
                    variant="ghost"
                    icon={<BellIcon className="h-5 w-5 md:h-6 md:w-6" />}
                    aria-label="Notifications"
                    color="white"
                    _hover={{ bg: hoverBg }}
                  />
                  {unreadCount > 0 && (
                    <Circle
                      size="5"
                      bg="red.500"
                      color="white"
                      position="absolute"
                      top={0}
                      right={0}
                      transform="translate(25%, -25%)"
                      fontSize="xs"
                      fontWeight="bold"
                    >
                      {unreadCount}
                    </Circle>
                  )}
                </Box>
              </PopoverTrigger>
              <PopoverContent
                w="350px"
                bg={notificationBg}
                border="1px solid"
                borderColor="rbac-system.600"
                _focus={{ boxShadow: "none" }}
              >
                <PopoverArrow />
                <PopoverHeader borderBottomWidth="1px" py={4}>
                  <Flex justify="space-between" align="center">
                    <Text fontWeight="medium">Notifications</Text>
                    <HStack spacing={2}>
                      <Text
                        fontSize="sm"
                        color="rbac-system.500"
                        cursor="pointer"
                        onClick={markAllAsRead}
                        _hover={{ textDecoration: "underline" }}
                      >
                        Mark all as read
                      </Text>
                      <Text
                        fontSize="sm"
                        color="red.500"
                        cursor="pointer"
                        onClick={clearNotifications}
                        _hover={{ textDecoration: "underline" }}
                      >
                        Clear all
                      </Text>
                    </HStack>
                  </Flex>
                </PopoverHeader>
                <PopoverBody p={0}>
                  <Stack spacing={0} maxH="400px" overflowY="auto">
                    {notifications.length === 0 ? (
                      <Box p={4} textAlign="center">
                        <Text color="gray.500">No notifications</Text>
                      </Box>
                    ) : (
                      notifications.map((notification) => (
                        <Box
                          key={notification.id}
                          p={4}
                          bg={
                            notification.isRead
                              ? "transparent"
                              : "rbac-system.50"
                          }
                          _hover={{ bg: hoverBgColor }}
                          cursor="pointer"
                          onClick={() =>
                            handleNotificationClick(notification.id)
                          }
                          borderBottomWidth="1px"
                          borderColor="inherit"
                        >
                          <Text fontWeight="medium" fontSize="sm">
                            {notification.title}
                          </Text>
                          <Text fontSize="sm" color="gray.500" mt={1}>
                            {notification.description}
                          </Text>
                          <Text fontSize="xs" color="gray.400" mt={1}>
                            {notification.time}
                          </Text>
                        </Box>
                      ))
                    )}
                  </Stack>
                </PopoverBody>
              </PopoverContent>
            </Popover>
          </Box>

          <Box
            w="1px"
            h="8"
            bg={borderColor}
            opacity="0.3"
            display={{ base: "none", md: "block" }}
          />

          <Menu>
            <MenuButton
              as={IconButton}
              size={{ base: "sm", md: "md" }}
              variant="ghost"
              icon={<UserIcon className="h-5 w-5 md:h-6 md:w-6" />}
              aria-label="User menu"
              color="white"
              _hover={{ bg: hoverBg }}
              _active={{ bg: hoverBg }}
            />
            <MenuList
              bg={menuBg}
              borderColor={menuBorderColor}
              shadow="lg"
              py={2}
              overflow="hidden"
            >
              <MenuItem
                as={Link}
                to="/profile"
                bg={menuItemBg}
                _hover={{ bg: menuItemHoverBg }}
                color={menuTextColor}
                px={{ base: 3, md: 4 }}
                py={{ base: 2, md: 3 }}
                fontSize="sm"
                fontWeight="medium"
                transition="all 0.2s"
              >
                <Text>Profile</Text>
              </MenuItem>

              <MenuItem
                as={Link}
                to="/settings"
                bg={menuItemBg}
                _hover={{ bg: menuItemHoverBg }}
                color={menuTextColor}
                px={{ base: 3, md: 4 }}
                py={{ base: 2, md: 3 }}
                fontSize="sm"
                fontWeight="medium"
                transition="all 0.2s"
              >
                <Text>Settings</Text>
              </MenuItem>

              <Box px={3} py={2}>
                <Divider borderColor={menuBorderColor} />
              </Box>

              <MenuItem
                bg={menuItemBg}
                _hover={{
                  bg: useColorModeValue("red.50", "red.900"),
                  color: "red.500",
                }}
                color={menuTextColor}
                px={{ base: 3, md: 4 }}
                py={{ base: 2, md: 3 }}
                fontSize="sm"
                fontWeight="medium"
                transition="all 0.2s"
                onClick={handleLogout}
              >
                <Text>Sign out</Text>
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>
    </Box>
  );
}

export default Header;
