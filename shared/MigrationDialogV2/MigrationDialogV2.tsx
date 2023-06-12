import modalOverlay from "components/Modal/ModalOverlay.module.css";
import React, { ReactElement, useState } from "react";
import { DialogOverlay } from "@reach/dialog";
import {
  tryLocalStorageGetItem,
  tryLocalStorageSetItem,
} from "lib/storage/storage";
import router, { useRouter } from "next/router";
import { useMyTeamsIfLoggedIn } from "../teams/useMyTeams";
import { useSession } from "../../gui/session/session";
import { SelectTeam } from "./SelectTeam/SelectTeam";
import { createTeam } from "./utils/createTeam";
import { getNewTeamUrl, getSubscribeUrl } from "./utils/url";
import { useAnalytics } from "../../gui/analytics/analytics";
import { SelectPlan } from "./SelectPlan/SelectPlan";

interface Props {
  persistInStorage?: boolean;
  preselectedPlan?: string;
  children?: ReactElement;
}

const VERSION = "v2";
const STORAGE_KEY = "migrationDialog";

export const MigrationDialogV2 = (props: Props) => {
  const session = useSession();
  const { pathname } = useRouter();
  const { captureEvent } = useAnalytics();
  const { children } = props;
  const isControlled = children !== undefined;
  const isCreatingTeam = React.useRef(false);
  const [plan, setPlan] = useState<string | undefined>(props.preselectedPlan);
  const teams = (useMyTeamsIfLoggedIn(session) ?? []).filter(
    (team) =>
      ["admin"].includes(team.membership.role) && team.service_tier.is_public
  );

  const [isOpen, setIsOpen] = useState(
    isControlled ? false : tryLocalStorageGetItem(STORAGE_KEY) !== VERSION
  );

  const isHidden =
    !session?.user ||
    (pathname === "/subscription/migrate" && !isControlled) ||
    !teams.length;

  const onMigrate = (plan: string) => {
    if (teams?.length) {
      setPlan(plan);
    } else {
      return createTeamAndRedirectToCheckout(plan);
    }
  };

  const trackClick = (action: string, plan?: string) => {
    captureEvent(`Migration dialog: ${action}`, {
      plan,
      version: VERSION,
    });
  };

  const createTeamAndRedirectToCheckout = async (selectedPlan = plan) => {
    if (
      selectedPlan &&
      session &&
      session?.user?.name &&
      !isCreatingTeam.current
    ) {
      trackClick("create_team_and_redirect_to_checkout", selectedPlan);
      isCreatingTeam.current = true;

      await createTeam(session.user.name, session)
        .then((handle) => router.push(getSubscribeUrl(handle, selectedPlan)))
        // On error, redirect to create team page
        .catch(() => router.push(getNewTeamUrl(selectedPlan)))
        .finally(() => {
          isCreatingTeam.current = false;
          close();
        });
    }
  };

  const close = () => {
    // Persist in the local storage when the user has seen the plan selection dialog.
    if (!isControlled && props.persistInStorage) {
      tryLocalStorageSetItem(STORAGE_KEY, VERSION);
    }

    setPlan(props.preselectedPlan);
    setIsOpen(false);
  };

  const onDismiss = () => {
    trackClick("dismiss");

    return close();
  };

  React.useEffect(() => {
    if (!isHidden && isOpen) {
      trackClick("view");
    }
  }, [isHidden, isOpen]);

  if (isHidden) {
    return null;
  }

  return (
    <>
      {!!children &&
        React.cloneElement(children, {
          onClick: () => {
            if (teams?.length === 0 && props.preselectedPlan) {
              return createTeamAndRedirectToCheckout(props.preselectedPlan);
            } else {
              setIsOpen(true);
            }
          },
        })}
      <DialogOverlay
        isOpen={isOpen}
        onDismiss={onDismiss}
        className={modalOverlay.overlay}
      >
        {teams.length && plan ? (
          <SelectTeam
            teams={teams}
            planName={plan}
            close={close}
            trackClick={trackClick}
            onCreateTeam={createTeamAndRedirectToCheckout}
          />
        ) : (
          <SelectPlan
            onMigrate={onMigrate}
            trackClick={trackClick}
            close={close}
          />
        )}
      </DialogOverlay>
    </>
  );
};
