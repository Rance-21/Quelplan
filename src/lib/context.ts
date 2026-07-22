import { useContext, type Context } from "react";

export function useRequiredContext<T>(
  context: Context<T | null>,
  providerName: string,
): T {
  const value = useContext(context);
  if (!value) throw new Error(`${providerName} is missing`);
  return value;
}
