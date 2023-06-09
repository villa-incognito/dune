import React from "react";
import { ButtonOld } from "components/ButtonOld/ButtonOld";
import { ButtonGroup } from "components/ButtonOld/ButtonGroup";
import { Dialog } from "gui/dialog/dialog";
import { FieldButtons } from "gui/input/fields";
import { FieldError } from "gui/input/fields";
import { FieldLabel } from "gui/input/fields";
import { Fields } from "gui/input/fields";
import { InputCheckbox, InputText } from "gui/input/input";
import { callUpsertDashboard } from "gui/dashboard/graphql";
import { dashboardPath } from "lib/links/links";
import { generateSlug } from "lib/links/slugs";
import { useRequiredSessionWithUser } from "gui/session/session";
import { useRouter } from "next/router";
import { validateSlug } from "lib/links/slugs";
import styles from "./dashboard.module.css";
import { ApolloError } from "@apollo/client";
import { useActiveContext } from "shared/ContextSwitcher/store";
import { canEditDashboardPrivacy } from "shared/Dashboard/canEditDashboardPrivacy";
import { useGetRemainingPrivateDashboardsQuota } from "./hooks/useGetRemainingPrivateDashboardsQuota";
import { addDashboardLimitNotification } from "./settings";
import { useGetTeamOwnerServiceTier } from "gui/editor/hooks/useGetTeamOwnerServiceTier";
import { HoverPopover } from "components/HoverPopover/HoverPopover";
import { useHasAdminPermission } from "lib/permissions/permissions";
import { PrivacyTooltip } from "shared/UpgradePlan/PrivacyTooltip";

interface Owner {
  type: "user" | "team";
  id: number;
  handle: string;
}

export const DashboardCreateButton: React.FC<{
  redirect: boolean;
  refresh?: () => void;
}> = (props) => {
  const [
    isCreateDashboardDialogOpen,
    setIsCreateDashboardDialogOpen,
  ] = React.useState(false);
  const onDialog = () => setIsCreateDashboardDialogOpen((prev) => !prev);

  return (
    <>
      <ButtonOld onClick={onDialog} size="sm" light color2>
        New dashboard
      </ButtonOld>

      <CreateDashboardDialog
        {...props}
        isOpen={isCreateDashboardDialogOpen}
        close={onDialog}
      />
    </>
  );
};

export function CreateDashboardDialog({
  isOpen,
  close,

  redirect,
  refresh,
}: {
  isOpen: boolean;
  close: () => void;

  redirect: boolean;
  refresh?: () => void;
}) {
  return (
    <>
      <Dialog label="New dashboard" size="sm" isOpen={isOpen} onDismiss={close}>
        <DashboardCreateDialog
          onDismiss={close}
          redirect={redirect}
          refresh={refresh}
        />
      </Dialog>
    </>
  );
}

const DashboardCreateDialog: React.FC<{
  redirect: boolean;
  refresh?: () => void;
  onDismiss: () => void;
}> = (props) => {
  const session = useRequiredSessionWithUser();
  const { push } = useRouter();

  // Form values
  const [name, setName] = React.useState("");
  const [customSlug, setCustomSlug] = React.useState("");
  const [isPrivate, setIsPrivate] = React.useState(false);

  /*
   * Default owner to current user. Active context should resolve before
   * this dialog can be opened, unless we fail to fetch the user's teams.
   */
  const owner: Owner = useActiveContext() ?? {
    type: "user",
    id: session.user.id,
    handle: session.user.name,
  };
  const hasAdminPermission = useHasAdminPermission(owner);

  const slug = React.useMemo(() => customSlug.trim() || generateSlug(name), [
    customSlug,
    name,
  ]);
  const url = React.useMemo(() => `https://dune.com/${owner.handle}/${slug}`, [
    slug,
    owner,
  ]);

  const teamOwnerServiceTier = useGetTeamOwnerServiceTier(owner);
  const remainingPrivateQuotaResult = useGetRemainingPrivateDashboardsQuota(
    owner
  );

  const _canEditDashboardPrivacy = canEditDashboardPrivacy({
    isCurrentlyPrivate: false,
    dashboardOwner: owner,
    selectedOwner: owner,
    remainingQuota: remainingPrivateQuotaResult.data?.remainingQuota ?? -1,
  });

  const ownerServiceTierReleaseVersion =
    owner.type === "user"
      ? session.user?.user_service_tier.release_version
      : teamOwnerServiceTier?.release_version;

  // Request state
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error>();

  const onSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault();

    if (!name || !name.trim()) {
      setError(Error("Please enter a dashboard name"));
      return;
    } else if (!validateSlug(slug)) {
      setError(
        Error(
          "The URL you entered is not valid. It can only contain lowercase letters, numbers and dashes (-)"
        )
      );
      return;
    }

    const dashboard = {
      name,
      slug,
      owner,
      is_private: isPrivate,
    };

    setLoading(true);
    setError(undefined);

    try {
      await callUpsertDashboard(dashboard, session);

      if (props.redirect) {
        await push(dashboardPath(owner.handle, slug));
      } else {
        props.refresh?.();
      }

      props.onDismiss();
    } catch (err: any) {
      if (err instanceof ApolloError) {
        const errorMessage =
          err.graphQLErrors[0].extensions?.internal?.error.message;
        if (errorMessage) {
          setError(
            handleError(
              Error(errorMessage),
              customSlug,
              setIsPrivate,
              ownerServiceTierReleaseVersion
            )
          );
        } else {
          setError(handleError(err, customSlug, setIsPrivate));
        }
      } else {
        setError(handleError(err, customSlug, setIsPrivate));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <Fields>
        <FieldLabel label="Dashboard name">
          <div className={styles.dashboardName}>
            <InputText
              placeholder="My dashboard"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <p className={styles.linkPreview} title={url}>
              {url}
            </p>
          </div>
        </FieldLabel>
        <FieldLabel label="Customize the URL">
          <InputText
            placeholder={slug || "my-dashboard"}
            value={customSlug}
            onChange={(event) => setCustomSlug(event.target.value)}
          />
        </FieldLabel>
        <FieldLabel label="Privacy">
          <HoverPopover
            position="below-align-left"
            content={() => (
              <PrivacyTooltip
                resource="dashboard"
                hasAdminPermission={hasAdminPermission}
              />
            )}
            enabled={!_canEditDashboardPrivacy}
          >
            <InputCheckbox
              checked={isPrivate}
              onChange={(event) => setIsPrivate(event.target.checked)}
              border="none"
              className={styles.private}
              disabled={!_canEditDashboardPrivacy}
            >
              Make private
            </InputCheckbox>
          </HoverPopover>
        </FieldLabel>

        {error && !privateDashboardNotAllowed(error.message) && (
          <FieldError error={error} />
        )}

        <FieldButtons>
          <ButtonGroup>
            <ButtonOld loading={loading} type="submit" size="sm" color2>
              {props.redirect ? "Save and open" : "Save dashboard"}
            </ButtonOld>
            <ButtonOld
              onClick={props.onDismiss}
              loading={loading}
              size="sm"
              color2
              light
            >
              Cancel
            </ButtonOld>
          </ButtonGroup>
        </FieldButtons>
      </Fields>
    </form>
  );
};

const handleError = (
  error: Error,
  customSlug: string,
  setIsPrivate: React.Dispatch<React.SetStateAction<boolean>>,
  release_version?: string
): Error => {
  if (
    error.message.includes("dashboards_unique_user_slug_idx") ||
    error.message.includes("dashboards_unique_team_slug_idx")
  ) {
    if (customSlug.trim()) {
      return new Error(
        "Dashboard URL already taken. Please pick a different one."
      );
    } else {
      return new Error("Dashboard name taken. Please pick a different name.");
    }
  } else if (
    error.message.includes("max_number_of_private_dashboards_reached")
  ) {
    setIsPrivate(false);
    addDashboardLimitNotification(true, release_version);
  }
  return error;
};

const privateDashboardNotAllowed = (errorMessage: string): boolean => {
  return (
    errorMessage.includes("max_number_of_private_dashboards_reached") ||
    errorMessage.includes("Reached max number of private dashboards.")
  );
};
