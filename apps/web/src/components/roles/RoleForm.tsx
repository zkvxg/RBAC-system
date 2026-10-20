import { useState, type ChangeEvent, type FormEvent } from "react";
import type { RoleFormData, Status } from "../../types";
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

interface RoleFormProps {
  role?: Partial<RoleFormData> | null;
  onSubmit: (data: Required<RoleFormData>) => void;
  onCancel: () => void;
}

type RoleFormErrors = Partial<Record<keyof RoleFormData, string>>;

function RoleForm({ role, onSubmit, onCancel }: RoleFormProps) {
  const [formData, setFormData] = useState<Required<RoleFormData>>({
    name: role?.name || "",
    description: role?.description || "",
    permissions: role?.permissions || [],
    status: (role?.status || "Active") as Status,
  });

  const [errors, setErrors] = useState<RoleFormErrors>({});
  const toast = useToast();

  const validateForm = () => {
    const newErrors: RoleFormErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Role name is required";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    } else {
      toast({
        title: "Validation Error",
        description: "Please check the form for errors",
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const name = e.target.name as keyof RoleFormData;
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={4}>
        <FormControl isInvalid={!!errors.name} isRequired>
          <FormLabel>Role Name</FormLabel>
          <Input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter role name"
          />
          <FormErrorMessage>{errors.name}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.description} isRequired>
          <FormLabel>Description</FormLabel>
          <Textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter role description"
            rows={3}
          />
          <FormErrorMessage>{errors.description}</FormErrorMessage>
        </FormControl>

        <FormControl>
          <FormLabel>Status</FormLabel>
          <Select name="status" value={formData.status} onChange={handleChange}>
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
