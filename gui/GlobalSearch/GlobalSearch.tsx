/* eslint @typescript-eslint/strict-boolean-expressions: off */

import cn from "classnames";
import styles from "./GlobalSearch.module.css";
import panelStyles from "./MenuPanel.module.css";

import { InputText } from "gui/input/input";
import Link from "next/link";
import { Avatar } from "gui/avatar/avatar";

import { useEffect, useState } from "react";
import useGlobalSearch, { Item } from "./api/useGlobalSearch";
import { useAnalytics } from "gui/analytics/analytics";
import { useRouter } from "next/router";
import { useHotkey } from "lib/hooks/use-hotkey";
import { isMac } from "lib/shortcut";

import React from "react";

export default function GlobalSearch() {
  const router = useRouter();
  const [inputNode, setInputNode] = useState<HTMLInputElement | null>(null);

  const [searchString, setSearchString] = useState("");
  const items = useGlobalSearch(searchString);

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [items]);

  const { captureEvent } = useAnalytics();

  function trackItemClicked(item: Item) {
    if (item.categoryHeader) {
      captureEvent(
        "Search: Go to browse",
        {
          searchString,
          category: item.category,
        },
        { transport: "sendBeacon" }
      );
    } else {
      captureEvent(
        "Search: Go to result",
        {
          searchString,
          category: item.category,
          href: item.href,
        },
        { transport: "sendBeacon" }
      );
    }
  }

  useHotkey(inputNode, "Control+p");
  useHotkey(inputNode, "Command+p");

  return (
    <form
      role="search"
      aria-label="Site"
      onSubmit={(e) => e.preventDefault()}
      className={styles.wrapper}
      onKeyDown={(event) => {
        switch (event.key) {
          case "Escape":
            // Close search results and unfocus the input
            inputNode?.blur();
            // Prevent input from being cleared
            event.preventDefault();
            break;
          case "Enter":
            items[activeIndex] && router.push(items[activeIndex].href);
            inputNode?.blur();
            break;
          case "ArrowUp":
            setActiveIndex((index) => Math.max(0, index - 1));
            break;
          case "ArrowDown":
            setActiveIndex((index) => Math.min(items.length - 1, index + 1));
            break;
        }
      }}
      onFocus={() => {
        captureEvent("Search: Open");
      }}
      onBlur={() => {
        captureEvent("Search: Close");
      }}
    >
      <InputText
        type="search"
        value={searchString}
        onChange={(event) => setSearchString(event.target.value)}
        icon="search"
        placeholder="Search..."
        size="xs"
        autoComplete="off"
        ref={(node: HTMLInputElement | null) => setInputNode(node)}
      />
      <div aria-label="Shortcut" className={styles.shortcutHint}>
        {isMac() ? "cmd+p" : "ctrl+p"}
      </div>
      <ul className={cn(styles.results, panelStyles.menu)} role="listbox">
        {items.map((item, index) => {
          const active = index === activeIndex;

          return (
            <React.Fragment key={item.key}>
              {item.categoryHeader && index > 0 && (
                <hr className={panelStyles.categoryDivider} />
              )}
              <li
                onMouseOver={() => setActiveIndex(index)}
                role="option"
                aria-selected={active}
                className={cn(
                  active ? panelStyles.active : undefined,
                  item.categoryHeader && panelStyles.categoryHeader,
                  item.createdBy && panelStyles.alignedStart
                )}
              >
                <Link href={item.href}>
                  <a
                    tabIndex={-1 /* Navigate list with arrow keys, not tab */}
                    onClick={() => {
                      trackItemClicked(item);
                      // Close search results
                      // @ts-ignore
                      document.activeElement?.blur();
                    }}
                  >
                    {item.leftElement}
                    <div className={panelStyles.itemLabel}>
                      <p>{item.label}</p>
                      {item.createdBy && (
                        <div className={panelStyles.itemCreatedBy}>
                          <Avatar src={item.createdBy.imageUrl} size={16} />
                          <span>{item.createdBy.name}</span>
                        </div>
                      )}
                    </div>
                    {item.rightElement}
                  </a>
                </Link>
              </li>
            </React.Fragment>
          );
        })}
      </ul>
    </form>
  );
}
