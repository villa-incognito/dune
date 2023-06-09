import styles from "./Header.module.css";
import { HeaderDesktop } from "./HeaderDesktop/HeaderDesktop";
import { HeaderMobile } from "./HeaderMobile/HeaderMobile";
import { HeaderScreenshot } from "./HeaderScreenshot/HeaderScreenshot";
import { SkipNavLink, SkipNavContent } from "@reach/skip-nav";

import { useRouter } from "next/router";

export function Header() {
  // Show minimal header in screenshots
  if (useRouter().query.ref === "screenshot") {
    return <HeaderScreenshot />;
  }

  /*
   * Render both headers, and use CSS media query to only show one of
   * them at a time.
   *
   * The alternative is to render only one in JS, but that creates a
   * bug where the CSS doesn't get applied:
   *
   * If we render only one in JS, e.g. by using `@reach/window-size`,
   * we will only preload the code for one of the headers. On the server
   * side, we don't know the window size of the client, so it will be
   * random whether the server renders the same header as the client.
   * Somehow, if we render the opposite header on the client, the CSS
   * for that header is not applied.
   */
  return (
    <div className={styles.header}>
      <SkipNavLink className={styles.skip} />

      <HeaderMobile className={styles.headerMobile} />
      <HeaderDesktop className={styles.headerDesktop} />

      <SkipNavContent />
    </div>
  );
}
