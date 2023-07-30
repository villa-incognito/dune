import { useActiveContext } from "shared/ContextSwitcher/store";

import { Identity, IdentityProps } from "./Identity";

export function IdentityActiveContext(props: Omit<IdentityProps, "owner">) {
  const activeContext = useActiveContext();

  if (!activeContext) {
    return null;
  }

  return <Identity {...props} owner={activeContext} />;
}
