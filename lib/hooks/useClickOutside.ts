import { useMemo, useEffect } from "react";

type RefCurrent = HTMLElement | null;

function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}

export function useClickOutside(
  oneOrMore: RefCurrent | RefCurrent[],
  onClickOutside: (event: Event) => void
) {
  const elements: HTMLElement[] = useMemo(
    () =>
      [Array.isArray(oneOrMore) ? oneOrMore : [oneOrMore]].map((currents) =>
        currents.filter(isDefined)
      )[0],
    [oneOrMore]
  );

  useEffect(() => {
    if (elements.length === 0) return;

    const onClick = (event: Event) => {
      const isOutside = (element: HTMLElement) =>
        !element.contains(event.target as HTMLElement);

      if (elements.every(isOutside)) {
        onClickOutside(event);
      }
    };

    document.addEventListener("mousedown", onClick);

    return () => {
      document.removeEventListener("mousedown", onClick);
    };
  }, [elements, onClickOutside]);
}
