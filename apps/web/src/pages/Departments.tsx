import { useState } from "react";
import {
  Box,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Badge,
  HStack,
  useDisclosure,
  Flex,
  Text,
  Card,
  useToast,
  useColorModeValue,
  VStack,
  Progress,
  InputGroup,
  InputLeftElement,
  Input,
  Select,
  Stack,
  Divider,
  useBreakpointValue,
} from "@chakra-ui/react";
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  UsersIcon,
  BuildingOfficeIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import Modal from "../components/common/Modal";
import DepartmentForm from "../components/departments/DepartmentForm";
import type { Department } from "../types";
import type { DepartmentSubmitData } from "../components/departments/DepartmentForm";
import { errorMessage } from "../utils/errors";
import {
  useDepartments,
  useCreateDepartment,
  useUpdateDepartment,
  useDeleteDepartment,
} from "../hooks/queries";
import ListStatus from "../components/common/ListStatus";
import { listStatusOf } from "../utils/listStatus";

type Filters = Record<"search" | "status" | "location", string>;

function Departments() {
  const [selectedDepartment, setSelectedDepartment] =
    useState<Department | null>(null);
  const [departmentToDelete, setDepartmentToDelete] =
    useState<Department | null>(null);
  const {
    isOpen: isFormOpen,
    onOpen: openForm,
    onClose: closeForm,
  } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: openDelete,
    onClose: closeDelete,
  } = useDisclosure();
  const toast = useToast();
  const {
    data: departments = [],
    isLoading,
    isError,
    refetch,
  } = useDepartments();
  const createDepartment = useCreateDepartment();
  const updateDepartment = useUpdateDepartment();
  const deleteDepartment = useDeleteDepartment();

  const bgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const headerBg = useColorModeValue("rbac-system.800", "rbac-system.900");
  const headerGradient = useColorModeValue(
    "linear(to-r, rbac-system.900, rbac-system.800, rbac-system.700)",
    "linear(to-r, rbac-system.900, rbac-system.800, rbac-system.800)",
  );
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const [filters, setFilters] = useState<Filters>({
    search: "",
    status: "",
    location: "",
  });

  const handleAddDepartment = () => {
    setSelectedDepartment(null);
    openForm();
  };

  const handleEditDepartment = (department: Department) => {
    setSelectedDepartment(department);
    openForm();
  };

  const handleDeleteClick = (department: Department) => {
    setDepartmentToDelete(department);
    openDelete();
  };

  const handleDepartmentSubmit = async (
    departmentData: DepartmentSubmitData,
  ) => {
    try {
      if (selectedDepartment) {
        await updateDepartment.mutateAsync({
          id: selectedDepartment.id,
          data: departmentData,
        });
        toast({
          title: "Department Updated",
          description: "Department has been successfully updated",
          status: "success",
          duration: 3000,
        });
      } else {
        await createDepartment.mutateAsync(departmentData);
        toast({
          title: "Department Created",
          description: "New department has been successfully created",
          status: "success",
          duration: 3000,
        });
      }
      closeForm();
    } catch (error) {
      toast({
        title: "Error",
        description: errorMessage(
          error,
          "An error occurred while saving the department",
        ),
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!departmentToDelete) return;
    try {
      await deleteDepartment.mutateAsync(departmentToDelete.id);
      toast({
        title: "Department Deleted",
        description: "Department has been successfully deleted",
        status: "success",
        duration: 3000,
      });
      closeDelete();
    } catch (error) {
      toast({
        title: "Error",
        description: errorMessage(
          error,
          "Cannot delete department with active employees",
        ),
        status: "error",
        duration: 3000,
      });
    }
  };

  const formatBudget = (amount: number) => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleFilterChange = (field: keyof Filters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const filteredDepartments = departments.filter((dept) => {
    const matchesSearch =
      filters.search === "" ||
      dept.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      dept.head.toLowerCase().includes(filters.search.toLowerCase()) ||
      dept.location.toLowerCase().includes(filters.search.toLowerCase());

    const matchesStatus =
      filters.status === "" || dept.status === filters.status;

    const matchesLocation =
      filters.location === "" || dept.location.includes(filters.location);

    return matchesSearch && matchesStatus && matchesLocation;
  });

  const listStatus = listStatusOf({
    isLoading,
    isError,
    total: departments.length,
    visible: filteredDepartments.length,
  });

  const locations = [...new Set(departments.map((dept) => dept.location))];

  const displayMode = useBreakpointValue({ base: "mobile", md: "desktop" });

  const renderMobileCard = (department: Department) => (
    <Card
      key={department.id}
      bg={bgColor}
      border="1px solid"
      borderColor="#304945"
      mb={4}
      overflow="hidden"
    >
      <Box p={4}>
        <Stack spacing={4}>
          <HStack justify="space-between" align="start">
            <HStack spacing={3}>
              <Box
                bg="rbac-system.600"
                bgGradient="linear(to-br, rbac-system.700, rbac-system.500)"
                p={2}
                rounded="lg"
                color="white"
                className="icon-on-dark"
              >
                <BuildingOfficeIcon className="h-5 w-5" />
              </Box>
              <Box>
                <Text fontWeight="medium">{department.name}</Text>
                <Text fontSize="sm" color={textColor}>
                  {department.id}
                </Text>
              </Box>
            </HStack>
            <Badge
              colorScheme={department.status === "Active" ? "green" : "red"}
              rounded="full"
              px={2}
              py={1}
            >
              {department.status}
            </Badge>
          </HStack>

          <Divider />

          <Stack spacing={3}>
            <Box>
              <Text fontSize="sm" color={textColor} mb={1}>
                Head & Location
              </Text>
              <Text fontWeight="medium">{department.head}</Text>
              <Text fontSize="sm">{department.location}</Text>
            </Box>

            <Box>
              <Text fontSize="sm" color={textColor} mb={1}>
                Employees
              </Text>
              <HStack>
                <UsersIcon className="h-5 w-5" />
                <Text>{department.employeeCount}</Text>
              </HStack>
            </Box>

            <Box>
              <Text fontSize="sm" color={textColor} mb={1}>
                Budget
              </Text>
              <Text fontWeight="medium">
                {formatBudget(department.budgetSpent)} /{" "}
                {formatBudget(department.budget)}
              </Text>
              <Progress
                value={(department.budgetSpent / department.budget) * 100}
                size="sm"
                width="100%"
                colorScheme={
                  department.budgetSpent / department.budget > 0.9
                    ? "red"
                    : department.budgetSpent / department.budget > 0.7
                      ? "yellow"
                      : "green"
                }
                rounded="full"
                mt={1}
              />
            </Box>
          </Stack>

          <Divider />

          <HStack justify="flex-end" spacing={2}>
            <IconButton
              icon={<PencilSquareIcon className="h-4 w-4" />}
              variant="ghost"
              colorScheme="rbac-system"
              size="sm"
              onClick={() => handleEditDepartment(department)}
              aria-label="Edit department"
            />
            <IconButton
              icon={<TrashIcon className="h-4 w-4" />}
              variant="ghost"
              colorScheme="red"
              size="sm"
              onClick={() => handleDeleteClick(department)}
              aria-label="Delete department"
              isDisabled={department.employeeCount > 0}
            />
          </HStack>
        </Stack>
      </Box>
    </Card>
  );

  return (
    <Box p={8}>
      <Flex
        justify="space-between"
        align="flex-end"
        gap={4}
        mb={6}
        direction={{ base: "column", md: "row" }}
      >
        <Stack direction={{ base: "column", md: "row" }} spacing={4} flex={1}>
          <InputGroup maxW={{ base: "full", md: "300px" }}>
            <InputLeftElement pointerEvents="none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </InputLeftElement>
            <Input
              placeholder="Search departments..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
            />
          </InputGroup>

          <Select
            placeholder="All Statuses"
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            maxW={{ base: "full", md: "200px" }}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </Select>

          <Select
            placeholder="All Locations"
            value={filters.location}
            onChange={(e) => handleFilterChange("location", e.target.value)}
            maxW={{ base: "full", md: "200px" }}
          >
            {locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </Select>
        </Stack>
        <Button
          leftIcon={<PlusIcon className="h-5 w-5" />}
          colorScheme="rbac-system"
          onClick={handleAddDepartment}
          whiteSpace="nowrap"
        >
          Add Department
        </Button>
      </Flex>

      <Text color={textColor} fontSize="sm" mb={4}>
        Showing {filteredDepartments.length} of {departments.length} departments
      </Text>

      {displayMode === "desktop" ? (
        <Box overflowX="auto">
          <Table>
            <Thead bg={headerBg} bgGradient={headerGradient}>
              <Tr>
                <Th borderColor={borderColor} color="white">
                  Department
                </Th>
                <Th borderColor={borderColor} color="white">
                  Head & Location
                </Th>
                <Th borderColor={borderColor} color="white">
                  Employees
                </Th>
                <Th borderColor={borderColor} color="white">
                  Budget
                </Th>
                <Th borderColor={borderColor} color="white">
                  Status
                </Th>
                <Th borderColor={borderColor} color="white">
                  Actions
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {listStatus ? (
                <Tr>
                  <Td
                    colSpan={6}
                    textAlign="center"
                    py={8}
                    borderColor={borderColor}
                  >
                    <ListStatus
                      kind={listStatus}
                      entity="departments"
                      onRetry={() => refetch()}
                    />
                  </Td>
                </Tr>
              ) : (
                filteredDepartments.map((department) => (
                  <Tr key={department.id}>
                    <Td borderColor={borderColor}>
                      <HStack spacing={3}>
                        <Box
                          bg="rbac-system.600"
                          bgGradient="linear(to-br, rbac-system.700, rbac-system.500)"
                          p={2}
                          rounded="lg"
                          color="white"
                          className="icon-on-dark"
                        >
                          <BuildingOfficeIcon className="h-5 w-5" />
                        </Box>
                        <Box>
                          <Text fontWeight="medium">{department.name}</Text>
                          <Text fontSize="sm" color={textColor}>
                            {department.id}
                          </Text>
                        </Box>
                      </HStack>
                    </Td>
                    <Td borderColor={borderColor}>
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="medium">{department.head}</Text>
                        <Text fontSize="sm" color={textColor}>
                          {department.location}
                        </Text>
                      </VStack>
                    </Td>
                    <Td borderColor={borderColor}>
                      <HStack>
                        <UsersIcon className="h-5 w-5" />
                        <Text>{department.employeeCount}</Text>
                      </HStack>
                    </Td>
                    <Td borderColor={borderColor}>
                      <VStack align="start" spacing={2}>
                        <Text fontWeight="medium">
                          {formatBudget(department.budgetSpent)} /{" "}
                          {formatBudget(department.budget)}
                        </Text>
                        <Progress
                          value={
                            (department.budgetSpent / department.budget) * 100
                          }
                          size="sm"
                          width="100%"
                          colorScheme={
                            department.budgetSpent / department.budget > 0.9
                              ? "red"
                              : department.budgetSpent / department.budget > 0.7
                                ? "yellow"
                                : "green"
                          }
                          rounded="full"
                        />
                      </VStack>
                    </Td>
                    <Td borderColor={borderColor}>
                      <Badge
                        colorScheme={
                          department.status === "Active" ? "green" : "red"
                        }
                        rounded="full"
                        px={2}
                        py={1}
                      >
                        {department.status}
                      </Badge>
                    </Td>
                    <Td borderColor={borderColor}>
                      <HStack spacing={2}>
                        <IconButton
                          icon={<PencilSquareIcon className="h-4 w-4" />}
                          variant="ghost"
                          colorScheme="rbac-system"
                          size="sm"
                          onClick={() => handleEditDepartment(department)}
                          aria-label="Edit department"
                        />
                        <IconButton
                          icon={<TrashIcon className="h-4 w-4" />}
                          variant="ghost"
                          colorScheme="red"
                          size="sm"
                          onClick={() => handleDeleteClick(department)}
                          aria-label="Delete department"
                          isDisabled={department.employeeCount > 0}
                        />
                      </HStack>
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </Box>
      ) : (
        <Box py={2}>
          {listStatus ? (
            <ListStatus
              kind={listStatus}
              entity="departments"
              onRetry={() => refetch()}
            />
          ) : (
            filteredDepartments.map(renderMobileCard)
          )}
        </Box>
      )}
      <Modal
        isOpen={isFormOpen}
        onClose={closeForm}
        title={selectedDepartment ? "Edit Department" : "Add New Department"}
      >
        <DepartmentForm
          department={selectedDepartment}
          onSubmit={handleDepartmentSubmit}
          onCancel={closeForm}
        />
      </Modal>

      <Modal
        isOpen={isDeleteOpen}
        onClose={closeDelete}
        title="Delete Department"
      >
        <Box>
          <Text mb={4}>
            Are you sure you want to delete the {departmentToDelete?.name}{" "}
            department? This action cannot be undone.
          </Text>
          <HStack spacing={3} justify="flex-end">
            <Button variant="outline" onClick={closeDelete}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </HStack>
        </Box>
      </Modal>
    </Box>
  );
}

export default Departments;
