import { useState, useEffect, type FormEvent } from "react";
import {
  Box,
  VStack,
  Checkbox,
  Button,
  Text,
  HStack,
  Divider,
} from "@chakra-ui/react";
import {
  PERMISSION_GROUPS,
  type PermissionOption,
} from "../../config/permissionGroups";
import type { UiRole } from "../../types";

interface RolePermissionsProps {
  role?: Pick<UiRole, "id" | "name" | "permissions"> | null;
  onSave: (permissions: string[]) => void;
  onCancel: () => void;
}

function RolePermissions({ role, onSave, onCancel }: RolePermissionsProps) {
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  useEffect(() => {
    if (role?.permissions) {
      setSelectedPermissions(role.permissions);
    }
  }, [role]);

  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions((prev) => {
      if (prev.includes(permissionId)) {
        return prev.filter((id) => id !== permissionId);
      }
      return [...prev, permissionId];
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave(selectedPermissions);
  };

  const handleSelectAll = (categoryPermissions: PermissionOption[]) => {
    const allPermissionIds: string[] = categoryPermissions.map((p) => p.id);
    const allSelected = categoryPermissions.every((p) =>
      selectedPermissions.includes(p.id),
    );

    if (allSelected) {
      setSelectedPermissions((prev) =>
        prev.filter((id) => !allPermissionIds.includes(id)),
      );
    } else {
      setSelectedPermissions((prev) => {
        const newPermissions = [...prev];
        allPermissionIds.forEach((id) => {
          if (!newPermissions.includes(id)) {
            newPermissions.push(id);
          }
        });
        return newPermissions;
      });
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <VStack spacing={6} align="stretch">
        {Object.entries(PERMISSION_GROUPS).map(
          ([category, { name, permissions }]) => {
            const allSelected = permissions.every((p) =>
              selectedPermissions.includes(p.id),
            );

            return (
              <Box key={category}>
                <HStack justify="space-between" mb={2}>
                  <Text fontWeight="medium" color="gray.700">
                    {name}
                  </Text>
                  <Button
                    size="xs"
                    variant="ghost"
                    colorScheme={allSelected ? "red" : "rbac-system"}
                    onClick={() => handleSelectAll(permissions)}
                  >
                    {allSelected ? "Deselect All" : "Select All"}
                  </Button>
                </HStack>
                <VStack align="stretch" spacing={2} pl={4}>
                  {permissions.map((permission) => (
                    <Checkbox
                      key={permission.id}
                      isChecked={selectedPermissions.includes(permission.id)}
                      onChange={() => handlePermissionToggle(permission.id)}
                      colorScheme="rbac-system"
                    >
                      <Text fontSize="sm">{permission.name}</Text>
                    </Checkbox>
                  ))}
                </VStack>
                <Divider mt={4} />
              </Box>
            );
          },
        )}
      </VStack>

      <HStack justify="flex-end" mt={6} spacing={3}>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" colorScheme="rbac-system">
          Save Permissions
        </Button>
      </HStack>
    </Box>
  );
}

export default RolePermissions;
