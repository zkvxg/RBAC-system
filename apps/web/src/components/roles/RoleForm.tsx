import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Button,
  VStack,
  HStack,
  FormErrorMessage,
  useToast,
} from "@chakra-ui/react";
import { permissionKeySchema } from "@rbac/shared";
import type { RoleFormData } from "../../types";

const roleFormSchema = z.object({
  name: z.string().trim().min(1, "Role name is required").max(50),
  description: z.string().trim().min(1, "Description is required").max(255),
  permissions: z.array(permissionKeySchema),
  status: z.enum(["Active", "Inactive"]),
});

type RoleFormInput = z.input<typeof roleFormSchema>;
type RoleFormValues = z.output<typeof roleFormSchema>;

interface RoleFormProps {
  role?: Partial<RoleFormData> | null;
  onSubmit: (data: RoleFormValues) => void;
  onCancel: () => void;
}

function RoleForm({ role, onSubmit, onCancel }: RoleFormProps) {
  const toast = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RoleFormInput, unknown, RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: role?.name || "",
      description: role?.description || "",
      permissions: role?.permissions || [],
      status: role?.status || "Active",
    },
  });

  const onInvalid = () =>
    toast({
      title: "Validation Error",
      description: "Please check the form for errors",
      status: "error",
      duration: 3000,
    });

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)}>
      <VStack spacing={4}>
        <FormControl isInvalid={!!errors.name} isRequired>
          <FormLabel>Role Name</FormLabel>
          <Input {...register("name")} placeholder="Enter role name" />
          <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.description} isRequired>
          <FormLabel>Description</FormLabel>
          <Textarea
            {...register("description")}
            placeholder="Enter role description"
            rows={3}
          />
          <FormErrorMessage>{errors.description?.message}</FormErrorMessage>
        </FormControl>

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
          <Button type="submit" colorScheme="rbac-system">
            {role ? "Update" : "Create"} Role
          </Button>
        </HStack>
      </VStack>
    </form>
  );
}

export default RoleForm;
