import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  FormControl,
  FormLabel,
  Input,
  Select,
  Button,
  VStack,
  HStack,
  FormErrorMessage,
  InputGroup,
  InputLeftAddon,
  SimpleGrid,
  Textarea,
} from "@chakra-ui/react";
import { useUsers } from "../../hooks/queries";
import type { Department } from "../../types";

const amount = z
  .union([z.literal(""), z.coerce.number().min(0)])
  .transform((value) => (value === "" ? 0 : value));

const departmentFormSchema = z.object({
  name: z.string().trim().min(1, "Department name is required"),
  description: z.string().trim().min(1, "Description is required"),
  headId: z.string().min(1, "Department head is required"),
  budget: z
    .string()
    .min(1, "Budget is required")
    .transform(Number)
    .pipe(
      z
        .number({ error: "Please enter a valid budget amount" })
        .positive("Please enter a valid budget amount"),
    ),
  budgetSpent: amount,
  location: z.string().trim().min(1, "Location is required"),
  projects: amount,
  status: z.enum(["Active", "Inactive"]),
});

type DepartmentFormInput = z.input<typeof departmentFormSchema>;
type DepartmentFormOutput = z.output<typeof departmentFormSchema>;

export type DepartmentSubmitData = DepartmentFormOutput & {
  head: string;
  teamLeads: string[];
};

interface DepartmentFormProps {
  department?: Partial<Department> | null;
  onSubmit: (data: DepartmentSubmitData) => void;
  onCancel: () => void;
}

const asText = (value: number | undefined) =>
  value === undefined ? "" : String(value);

function DepartmentForm({
  department,
  onSubmit,
  onCancel,
}: DepartmentFormProps) {
  const { data: users = [] } = useUsers();
  const managers = users.filter(
    (user) => user.role === "Manager" && user.status === "Active",
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DepartmentFormInput, unknown, DepartmentFormOutput>({
    resolver: zodResolver(departmentFormSchema),
    defaultValues: {
      name: department?.name || "",
      description: department?.description || "",
      headId: department?.headId || "",
      budget: asText(department?.budget),
      budgetSpent: asText(department?.budgetSpent ?? 0),
      location: department?.location || "",
      projects: asText(department?.projects ?? 0),
      status: department?.status || "Active",
    },
  });

  const submit = (values: DepartmentFormOutput) =>
    onSubmit({
      ...values,
      head: managers.find((m) => m.id === values.headId)?.name || "",
      teamLeads: department?.teamLeads || [],
    });

  return (
    <form onSubmit={handleSubmit(submit)}>
      <VStack spacing={4}>
        <FormControl isInvalid={!!errors.name} isRequired>
          <FormLabel>Department Name</FormLabel>
          <Input {...register("name")} placeholder="Enter department name" />
          <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.description} isRequired>
          <FormLabel>Description</FormLabel>
          <Textarea
            {...register("description")}
            placeholder="Enter department description"
          />
          <FormErrorMessage>{errors.description?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.headId} isRequired>
          <FormLabel>
            Department Head <br /> (Only Active Managers)
          </FormLabel>
          <Select {...register("headId")} placeholder="Select Department Head">
            {managers.map((manager) => (
              <option key={manager.id} value={manager.id}>
                {manager.name} ({manager.email})
              </option>
            ))}
          </Select>
          {managers.length === 0 && (
            <FormErrorMessage>
              No active managers available. Please create a manager first.
            </FormErrorMessage>
          )}
          <FormErrorMessage>{errors.headId?.message}</FormErrorMessage>
        </FormControl>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
          <FormControl isInvalid={!!errors.budget} isRequired>
            <FormLabel>Budget</FormLabel>
            <InputGroup>
              <InputLeftAddon>zł</InputLeftAddon>
              <Input
                {...register("budget")}
                type="number"
                placeholder="Enter budget amount"
              />
            </InputGroup>
            <FormErrorMessage>{errors.budget?.message}</FormErrorMessage>
          </FormControl>

          <FormControl>
            <FormLabel>Budget Spent</FormLabel>
            <InputGroup>
              <InputLeftAddon>zł</InputLeftAddon>
              <Input
                {...register("budgetSpent")}
                type="number"
                placeholder="Enter spent amount"
              />
            </InputGroup>
          </FormControl>
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
          <FormControl isInvalid={!!errors.location} isRequired>
            <FormLabel>Location</FormLabel>
            <Input {...register("location")} placeholder="Enter location" />
            <FormErrorMessage>{errors.location?.message}</FormErrorMessage>
          </FormControl>

          <FormControl>
            <FormLabel>Projects</FormLabel>
            <Input
              {...register("projects")}
              type="number"
              placeholder="Number of projects"
            />
          </FormControl>
        </SimpleGrid>

        <FormControl>
          <FormLabel>Status</FormLabel>
          <Select {...register("status")}>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </Select>
        </FormControl>

        <HStack spacing={3} width="full" justify="flex-end" pt={4}>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            colorScheme="rbac-system"
            isDisabled={managers.length === 0}
          >
            {department ? "Update" : "Create"} Department
          </Button>
        </HStack>
      </VStack>
    </form>
  );
}

export default DepartmentForm;
