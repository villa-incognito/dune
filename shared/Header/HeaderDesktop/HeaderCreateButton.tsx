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
import { loginPath } from "lib/links/links";
import { useRouter } from "next/router";

import styles from "./HeaderDesktop.module.css";

export function HeaderCreateButton() {
  const session = useSession();
  const router = useRouter();

  const [
    isCreateDashboardDialogOpen,
    setIsCreateDashboardDialogOpen,
  ] = useState(false);

  const menu = ({ close }: ContentProps) => (
    <Menu.Panel>
      <Menu.Section>
        <Menu.ItemLink href={session ? "/queries" : loginPath("/queries")}>
          <IconTerminalWindow />
          New query
        </Menu.ItemLink>

        {!session ? (
          <Menu.ItemLink href={loginPath(router.asPath)}>
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
    </>
  );
}
