import styles from "./Identity.module.css";
import cn from "classnames";
import { Avatar } from "gui/avatar/avatar";

export interface IdentityOwner {
  type: "team" | "user";
  handle: string;
  profile_image_url: string | undefined;
}

export interface IdentityProps {
  owner: IdentityOwner;
  size: "XS" | "S" | "M" | "L";
  /*
   * Always use `color="inherit"` inside interactive elements to get
   * correct :hover/:active effects.
   * Also prefer `color="inherit"` when this gives the right color.
   */
  color: "inherit" | "text-primary" | "text-secondary";
  /*
   * flip:
   *  - false (default):
   *    😊 @smiley
   *  - true:
   *    @smiley 😊
   */
  flip?: boolean;
  inline?: boolean; // default true
}

export function Identity(props: IdentityProps) {
  const { owner, size, color, flip = false, inline = true } = props;

  return (
    <span
      className={cn(
        styles.identity,
        styles[`size-${size}`],
        styles[`color-${color}`],
        flip && styles.flip,
        inline && styles.inline
      )}
    >
      <Avatar size={avatarSize[size]} src={owner.profile_image_url} />
      <span className={styles.handle}>@{owner.handle}</span>
    </span>
  );
}

const avatarSize: Record<IdentityProps["size"], number> = {
  XS: 12,
  S: 16,
  M: 16,
  L: 20,
};
