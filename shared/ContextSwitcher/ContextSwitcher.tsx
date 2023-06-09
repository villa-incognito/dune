import styles from "./ContextSwitcher.module.css";

import { ClickPopover } from "components/ClickPopover/ClickPopover";
import * as Menu from "components/MenuPanel/MenuPanel";
import { Avatar } from "gui/avatar/avatar";
import { IconAnchorButton } from "components/Button/IconAnchorButton";
import { BadgeUserPlan } from "./BadgeUserPlan";
import { BadgeTeamPlan } from "./BadgeTeamPlan";

import { IconGear } from "components/Icons/IconGear";
import { IconIdentificationBadge } from "components/Icons/IconIdentificationBadge";
import { IconChevronUpDown } from "components/Icons/IconChevronUpDown";
import { IconPlus } from "components/Icons/IconPlus";

import {
  useActiveContext,
  setActiveContext,
  useInjectSavedContextFromQueryParams,
} from "./store";
import { useRequiredSessionWithUser } from "gui/session/session";
import { useContext } from "react";
import { SessionContext } from "gui/session/session";
import { useMyTeams } from "shared/teams/useMyTeams";
import { useAnalytics } from "gui/analytics/analytics";

export function ContextSwitcher() {
  useInjectSavedContextFromQueryParams();

  const activeContext = useActiveContext();

  const session = useRequiredSessionWithUser();
  const { logout } = useContext(SessionContext);

  const teams = useMyTeams(session);

  const { captureEvent } = useAnalytics();

  if (!activeContext) {
    /*
     * This component is only rendered when you are logged in. However,
     * if the active context id in localStorage is a team,
     * `useActiveContext` will return undefined until teams are loaded.
     */
    return null;
  }

  const menu = ({ close }: { close: () => void }) => (
    <Menu.Panel>
      <Menu.Section title="Your account">
        <Menu.ItemButton
          onClick={() => {
            close();
            setActiveContext({ type: "user", id: session.user.id });
            captureEvent("ContextSwitcher: Set context", {
              type: "user",
              id: session.user.id,
              handle: session.user.name,
            });
          }}
          nestedButtonsOrLinks={
            <>
              <IconAnchorButton
                theme="ghost"
                size="XS"
                href={`/${session.user.name}`}
              >
                <IconIdentificationBadge />
              </IconAnchorButton>
              <IconAnchorButton
                theme="ghost"
                size="XS"
                href="/settings/profile"
              >
                <IconGear />
              </IconAnchorButton>
            </>
          }
        >
          <Avatar
            size={16}
            src={session.user.profile_image_url}
            alt={session.user.name}
          />
          <Menu.Text>@{session.user.name}</Menu.Text>
          <BadgeUserPlan session={session} />
        </Menu.ItemButton>
      </Menu.Section>

      <Menu.Section
        title="Teams"
        maxHeight={
          /*
           * This max-height fits on mobile*, and it makes it easy to
           * see when there are more items, since it shows half of the
           * 10th item in the section.
           *
           * *Screen must be at least 540px high, so won't fit in
           * landscape mode on mobile devices.
           */
          "30.5rem"
        }
      >
        {teams.map((team) => (
          <Menu.ItemButton
            key={team.id}
            onClick={() => {
              close();
              setActiveContext({ type: "team", id: team.id });
              captureEvent("ContextSwitcher: Set context", {
                type: "team",
                id: team.id,
                handle: team.handle,
              });
            }}
            nestedButtonsOrLinks={
              <>
                <IconAnchorButton
                  theme="ghost"
                  size="XS"
                  href={`/${team.handle}`}
                >
                  <IconIdentificationBadge />
                </IconAnchorButton>
                {team.membership.role === "admin" && (
                  <IconAnchorButton
                    theme="ghost"
                    size="XS"
                    href={`/settings/teams/manage/${team.handle}/profile`}
                  >
                    <IconGear />
                  </IconAnchorButton>
                )}
              </>
            }
          >
            <Avatar size={16} src={team.profile_image_url} alt={team.handle} />
            <Menu.Text>@{team.handle}</Menu.Text>
            <BadgeTeamPlan team={team} />
          </Menu.ItemButton>
        ))}
        <Menu.ItemLink href="/teams/new">
          <IconPlus />
          <Menu.Text>Create new team</Menu.Text>
        </Menu.ItemLink>
      </Menu.Section>

      <Menu.Section>
        <Menu.ItemButton onClick={logout}>Sign out</Menu.ItemButton>
      </Menu.Section>
    </Menu.Panel>
  );

  return (
    <ClickPopover position="below-align-left" content={menu}>
      <button className={styles.button}>
        <Avatar
          size={16}
          src={activeContext.profile_image_url}
          alt={activeContext.handle}
        />
        <span>@{activeContext.handle}</span>
        <IconChevronUpDown />
      </button>
    </ClickPopover>
  );
}
