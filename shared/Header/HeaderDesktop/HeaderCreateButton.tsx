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
import { useLoginUrl, getLoginUrlWithNextUrl } from "lib/hooks/useLoginUrl";

import styles from "./HeaderDesktop.module.css";
import { useActiveContext } from "shared/ContextSwitcher/store";
import { useCanInviteMembers } from "lib/teams/teams";
import { InviteMemberDialog } from "shared/InviteMember/InviteMemberDialog";
import { IconPeople } from "components/Icons/IconPeople";

export function HeaderCreateButton() {
  const session = useSession();
  const loginUrl = useLoginUrl();

  const [
    isCreateDashboardDialogOpen,
    setIsCreateDashboardDialogOpen,
  ] = useState(false);
  const [isAddMembersDialogOpen, setIsAddMembersDialogOpen] = useState(false);

  const activeContext = useActiveContext();
  const canInviteMembers = useCanInviteMembers(activeContext);

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
      </Menu.Section>
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
