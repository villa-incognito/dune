import React, { useState } from "react";
import { Modal } from "components/Modal";
import styles from "./CookieNotification.module.css";
import { Toggle } from "gui/Toggle/Toggle";
import { Button } from "components/Button/Button";
import modal from "components/Modal/ModalContent.module.css";

interface CookieModalProps {
  handleDismiss: (acceptCookies: boolean) => void;
}

const CookieModal = ({ handleDismiss }: CookieModalProps) => {
  const [performanceCookies, setPerformanceCookies] = useState(true);

  return (
    <Modal
      size="M"
      label="Cookies"
      trigger={({ onClick }) => (
        <Button theme="tertiary" size="S" onClick={onClick}>
          Manage Settings
        </Button>
      )}
      content={() => {
        return (
          <div className={modal.body}>
            <div className={modal.header}>
              <h2 className={modal.titleRow}>This site uses cookies.</h2>
              <p className={styles.offWhiteText}>
                Some of these cookies are essential, while other help us to
                improve your experience by providing insights into how the site
                is being used. By using this website you agree to our{" "}
                <a href="/privacy" target="_blank" className={styles.link}>
                  Cookie Policy
                </a>
                .
              </p>
            </div>

            <div className={styles.modalLayout}>
              <section>
                <h3>Necessary Cookies</h3>
                <p>
                  Necessary cookies enable core functionality. The website
                  cannot function properly without these cookies, and can only
                  be disabled by changing your browser preferences.
                </p>
              </section>

              <section className={styles.toggleSection}>
                <div>
                  <h3>Performance</h3>
                  <p>
                    We use these cookies to monitor and improve website
                    performance.
                  </p>
                </div>
                <Toggle
                  label=""
                  ariaLabel="Performance Cookie Checkbox"
                  enabled={performanceCookies}
                  setEnabled={() => setPerformanceCookies(!performanceCookies)}
                />
              </section>
            </div>

            <div className={modal.buttons}>
              <Button
                theme="primary"
                size="M"
                onClick={() => handleDismiss(performanceCookies)}
              >
                Save Preferences
              </Button>
            </div>
          </div>
        );
      }}
    />
  );
};

export default CookieModal;
