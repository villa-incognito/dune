import styles from "./PrivacyTooltip.module.css";

export function PrivacyTooltip(props: {
  resource: "query" | "dashboard";
  hasAdminPermission: boolean;
}) {
  const { resource, hasAdminPermission } = props;
  if (hasAdminPermission) {
    return (
      <div className={styles.tooltip}>
        You’ve reached the private {resource} limit. <br /> To increase the
        limit,{" "}
        <a className={styles.upgradeLink} href="/pricing">
          upgrade plan
        </a>
        .
      </div>
    );
  } else {
    return (
      <div className={styles.tooltip}>
        Your team reached the private {resource} limit. <br /> Please reach out
        to your team admin to manage it.
      </div>
    );
  }
}
