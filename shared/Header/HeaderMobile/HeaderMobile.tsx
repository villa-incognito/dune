import styles from "./HeaderMobile.module.css";
import cn from "classnames";
import { ContextSwitcher } from "shared/ContextSwitcher/ContextSwitcher";
import { AnchorButton } from "components/Button/AnchorButton";
import { HamburgerMenu } from "./HamburgerMenu";

import { useContext } from "react";
import { SessionContext } from "gui/session/session";

interface Props {
  className?: string;
}

export function HeaderMobile(props: Props) {
  const { session, sessionLoading } = useContext(SessionContext);
  const isLoggedOut = !session && !sessionLoading;

  return (
    <header className={cn(styles.header, props.className)}>
      <nav>
        {/* Left half */}
        <div className={styles.spacedGroup}>
          <ul>
            <li>
              <DuneLogo />
            </li>
          </ul>
          {session && (
            <>
              <IconSlash />
              <ContextSwitcher />
            </>
          )}
        </div>

        {/* Right half */}
        <div className={styles.spacedGroup}>
          {isLoggedOut && (
            <ul>
              <li>
                <AnchorButton theme="secondary" size="M" href="/auth/register">
                  Sign up
                </AnchorButton>
              </li>
            </ul>
          )}

          <ul>
            <li>
              <HamburgerMenu />
            </li>
          </ul>
        </div>
      </nav>
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

function IconSlash() {
  return (
    <svg
      width="10"
      height="26"
      viewBox="0 0 10 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9 1L1 25"
        stroke="var(--palette--gray--300)"
        strokeLinecap="round"
      />
    </svg>
  );
}
