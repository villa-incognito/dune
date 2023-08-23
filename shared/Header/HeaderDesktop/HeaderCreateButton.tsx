import {
  HoverPopover,
  ContentProps,
} from "components/HoverPopover/HoverPopover";
import * as Menu from "components/MenuPanel/MenuPanel";
import { IconButton } from "components/Button/IconButton";
import { IconPlusSquare } from "components/Icons/IconPlusSquare";
import { IconTerminalWindow } from "components/Icons/IconTerminalWindow";
import { IconGridFour } from "components/Icons/IconGridFour";
import { CreateDashboardDialog } from "gui/dashboard/create";

import { useState } from "react";
import { useSession } from "gui/session/session";
import { useLoginUrl, getLoginUrlWithNextUrl } from "src/hooks/useLoginUrl";

import styles from "./HeaderDesktop.module.css";
import { useActiveContext } from "shared/ContextSwitcher/store";
import { useCanInviteMembers } from "lib/teams/teams";
import { InviteMemberDialog } from "shared/InviteMember/InviteMemberDialog";
import { IconPeople } from "components/Icons/IconPeople";
import { useMyTeamsIfLoggedIn } from "shared/teams/useMyTeams";
import { useIsDataUploadEnabledForActiveContext } from "page-components/DataUpload/useIsDataUploadEnabledForActiveContext";
import { IconUploadCloud } from "components/Icons/IconUploadCloud";
import { DataUploadUpsellDialogContent } from "page-components/DataUpload/UpsellDialogContent";
import { ModalWithoutTrigger } from "components/Modal";
import { useAnalytics } from "gui/analytics/analytics";

export function HeaderCreateButton() {
  const session = useSession();
  const loginUrl = useLoginUrl();
  const { captureEvent } = useAnalytics();

  const [
    isCreateDashboardDialogOpen,
    setIsCreateDashboardDialogOpen,
  ] = useState(false);
  const [isAddMembersDialogOpen, setIsAddMembersDialogOpen] = useState(false);
  const [
    isDataUploadsUpsellDialogOpen,
    setIsDataUploadsUpsellDialogOpen,
  ] = useState(false);

  const activeContext = useActiveContext();
  const myTeams = useMyTeamsIfLoggedIn(session);
  const canInviteMembers = useCanInviteMembers(activeContext);
  const dataUploadEnabled = useIsDataUploadEnabledForActiveContext();

  const showCreateTeam = myTeams?.length === 0;

  const dataUploadLink = () => {
    switch (dataUploadEnabled) {
      case "enabled":
        return (
          <Menu.ItemLink href="/data/upload">
            <IconUploadCloud />
            Upload a dataset
          </Menu.ItemLink>
        );
      case "requires_upgrade":
        return (
          <Menu.ItemButton
            onClick={() => {
              setIsDataUploadsUpsellDialogOpen(true);
            }}
          >
            <IconUploadCloud />
            Upload a dataset
          </Menu.ItemButton>
        );
      case "not_enabled":
        return null;
    }
  };

  const menu = ({ close }: ContentProps) => (
    <Menu.Panel>
      <Menu.Section>
        <Menu.ItemLink
          href={session ? "/queries" : getLoginUrlWithNextUrl("/queries")}
        >
          <IconTerminalWindow />
          New query
        </Menu.ItemLink>

        {!session ? (
          <Menu.ItemLink href={loginUrl}>
            <IconGridFour />
            New dashboard
          </Menu.ItemLink>
        ) : (
          <Menu.ItemButton
            onClick={() => {
              setIsCreateDashboardDialogOpen(true);
              close();
            }}
          >
            <IconGridFour />
            New dashboard
          </Menu.ItemButton>
        )}
        {dataUploadLink()}
      </Menu.Section>
      {(canInviteMembers || showCreateTeam) && (
        <Menu.Section>
          {canInviteMembers && (
            <Menu.ItemButton
              onClick={() => {
                setIsAddMembersDialogOpen(true);
                close();
              }}
            >
              <IconPeople />
              Invite Members
            </Menu.ItemButton>
          )}
          {showCreateTeam && (
            <Menu.ItemLink href="/teams/new">
              <IconPeople />
              Create Team
            </Menu.ItemLink>
          )}
        </Menu.Section>
      )}
    </Menu.Panel>
  );

  return (
    <>
      <HoverPopover position="below-align-left" content={menu}>
        <IconButton
          theme="primary-light"
          size="M"
          className={styles.createButton}
        >
          <IconPlusSquare />
        </IconButton>
      </HoverPopover>

      {session && (
        <CreateDashboardDialog
          isOpen={isCreateDashboardDialogOpen}
          close={() => setIsCreateDashboardDialogOpen(false)}
          redirect={true}
        />
      )}
      {dataUploadEnabled === "requires_upgrade" && (
        <ModalWithoutTrigger
          label={"Data uploads are only available on paid plans"}
          size="M"
          isOpen={isDataUploadsUpsellDialogOpen}
          onDismiss={() => {
            setIsDataUploadsUpsellDialogOpen(false);
            captureEvent("Data upload Upsell Dialog - View Plans Clicked");
          }}
          content={
            <DataUploadUpsellDialogContent
              close={() => setIsDataUploadsUpsellDialogOpen(false)}
            />
          }
        />
      )}
      {activeContext?.type === "team" && session && (
        <InviteMemberDialog
          title="Invite Members"
          isOpen={isAddMembersDialogOpen}
          onDismiss={() => setIsAddMembersDialogOpen(false)}
          session={session}
          team={activeContext}
        />
      )}
    </>
  );
}
