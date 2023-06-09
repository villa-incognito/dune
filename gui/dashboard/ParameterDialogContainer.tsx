import { ParameterDialog } from "./ParameterDialog";

import { useRouter } from "next/router";
import { useContext } from "react";
import { SessionContext } from "gui/session/session";
import { paramsBelongToResource } from "lib/parameters/parameters";

import type { Parameter } from "lib/parameters/types";

interface Props {
  defaultParameters: Parameter[];
  origin: "dashboards" | "queries";
}

export function ParameterDialogContainer(props: Props) {
  const { session } = useContext(SessionContext);

  const showAnonParameterizedDashboardDialog =
    !session && paramsBelongToResource(props.defaultParameters);

  const router = useRouter();

  const onDismissDialog = async () => {
    const slug = router.asPath.split("?")[0];
    router.push(slug, undefined, { shallow: true });
  };

  if (showAnonParameterizedDashboardDialog) {
    return (
      <ParameterDialog onDismiss={onDismissDialog} origin={props.origin} />
    );
  } else {
    return null;
  }
}
