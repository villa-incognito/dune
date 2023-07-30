import React, { useEffect } from "react";
import SelectOwnerICanAssign from "gui/SelectOwner/SelectOwnerICanAssign";
import { ButtonOld } from "components/ButtonOld/ButtonOld";
import { ButtonGroup } from "components/ButtonOld/ButtonGroup";
import { Dialog } from "gui/dialog/dialog";
import { FullDashboard } from "lib/entries/types";
import { FieldButtons } from "gui/input/fields";
import { FieldError } from "gui/input/fields";
import { FieldLabel } from "gui/input/fields";
import { FieldTagsList } from "gui/tags/tags";
import { Fields } from "gui/input/fields";
import { InputCheckbox, InputText } from "gui/input/input";
import { PatchDashboardSettingsMutationVariables } from "lib/types/graphql";
import { callUpsertDashboard } from "gui/dashboard/graphql";
import { formatTagsList } from "lib/tags/tags";
import { parseTagsList } from "lib/tags/tags";
import { useRequiredSession } from "gui/session/session";
import { useRouter } from "next/router";
import { dashboardLink } from "lib/links/links";
import { useHasAdminPermission } from "lib/permissions/permissions";
import { usePatchDashboardSettingsMutation } from "lib/types/graphql";
import { clearDashboardScheduleCache } from "gui/dashboard/ScheduleDashboardExecutionButton/useDashboardSchedule";
import { validateSlug } from "lib/links/slugs";
import styles from "./dashboard.module.css";
import { Button } from "components/Button/Button";
import { canEditDashboardPrivacy } from "shared/Dashboard/canEditDashboardPrivacy";
import { useGetRemainingPrivateDashboardsQuota } from "./hooks/useGetRemainingPrivateDashboardsQuota";
import { addToastNotification } from "shared/Toasts/toastNotificationStore";
import { useGetTeamOwnerServiceTier } from "gui/editor/hooks/useGetTeamOwnerServiceTier";
import { HoverPopover } from "components/HoverPopover/HoverPopover";
import { PrivacyTooltip } from "shared/UpgradePlan/PrivacyTooltip";

export const DashboardSettingsButton: React.FC<{
  refresh: () => Promise<void>;
  dashboard: FullDashboard;
}> = (props) => {
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = React.useState(false);
  const onDialog = () => setIsSettingsDialogOpen((prev) => !prev);

  return (
    <>
      <Button onClick={onDialog} size="M" theme="tertiary">
        Settings
      </Button>
      <Dialog
        label="Settings"
        size="md"
        isOpen={isSettingsDialogOpen}
        onDismiss={onDialog}
      >
        <DashboardSettingsDialog {...props} onDismiss={onDialog} />
      </Dialog>
    </>
  );
};

const DashboardSettingsDialog: React.FC<{
  dashboard: FullDashboard;
  onDismiss: () => void;
  refresh: () => Promise<void>;
}> = (props) => {
  const session = useRequiredSession();
  const { replace } = useRouter();

  // Editable values
  const [name, setName] = React.useState(props.dashboard.name);
  const [customSlug, setCustomSlug] = React.useState("");
  const [tags, setTags] = React.useState(formatTagsList(props.dashboard.tags));
  const [archiveError, setArchiveError] = React.useState<Error>();
  const [archiveLoading, setArchiveLoading] = React.useState(false);
  const initialOwner = props.dashboard.owner;
  const [owner, setOwner] = React.useState<{
    type: "team" | "user";
    id: number;
    handle: string;
  }>(initialOwner);
  const [isPrivate, setIsPrivate] = React.useState(props.dashboard.is_private);
  const hasAdminPermission = useHasAdminPermission(owner);
  const [error, setError] = React.useState<Error | null>(null);

  const teamOwnerServiceTier = useGetTeamOwnerServiceTier(owner);

  const remainingPrivateQuotaResult = useGetRemainingPrivateDashboardsQuota(
    owner
  );
  const _canEditDashboardPrivacy = canEditDashboardPrivacy({
    isCurrentlyPrivate: props.dashboard.is_private,
    dashboardOwner: initialOwner,
    selectedOwner: owner,
    remainingQuota: remainingPrivateQuotaResult.data?.remainingQuota ?? -1,
  });

  const ownerServiceTierReleaseVersion =
    owner.type === "user"
      ? session.user?.user_service_tier.release_version
      : teamOwnerServiceTier?.release_version;

  // When the owner changes reset the isPrivate state to the initial state of the dashboard
  // if the new owner can accept that state
  useEffect(() => {
    if (props.dashboard.is_private) {
      setIsPrivate(_canEditDashboardPrivacy);
    } else {
      setIsPrivate(false);
    }
  }, [_canEditDashboardPrivacy, owner]);

  const [
    patchSettings,
    patchSettingsResult,
  ] = usePatchDashboardSettingsMutation({
    context: { session },
    errorPolicy: "all",
  });
  const { loading } = patchSettingsResult;

  const onSubmit = (event: React.SyntheticEvent) => {
    event.preventDefault();

    if (customSlug !== "" && !validateSlug(customSlug)) {
      setError(
        Error(
          "The URL you entered is not valid. It can only contain lowercase letters, numbers and dashes (-)"
        )
      );
      return;
    }

    const dashboard: PatchDashboardSettingsMutationVariables = {
      id: props.dashboard.id,
      name,
      user_id: owner.type === "user" ? owner.id : undefined,
      team_id: owner.type === "team" ? owner.id : undefined,
      is_private: isPrivate,
      slug: customSlug !== "" ? customSlug : props.dashboard.slug,
      tags: parseTagsList(tags),
    };

    const hasOwnerChanged = !(
      props.dashboard.owner.type === owner.type &&
      props.dashboard.owner.id === owner.id
    );

    patchSettings({ variables: dashboard }).then((data) => {
      if (data.errors) {
        if (
          data.errors[0].message.includes("dashboards_unique_user_slug_idx") ||
          data.errors[0].message.includes("dashboards_unique_team_slug_idx")
        ) {
          setError(
            Error(
              `You already have a dashboard with this URL: ${customSlug.trim()} . Please pick another one.`
            )
          );
        } else {
          if (privateDashboardNotAllowed(data.errors[0].message)) {
            setIsPrivate(false);
            addDashboardLimitNotification(
              hasAdminPermission,
              ownerServiceTierReleaseVersion
            );
          }
          setError(data.errors[0]);
        }
      } else {
        if (hasOwnerChanged) {
          // Dashboard schedule is deleted on owner change
          // It takes some time for the underlying db to change, so drop
          // it from the cache instead of refetching.
          clearDashboardScheduleCache(dashboard.id);
        }

        // Current user lost the access to this dashboard after transferring the ownership.
        if (
          isPrivate &&
          owner.type === "user" &&
          owner.id !== session?.user?.id
        ) {
          replace("/workspace/library?tab=dashboards");

          return;
        }

        props.refresh?.().then(() => {
          props.onDismiss();
        });

        if (
          props.dashboard.owner.handle !== owner.handle ||
          customSlug !== ""
        ) {
          replace(
            dashboardLink(
              owner.handle,
              customSlug !== "" ? customSlug : props.dashboard.slug
            )
          );
        }
      }
    });
  };

  const toggleArchive = async (event: React.SyntheticEvent) => {
    event.preventDefault();

    const dashboard = {
      ...props.dashboard,
      is_archived: !props.dashboard.is_archived,
    };

    setArchiveError(undefined);
    setArchiveLoading(true);

    try {
      await callUpsertDashboard(dashboard, session);
      await props.refresh?.();
      props.onDismiss();
    } catch (err: any) {
      setArchiveError(err);
    } finally {
      setArchiveLoading(false);
    }
  };

  const aggError = error || archiveError;
  const aggLoading = loading || archiveLoading;

  return (
    <form onSubmit={onSubmit}>
      <Fields>
        <FieldLabel label="Dashboard title">
          <InputText
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </FieldLabel>
        <FieldLabel label="Customize the URL">
          <InputText
            placeholder={props.dashboard.slug}
            value={customSlug}
            onChange={(event) => setCustomSlug(event.target.value)}
          />
        </FieldLabel>
        <FieldTagsList label="Dashboard tags" tags={tags} onChange={setTags} />
        {hasAdminPermission && (
          <>
            <SelectOwnerICanAssign
              initialOwner={initialOwner}
              owner={owner}
              setOwner={setOwner}
            />
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
          </>
        )}

        {aggError && !privateDashboardNotAllowed(aggError.message) && (
          <FieldError error={aggError} />
        )}

        <hr />
        <FieldButtons>
          <ButtonGroup>
            <ButtonOld
              type="submit"
              loading={aggLoading}
              disabled={!name.trim()}
              color2
              size="sm"
            >
              Save
            </ButtonOld>
          </ButtonGroup>
          <ButtonGroup>
            <ButtonOld
              onClick={toggleArchive}
              disabled={aggLoading}
              className={styles.archiveButton}
              size="sm"
            >
              {props.dashboard.is_archived ? "Unarchive" : "Archive"}
            </ButtonOld>
            <ButtonOld
              onClick={props.onDismiss}
              disabled={aggLoading}
              color2
              light
              size="sm"
            >
              Cancel
            </ButtonOld>
          </ButtonGroup>
        </FieldButtons>
      </Fields>
    </form>
  );
};

const privateDashboardNotAllowed = (errorMessage: string): boolean => {
  return (
    errorMessage.includes("max_number_of_private_dashboards_reached") ||
    errorMessage.includes("Reached max number of private dashboards.") ||
    errorMessage.includes("User must be Pro to own a private resource.")
  );
};

export function addDashboardLimitNotification(
  hasAdminPermission: boolean,
  releaseVersion?: string
) {
  if (hasAdminPermission) {
    return addToastNotification({
      level: "error",
      title: "You've reached the private dashboard limit.",
      actions: releaseVersion === "v2" && (
        <>
          <a target="_blank" href="/pricing">
            Upgrade plan
          </a>
        </>
      ),
    });
  } else {
    return addToastNotification({
      level: "error",
      title: "Private dashboard limit reached.",
      description: "Please reach out to your team admin to manage it.",
    });
  }
}
