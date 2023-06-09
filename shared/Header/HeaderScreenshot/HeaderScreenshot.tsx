import styles from "./HeaderScreenshot.module.css";
import Link from "next/link";
import { DuneLogoWithName } from "components/Assets/DuneLogoWithName";

export function HeaderScreenshot() {
  return (
    <header className={styles.screenshot}>
      <nav>
        <Link href="/">
          <a className={styles.dune}>
            <DuneLogoWithName heightRem={3.2} />
          </a>
        </Link>
      </nav>
    </header>
  );
}
