import styles from "./HamburgerMenu.module.css";
import { IconButton } from "components/Button/IconButton";
import { AnchorButton } from "components/Button/AnchorButton";
import { Button } from "components/Button/Button";
import GlobalSearch from "gui/GlobalSearch/GlobalSearch";
import * as Menu from "components/MenuPanel/MenuPanel";
import { CreateDashboardDialog } from "gui/dashboard/create";

import { Identity } from "components/Identity";
import { IconList } from "components/Icons/IconList";
import { IconCross } from "components/Icons/IconCross";

import { useContext, useState } from "react";
import { SessionContext } from "gui/session/session";
import { useActiveContext } from "shared/ContextSwitcher/store";
import { useIsDataUploadEnabledForActiveContext } from "page-components/DataUpload/useIsDataUploadEnabledForActiveContext";
import { useLoginUrl, getLoginUrlWithNextUrl } from "src/hooks/useLoginUrl";
import { useSignupUrl } from "src/hooks/useSignupUrl";

export function HamburgerMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [
    isCreateDashboardDialogOpen,
    setIsCreateDashboardDialogOpen,
  ] = useState(false);

  const { session, sessionLoading } = useContext(SessionContext);
  const isLoggedOut = !session && !sessionLoading;
  const loginUrl = useLoginUrl();
  const signupUrl = useSignupUrl();
  const activeContext = useActiveContext();
  const dataUploadEnabled = useIsDataUploadEnabledForActiveContext();

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
                  <Identity
                    size="L"
                    color="inherit"
                    inline={false}
                    owner={activeContext}
                  />
                </h2>

                <ul>
                  <Menu.ItemLink href="/workspace/library">
                    Library
                  </Menu.ItemLink>

                  {activeContext?.permissions.canEditContent && (
                    <li>
                      <ul className={styles.buttonGroup}>
                        <li>
                          <AnchorButton
                            theme="primary-light"
                            size="M"
                            href={
                              session
                                ? "/queries"
                                : getLoginUrlWithNextUrl("/queries")
                            }
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
                          theme="primary-light"
                          size="M"
                          href={getLoginUrlWithNextUrl("/queries")}
                          onClick={() => {
                            setIsMenuOpen(false);
                          }}
                        >
                          <span>New query</span>
                        </AnchorButton>
                      </li>

                      <li>
                        <AnchorButton
                          theme="primary-light"
                          size="M"
                          href={loginUrl}
                        >
                          <span>New dashboard</span>
                        </AnchorButton>
                      </li>
                    </ul>
                  </li>

                  <li>
                    <ul className={styles.buttonGroup}>
                      <li>
                        <AnchorButton
                          theme="secondary"
                          size="M"
                          href={signupUrl}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <span>Sign up</span>
                        </AnchorButton>
                      </li>

                      <li>
                        <AnchorButton
                          theme="secondary-light"
                          size="M"
                          href={loginUrl}
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
            <Menu.ItemLink href="https://t.me/dune_updates" target="_blank">
              Telegram
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
            {dataUploadEnabled === "enabled" && (
              <Menu.ItemLink href="/data/upload">
                Upload a dataset
              </Menu.ItemLink>
            )}
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
