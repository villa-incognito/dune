import cn from "classnames";
import styles from "gui/center/center.module.css";

export const Center: React.FC<{
  className?: string;
  role?: string;
  "aria-busy"?: boolean;
  "aria-live"?: "off" | "assertive" | "polite" | undefined;
}> = (props) => {
  const className = cn(styles.center, props.className);

  return (
    <div
      className={className}
      role={props.role}
      aria-busy={props["aria-busy"]}
      aria-live={props["aria-live"]}
    >
      {props.children}
    </div>
  );
};
