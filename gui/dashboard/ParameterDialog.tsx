import { ButtonOld } from "components/ButtonOld/ButtonOld";
import { Dialog } from "gui/dialog/dialog";
import Row from "gui/layout/row";
import styles from "./ParameterDialog.module.css";
import { loginPath } from "lib/links/links";
import { useRouter } from "next/router";
import { useAnalytics } from "gui/analytics/analytics";

export const ParameterDialog: React.FC<{
  onDismiss: () => void;
  origin: "dashboards" | "queries";
}> = (props) => {
  const { asPath, push } = useRouter();
  const { captureEvent } = useAnalytics();
  const resource = props.origin === "dashboards" ? "dashboard" : "query";

  const onSignInClick = () => {
    captureEvent("ParameterDialog: Sign in clicked");
    push(loginPath(asPath));
  };

  captureEvent("ParameterDialog: Displayed");
  return (
    <>
      <Dialog label="param" size="sm" isOpen={true} onDismiss={props.onDismiss}>
        <div className={styles.dialog}>
          <h2>
            Parametrized {props.origin} are only available to signed in users
          </h2>
          <p>
            You can continue by opening the {resource} without parameters, or
            sign in to your Dune account to get the full narrative.
          </p>

          <Row>
            <ButtonOld type="submit" color2 size="sm" onClick={onSignInClick}>
              Sign in
            </ButtonOld>
            <ButtonOld onClick={props.onDismiss} size="sm" color2 light>
              Open {resource}
            </ButtonOld>
          </Row>
        </div>
      </Dialog>
    </>
  );
};
