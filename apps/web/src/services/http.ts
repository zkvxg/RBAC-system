export const rethrow = (scope: string) => (error: unknown) => {
  console.error(`${scope} Error:`, error);
  throw error;
};
