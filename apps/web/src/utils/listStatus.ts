interface ListStatusInput {
  isLoading: boolean;
  isError: boolean;
  total: number;
  visible: number;
}

export type ListStatusKind = "loading" | "error" | "empty" | "no-match";

export const listStatusOf = ({
  isLoading,
  isError,
  total,
  visible,
}: ListStatusInput): ListStatusKind | null => {
  if (isLoading) return "loading";
  if (isError) return "error";
  if (total === 0) return "empty";
  if (visible === 0) return "no-match";
  return null;
};
