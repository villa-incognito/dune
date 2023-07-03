import styles from "./HamburgerMenu.module.css";
import { IconButton } from "components/Button/IconButton";
import { AnchorButton } from "components/Button/AnchorButton";
import { Button } from "components/Button/Button";
import GlobalSearch from "gui/GlobalSearch/GlobalSearch";
import * as Menu from "components/MenuPanel/MenuPanel";
import { CreateDashboardDialog } from "gui/dashboard/create";

import { Avatar } from "gui/avatar/avatar";
import { IconList } from "components/Icons/IconList";
import { IconCross } from "components/Icons/IconCross";

import { loginPath } from "lib/links/links";
import { useContext, useState } from "react";
import { SessionContext } from "gui/session/session";
import { useActiveContext } from "shared/ContextSwitcher/store";

export function HamburgerMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [
    isCreateDashboardDialogOpen,
    setIsCreateDashboardDialogOpen,
  ] = useState(false);

  const { session, sessionLoading } = useContext(SessionContext);
  const isLoggedOut = !session && !sessionLoading;
  const activeContext = useActiveContext();

  return (
    <>
      <IconButton
        theme="tertiary"
        size="M"
        onClick={() => setIsMenuOpen((open) => !open)}
      >
        {!isMenuOpen ? <IconList /> : <IconCross />}
      </IconButton>

      {isMenuOpen && (
        <nav className={styles.menu}>
          <GlobalSearch />

          <ul>
            <Menu.ItemLink href="/browse/dashboards">Discover</Menu.ItemLink>
            <Menu.ItemLink href="/browse/dashboards/favorite">
              Favorites
            </Menu.ItemLink>
          </ul>

          {activeContext && (
            <>
              <hr />

              <nav className={styles.context}>
                <h2>
                  <Avatar
                    size={20}
                    src={activeContext.profile_image_url}
                    alt={activeContext.handle}
                  />
                  <span>@{activeContext.handle}</span>
                </h2>

                <ul>
                  <Menu.ItemLink href="/browse/queries/authored">
                    Library
                  </Menu.ItemLink>

                  {activeContext?.permissions.canEditContent && (
                    <li>
                      <ul className={styles.buttonGroup}>
                        <li>
                          <AnchorButton
                            theme="primary-light"
                            size="M"
                            href={session ? "/queries" : loginPath("/queries")}
                            onClick={() => {
                              setIsMenuOpen(false);
                            }}
                          >
                            <span>New query</span>
                          </AnchorButton>
                        </li>

                        <li>
                          <Button
                            theme="primary-light"
                            size="M"
                            onClick={() => {
                              setIsMenuOpen(false);
                              setIsCreateDashboardDialogOpen(true);
                            }}
                          >
                            <span>New dashboard</span>
                          </Button>
                        </li>
                      </ul>
                    </li>
                  )}
                </ul>
              </nav>
            </>
          )}

          {isLoggedOut && (
            <>
              <hr />

              <nav>
                <ul>
                  <li>
                    <ul className={styles.buttonGroup}>
                      <li>
                        <AnchorButton
                          theme="secondary"
                          size="M"
                          href="/auth/register"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <span>Sign up</span>
                        </AnchorButton>
                      </li>

                      <li>
                        <AnchorButton
                          theme="secondary-light"
                          size="M"
                          href="/auth/login"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <span>Sign in</span>
                        </AnchorButton>
                      </li>
                    </ul>
                  </li>
                </ul>
              </nav>
            </>
          )}

          <hr />

          <ul>
            <Menu.ItemLink href="/docs" target="_blank">
              Docs
            </Menu.ItemLink>
            <Menu.ItemLink href="https://discord.gg/ErrzwBz" target="_blank">
              Discord
            </Menu.ItemLink>
            <Menu.ItemLink href="https://feedback.dune.com/" target="_blank">
              Give feedback
            </Menu.ItemLink>
            <Menu.ItemLink href="/projects">Projects</Menu.ItemLink>
            <Menu.ItemLink href="/community">Community</Menu.ItemLink>
            <Menu.ItemLink href="/blog">Blog</Menu.ItemLink>
            <Menu.ItemLink href="/pricing">Subscriptions</Menu.ItemLink>
            <Menu.ItemLink href="/careers">Careers</Menu.ItemLink>
            <Menu.ItemLink href="/changelog">Changelog</Menu.ItemLink>
            <Menu.ItemLink href="/contracts/new">
              Submit a contract
            </Menu.ItemLink>
          </ul>
        </nav>
      )}

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
