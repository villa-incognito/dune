import modal from "components/Modal/ModalContent.module.css";
import styles from "./UpsellDialogContent.module.css";
import cn from "classnames";
import { Button } from "components/Button/Button";
import { AnchorButton } from "components/Button/AnchorButton";
import { useEffect } from "react";
import { useAnalytics } from "gui/analytics/analytics";

export function DataUploadUpsellDialogContent({
  close,
}: {
  close: () => void;
}) {
  const { captureEvent } = useAnalytics();
  useEffect(() => {
    captureEvent("Data upload Upsell Dialog viewed");
  }, []);

  return (
    <div className={cn(modal.body)}>
      <img src="/assets/og-pricing.png" className={styles.demoImage} />

      <div className={modal.header}>
        <div className={modal.titleRow}>
          <h2>Upgrade Plan to Upload Your Own Data</h2>
        </div>

        <p className={modal.description}>
          Data uploads are currently only available to teams on paid plans. You
          can upload data both via CSV from the app and an API endpoint, which
          can then be queried alongside any other table on Dune. You can view{" "}
          <a
            className={styles.anchor}
            href="/docs/app/upload-data/#querying-for-the-data-in-dune"
          >
            documentation here
          </a>
          .
        </p>
      </div>

      <div className={modal.buttons}>
        <Button
          size="M"
          theme="tertiary"
          onClick={() => {
            close();
            captureEvent("Data upload Upsell Dialog - closed");
          }}
        >
          Close
        </Button>

        <AnchorButton
          href="/pricing?utm_source=upsell-dialog&utm_campaign=data-upload"
          size="M"
          theme="primary"
          prefetch
        >
          View Plans
        </AnchorButton>
      </div>
    </div>
  );
}
