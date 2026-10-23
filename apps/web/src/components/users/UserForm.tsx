import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Select,
  Button,
  VStack,
  FormErrorMessage,
  useToast,
  HStack,
  InputGroup,
  InputLeftAddon,
} from "@chakra-ui/react";
import { useDepartments, useRoles } from "../../hooks/queries";
import type { UiUser } from "../../types";
import {
  toPhoneDigits,
  userFormSchema,
  type UserFormValues,
} from "./userFormSchema";

export type { UserFormValues } from "./userFormSchema";

interface UserFormProps {
  user?: Partial<UiUser> | null;
  onSubmit: (data: UserFormValues) => void;
  onCancel: () => void;
}

function UserForm({ user, onSubmit, onCancel }: UserFormProps) {
  const toast = useToast();
  const { data: roles = [] } = useRoles();
  const { data: allDepartments = [] } = useDepartments();
  const departments = allDepartments.filter((d) => d.status === "Active");
  const isEdit = !!user;

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    mode: "onBlur",
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      role: user?.role || "",
      department: user?.department || "",
      phone: user?.phone || "",
      location: user?.location || "",
      status: user?.status || "Active",
      password: "",
    },
  });

  useEffect(() => {
    const [firstRole] = roles;
    if (firstRole && !getValues("role")) {
      setValue("role", firstRole.name);
    }
  }, [roles, getValues, setValue]);

  const onInvalid = () =>
    toast({
      title: "Form Validation Error",
      description: "Please check the form for errors",
      status: "error",
      duration: 3000,
    });

  const phone = register("phone");

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)}>
      <VStack spacing={4}>
        <FormControl isInvalid={!!errors.name} isRequired>
          <FormLabel>Full Name</FormLabel>
          <Input {...register("name")} placeholder="Enter full name" />
          <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.email} isRequired>
          <FormLabel>Email</FormLabel>
          <Input
            {...register("email")}
            type="email"
            placeholder="Enter email address"
          />
          <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.role} isRequired>
          <FormLabel>Role</FormLabel>
          <Select {...register("role")}>
            <option value="">Select Role</option>
            {roles.map((role) => (
              <option key={role.id} value={role.name}>
                {role.name}
              </option>
            ))}
          </Select>
          <FormErrorMessage>{errors.role?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.department} isRequired>
          <FormLabel>Department</FormLabel>
          <Select {...register("department")}>
            <option value="">Select Department</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.name}>
                {dept.name}
              </option>
            ))}
          </Select>
          <FormErrorMessage>{errors.department?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.phone}>
          <FormLabel>Phone Number</FormLabel>
          <InputGroup>
            <InputLeftAddon>+48</InputLeftAddon>
            <Input
              {...phone}
              onChange={(e) => {
                e.target.value = toPhoneDigits(e.target.value);
                return phone.onChange(e);
              }}
              type="tel"
              placeholder="Enter 9-digit number"
              maxLength={9}
              pattern="\d{9}"
            />
          </InputGroup>
          <FormErrorMessage>{errors.phone?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.location} isRequired>
          <FormLabel>Location</FormLabel>
          <Input {...register("location")} placeholder="City, Country" />
          <FormErrorMessage>{errors.location?.message}</FormErrorMessage>
        </FormControl>

        {!isEdit && (
          <FormControl isInvalid={!!errors.password}>
            <FormLabel>Initial Password</FormLabel>
            <Input
              {...register("password")}
              type="password"
              autoComplete="new-password"
              placeholder="Leave empty to generate one"
            />
            <FormHelperText>
              At least 8 characters with a letter and a digit.
            </FormHelperText>
            <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
          </FormControl>
        )}

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
            {isEdit ? "Update" : "Create"} User
          </Button>
        </HStack>
      </VStack>
    </form>
  );
}

export default UserForm;
