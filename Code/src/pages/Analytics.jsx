/* eslint-disable no-case-declarations */
import { useState } from "react";
import {
  Box,
  Card,
  useColorModeValue,
  Select,
  CardBody,
  SimpleGrid,
  Heading,
} from "@chakra-ui/react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  Cell,
  ResponsiveContainer,
} from "recharts";
import {
  activityData,
  roleDistributionData,
  permissionUsageData,
  loginTrendsData,
} from "../mocks/analyticsMock";

const generateDataForRange = (range) => {
  switch (range) {
    case "24h":
      return {
        activity: activityData.slice(-1),
        logins: loginTrendsData.slice(-1),
        permissions: permissionUsageData.map((item) => ({
          ...item,
          count: Math.floor(item.count * 0.2),
        })),
      };
    case "7d":
      return {
        activity: activityData,
        logins: loginTrendsData,
        permissions: permissionUsageData,
      };
    case "30d":
      return {
        activity: [...activityData, ...activityData.slice(0, 2)],
        logins: [...loginTrendsData, ...loginTrendsData.slice(0, 2)].map(
          (item, index) => ({
            ...item,
            date: `${index + 1}/11`,
            logins: item.logins * 1.2,
          }),
        ),
        permissions: permissionUsageData.map((item) => ({
          ...item,
          count: Math.floor(item.count * 2.5),
        })),
      };
    case "90d":
      return {
        activity: [...activityData, ...activityData, ...activityData].map(
          (item) => ({
            ...item,
            Admin: item.Admin * 1.5,
            Manager: item.Manager * 1.5,
            Employee: item.Employee * 1.5,
          }),
        ),
        logins: [
          ...loginTrendsData,
          ...loginTrendsData,
          ...loginTrendsData,
        ].map((item, index) => ({
          ...item,
          date: `${index + 1}/11`,
          logins: item.logins * 1.8,
        })),
        permissions: permissionUsageData.map((item) => ({
          ...item,
          count: Math.floor(item.count * 4),
        })),
      };
    default:
      return {
        activity: activityData,
        logins: loginTrendsData,
        permissions: permissionUsageData,
      };
  }
};

function Analytics() {
  const [timeRange, setTimeRange] = useState("7d");
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const tooltipBg = useColorModeValue("white", "gray.700");

  const filteredData = generateDataForRange(timeRange);

  const handleTimeRangeChange = (e) => {
    setTimeRange(e.target.value);
  };

  return (
    <Box p={8}>
      <Select
        size="sm"
        w="150px"
        value={timeRange}
        onChange={handleTimeRangeChange}
        borderColor={borderColor}
        bg={bgColor}
        mb={6}
      >
        <option value="24h">Last 24 hours</option>
        <option value="7d">Last 7 days</option>
        <option value="30d">Last 30 days</option>
        <option value="90d">Last 90 days</option>
      </Select>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
        {/* User Activity Chart */}
        <Card bg={bgColor} border="1px solid" borderColor="#304945">
          <CardBody>
            <Heading size="md" mb={4}>
              User Activity
            </Heading>
            <Box h="300px">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E6ECF5" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: tooltipBg }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="Admin"
                    stackId="1"
                    stroke="#2A3F6E"
                    fill="#2A3F6E"
                  />
                  <Area
                    type="monotone"
                    dataKey="Manager"
                    stackId="1"
                    stroke="#4F6FB2"
                    fill="#4F6FB2"
                  />
                  <Area
                    type="monotone"
                    dataKey="Employee"
                    stackId="1"
                    stroke="#A9B8DA"
                    fill="#A9B8DA"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </CardBody>
        </Card>

        {/* Role Distribution Chart */}
        <Card bg={bgColor} border="1px solid" borderColor="#304945">
          <CardBody>
            <Heading size="md" mb={4}>
              Role Distribution
            </Heading>
            <Box h="300px">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roleDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {roleDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: tooltipBg }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </CardBody>
        </Card>

        {/* Permission Usage Chart */}
        <Card bg={bgColor} border="1px solid" borderColor="#304945">
          <CardBody>
            <Heading size="md" mb={4}>
              Permission Usage
            </Heading>
            <Box h="300px">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredData.permissions}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E6ECF5" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: tooltipBg }}
                  />
                  <Bar dataKey="count" fill="#3A5590" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardBody>
        </Card>

        {/* Login Trends Chart */}
        <Card bg={bgColor} border="1px solid" borderColor="#304945">
          <CardBody>
            <Heading size="md" mb={4}>
              Login Trends
            </Heading>
            <Box h="300px">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredData.logins}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E6ECF5" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: tooltipBg }}
                  />
                  <Line
                    type="monotone"
                    dataKey="logins"
                    stroke="#2A3F6E"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </CardBody>
        </Card>
      </SimpleGrid>
    </Box>
  );
}

export default Analytics;
