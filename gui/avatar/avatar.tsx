/* eslint @typescript-eslint/strict-boolean-expressions: off */

import cn from "classnames";
import styles from "gui/avatar/avatar.module.css";
import { Nullable } from "lib/types/types";

export const Avatar: React.FC<{
  src: Nullable<string>;
  alt?: string;
  size: number;
  rounded?: boolean;
  className?: string;
}> = (props) => {
  const { rounded = true } = props;
  const className = cn(
    styles.avatar,
    rounded && styles.rounded,
    props.className
  );

  if (!props.src) {
    return (
      <div
        role="img"
        style={{
          width: `${props.size}px`,
          height: `${props.size}px`,
          // Prevent shrinking when there isn't enough space
          minWidth: `${props.size}px`,
        }}
        className={className}
        aria-label={props.alt}
        aria-hidden={!props.alt}
      />
    );
  }

  const src1x = props.src.replace("s=40", `s=${props.size}`);
  const src2x = props.src.replace("s=40", `s=${props.size * 2}`);
  const src3x = props.src.replace("s=40", `s=${props.size * 3}`);
  const srcSet = [src1x, src2x + " 2x", src3x + " 3x"].join(", ");

  return (
    <img
      srcSet={srcSet}
      src={src1x}
      alt={props.alt}
      width={props.size}
      height={props.size}
      className={className}
      aria-hidden={!props.alt}
    />
  );
};
