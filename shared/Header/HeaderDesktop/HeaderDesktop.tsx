/* eslint @typescript-eslint/strict-boolean-expressions: off */

import styles from "./HeaderDesktop.module.css";
import cn from "classnames";
import GlobalSearch from "gui/GlobalSearch/GlobalSearch";
import { ContextSwitcher } from "shared/ContextSwitcher/ContextSwitcher";
import { HeaderCreateButton } from "./HeaderCreateButton";
import Link from "next/link";
import { AnchorButton } from "components/Button/AnchorButton";
import { Tooltip } from "components/Tooltip/Tooltip";
import { ClickPopover } from "components/ClickPopover/ClickPopover";
import * as Menu from "components/MenuPanel/MenuPanel";

import { IconFileDoc } from "components/Icons/IconFileDoc";
import { IconDiscord } from "components/Icons/IconDiscord";
import { IconThreeDots } from "components/Icons/IconThreeDots";

import { useRouter, NextRouter } from "next/router";
import { useActiveContext } from "shared/ContextSwitcher/store";

import { ReactNode, useContext } from "react";
import { SessionContext } from "gui/session/session";
import { MigrationBanner } from "shared/MigrationBanner/MigrationBanner";
import { UsageTracker } from "shared/UsageTracker/UsageTracker";
import { MigrationDialogV2 } from "../../MigrationDialogV2/MigrationDialogV2";
import { Button } from "components/Button/Button";
import { IconTelegram } from "components/Icons/IconTelegram";

interface Props {
  className?: string;
}

export function HeaderDesktop(props: Props) {
  const { session, sessionLoading, logout } = useContext(SessionContext);
  const isLoggedOut = !session && !sessionLoading;
  const activeContext = useActiveContext();
  const currentPlanId = activeContext?.serviceTier?.id;

  return (
    <header className={cn(styles.header, props.className)}>
      <nav>
        {/*Left half */}
        <div className={styles.group}>
          <div className={styles.spacedGroup}>
            <ul className={styles.group}>
              <li>
                <DuneLogo />
              </li>
            </ul>
            <div className={styles.search}>
              <GlobalSearch />
            </div>
            <ul className={styles.group}>
              <li>
                <DiscoverLink />
              </li>
              <li>
                <FavoritesLink />
              </li>
            </ul>
          </div>

          <IconSlash />

          {/*
           * Inner sub-nav for content for the selected context. (nav
           * inside nav is valid html.)
           *
           * TODO: If possible, would be great to convey with html
           * elements that selected context is some sort of a heading
           * for the other items.
           */}
          <nav className={styles.spacedGroup}>
            {session && <ContextSwitcher />}
            <ul className={styles.group}>
              <li>
                <LibraryLink />
              </li>
              {session && (
                <li>
                  <UsageTracker />
                </li>
              )}
              {activeContext?.permissions.canEditContent && (
                <li>
                  <HeaderCreateButton />
                </li>
              )}
            </ul>
          </nav>
        </div>

        {/* Right half */}
        <div className={styles.group}>
          <ul className={styles.spacedGroup}>
            {session && (
              <li>
                {currentPlanId && [3, 4].includes(currentPlanId) ? (
                  <MigrationDialogV2>
                    <Button size="M" theme="secondary-light">
                      Explore new plans
                    </Button>
                  </MigrationDialogV2>
                ) : (
                  <AnchorButton
                    theme="secondary-light"
                    size="M"
                    href="/pricing"
                  >
                    Explore new plans
                  </AnchorButton>
                )}
              </li>
            )}
            <li>
              <CommunityLink />
            </li>
            <Item tooltip="Docs">
              <a className={styles.iconButton} href="/docs" target="_blank">
                <IconFileDoc />
              </a>
            </Item>
            <Item tooltip="Discord">
              <a
                className={styles.iconButton}
                href="https://discord.gg/ErrzwBz"
                target="_blank"
              >
                <IconDiscord />
              </a>
            </Item>
            <Item tooltip="Telegram">
              <a
                className={styles.iconButton}
                href="https://t.me/dune_updates"
                target="_blank"
              >
                <IconTelegram />
              </a>
            </Item>
            <li>
              <ClickPopover
                position="below-align-right"
                content={() => (
                  <Menu.Panel>
                    <Menu.Section>
                      <Menu.ItemLink
                        href="https://feedback.dune.com/"
                        target="_blank"
                      >
                        Give feedback
                      </Menu.ItemLink>
                      <Menu.ItemLink href="/projects">Projects</Menu.ItemLink>
                      <Menu.ItemLink href="/blog">Blog</Menu.ItemLink>
                      <Menu.ItemLink href="/pricing">
                        Subscriptions
                      </Menu.ItemLink>
                      <Menu.ItemLink href="/careers">Careers</Menu.ItemLink>
                      <Menu.ItemLink href="/changelog">Changelog</Menu.ItemLink>
                    </Menu.Section>
                    {session && (
                      <Menu.Section>
                        <Menu.ItemLink href="/contracts/new">
                          Submit a contract
                        </Menu.ItemLink>
                        <Menu.ItemLink href="/settings/profile">
                          Settings
                        </Menu.ItemLink>
                        <Menu.ItemButton onClick={logout}>
                          Sign out
                        </Menu.ItemButton>
                      </Menu.Section>
                    )}
                  </Menu.Panel>
                )}
              >
                <button className={styles.iconButton}>
                  <IconThreeDots />
                </button>
              </ClickPopover>
            </li>
            {isLoggedOut && (
              <>
                <li>
                  <AnchorButton
                    theme="secondary-light"
                    size="M"
                    href="/auth/login"
                  >
                    Sign in
                  </AnchorButton>
                </li>
                <li>
                  <AnchorButton
                    theme="secondary"
                    size="M"
                    href="/auth/register"
                  >
                    Sign up
                  </AnchorButton>
                </li>
              </>
            )}
          </ul>
        </div>
      </nav>
      {!isLoggedOut && <MigrationBanner />}
    </header>
  );
}

function DuneLogo() {
  return (
    <a className={styles.logoLink} href="/home">
      <img src="/assets/DuneLogoCircle.svg" alt="Dune" />
    </a>
  );
}

function DiscoverLink() {
  return (
    <PageLink
      prefetch={false}
      href="/browse/dashboards"
      isActive={(router) =>
        // Compare to path only – omit query params
        pathRegex.browse.test(router.asPath.split("?")[0])
      }
    >
      Discover
    </PageLink>
  );
}
function FavoritesLink() {
  return (
    <PageLink
      href="/browse/dashboards/favorite"
      isActive={(router) =>
        // Compare to path only – omit query params
        pathRegex.browseFavorites.test(router.asPath.split("?")[0])
      }
    >
      Favorites
    </PageLink>
  );
}
function LibraryLink() {
  return (
    <PageLink
      href="/browse/queries/authored"
      isActive={(router) =>
        // Compare to path only – omit query params
        pathRegex.browseAuthored.test(router.asPath.split("?")[0])
      }
    >
      Library
    </PageLink>
  );
}
function CommunityLink() {
  return (
    <PageLink href="/community" isActive={() => false}>
      Community
    </PageLink>
  );
}

export const pathRegex = {
  browse: /^\/browse\/[a-z]+$/,
  browseFavorites: /^\/browse\/[a-z]+\/favorite$/,
  browseAuthored: /^\/browse\/[a-z]+\/authored$/,
};

const PageLink: React.FC<
  React.ComponentProps<typeof Link> & {
    isActive?: (router: NextRouter) => boolean;
  }
> = ({ isActive, ...props }) => {
  const router = useRouter();

  const current =
    typeof isActive === "function"
      ? isActive(router)
      : router.asPath === props.href;

  return (
    <Link {...props}>
      <a
        className={styles.pageLink}
        aria-current={current ? "page" : undefined}
      >
        {props.children}
      </a>
    </Link>
  );
};

function IconSlash() {
  return (
    <svg
      width="10"
      height="26"
      viewBox="0 0 10 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={styles.slash}
    >
      <path
        d="M9 1L1 25"
        stroke="var(--palette--gray--300)"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Item(props: { tooltip: string; children: ReactNode }) {
  return (
    <Tooltip position="below-center" label={props.tooltip}>
      <li>{props.children}</li>
    </Tooltip>
  );
}
