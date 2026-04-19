import {
  Box,
  SimpleGrid,
  Card,
  CardBody,
  Stack,
  HStack,
  Text,
  useColorModeValue,
  Icon,
  Tooltip,
  VStack,
} from "@chakra-ui/react";
import {
  UsersIcon,
  KeyIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from "@heroicons/react/24/outline";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import PropTypes from "prop-types";
import {
  dashboardActivityData,
  latestUpdatesData,
} from "../mocks/dashboardMock";

function StatCard({ title, stat, icon, trend, helpText, color }) {
  const bgColor = useColorModeValue("white", "gray.800");
  const iconBg = useColorModeValue("rbac-system.600", "rbac-system.800");
  const iconGradient = useColorModeValue(
    "linear(to-br, rbac-system.700, rbac-system.500)",
    "linear(to-br, rbac-system.800, rbac-system.600)",
  );
  const iconColor = useColorModeValue("white", "white");

  return (
    <Card bg={bgColor} border="1px solid" borderColor="#304945">
      <CardBody>
        <Stack spacing={4}>
          <HStack spacing={4}>
            <Box
              p={3}
              bg={iconBg}
              bgGradient={iconGradient}
              borderRadius="lg"
              className="icon-on-dark"
            >
              <Icon as={icon} boxSize={6} color={iconColor} />
            </Box>
            <Box flex={1}>
              <Text fontSize="sm" color="gray.500">
                {title}
              </Text>
              <Text fontSize="2xl" fontWeight="bold">
                {stat}
              </Text>
            </Box>
          </HStack>
          <HStack fontSize="sm" spacing={2}>
            <Icon
              as={trend >= 0 ? ArrowUpIcon : ArrowDownIcon}
              color={trend >= 0 ? "green.500" : "red.500"}
              boxSize={4}
            />
            <Text color={trend >= 0 ? "green.500" : "red.500"}>
              {Math.abs(trend)}%
            </Text>
            <Text color="gray.500">{helpText}</Text>
          </HStack>
        </Stack>
      </CardBody>
    </Card>
  );
}

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  stat: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
  trend: PropTypes.number.isRequired,
  helpText: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
};

function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user"));
  const bgColor = useColorModeValue("white", "gray.800");

  return (
    <Box p={8}>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={6}>
        <Tooltip label="Total number of system users" hasArrow>
          <Box>
            <StatCard
              title="Total Users"
              stat="10"
              icon={UsersIcon}
              trend={12}
              helpText="vs last month"
              color="blue"
            />
          </Box>
        </Tooltip>

        <Tooltip label="Active roles in the system" hasArrow>
          <Box>
            <StatCard
              title="Active Roles"
              stat="8"
              icon={KeyIcon}
              trend={-5}
              helpText="vs last month"
              color="purple"
            />
          </Box>
        </Tooltip>

        <Tooltip label="Total departments" hasArrow>
          <Box>
            <StatCard
              title="Departments"
              stat="5"
              icon={ChartBarIcon}
              trend={8}
              helpText="vs last month"
              color="green"
            />
          </Box>
        </Tooltip>

        <Tooltip label="Scheduled events" hasArrow>
          <Box>
            <StatCard
              title="Events"
              stat="18"
              icon={ClockIcon}
              trend={20}
              helpText="vs last month"
              color="orange"
            />
          </Box>
        </Tooltip>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={6}>
        <Card bg={bgColor} border="1px solid" borderColor="#304945">
          <CardBody>
            <Text fontSize="lg" fontWeight="medium">
              System Activity
            </Text>
            <HStack justify="space-between" mb={4}>
              <Text fontSize="sm" color="gray.500">
                Last 7 days
              </Text>
              <Icon as={ArrowTrendingUpIcon} boxSize={5} color="green.500" />
            </HStack>
            <Box h="200px">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dashboardActivityData}>
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#304945"
                    strokeWidth={2}
                    dot={{
                      stroke: "#304945",
                      strokeWidth: 2,
                      fill: "white",
                      r: 4,
                    }}
                    activeDot={{
                      stroke: "#304945",
                      strokeWidth: 2,
                      fill: "#304945",
                      r: 6,
                    }}
                  />
                  <Tooltip />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </CardBody>
        </Card>

        <Card bg={bgColor} border="1px solid" borderColor="#304945">
          <CardBody>
            <Text fontSize="md" fontWeight="medium" mb={4}>
              Latest updates
            </Text>
            <VStack spacing={4} align="stretch">
              {latestUpdatesData.map((item) => (
                <Box key={item.id} position="relative">
                  <HStack spacing={4} align="flex-start">
                    <Box flex={1}>
                      <HStack justify="space-between" mb={1}>
                        <Text fontWeight="medium">{item.title}</Text>
                        <Text fontSize="sm" color="gray.500">
                          {item.time}
                        </Text>
                      </HStack>
                      <Text fontSize="sm" color="gray.500">
                        {item.description}
                      </Text>
                    </Box>
                  </HStack>
                </Box>
              ))}
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>
    </Box>
  );
}

export default Dashboard;
