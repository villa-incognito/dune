import styles from "gui/loading/loading.module.css";
import VisuallyHidden from "@reach/visually-hidden";
import { Center } from "gui/center/center";

export const Loading: React.FC = () => {
  return (
    <Center aria-busy aria-live="polite">
      <div className={styles.loading}>
        <VisuallyHidden>Loading</VisuallyHidden>
      </div>
    </Center>
  );
};
