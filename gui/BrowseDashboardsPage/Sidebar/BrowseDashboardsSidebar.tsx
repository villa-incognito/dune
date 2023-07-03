import styles from "gui/BrowseDashboardsPage/BrowsePage.module.css";
import listStyles from "gui/box/list.module.css";
import searchStyles from "gui/browse-shared/search.module.css";
import cn from "classnames";

import { FieldLabel } from "gui/input/fields";
import { InputText } from "gui/input/input";
import { RadioLinkGroup, RadioButtonLink } from "gui/radio-buttons/radio-links";
import Link from "next/link";
import { Icon } from "gui/icon/icon";
import { DashboardCreateButton } from "gui/dashboard/create";
import { BoxList } from "gui/box/list";
import { HelperDashboardsQueries } from "gui/helper/helper";

import { useActiveContext } from "shared/ContextSwitcher/store";
import useFreetextFilterState from "gui/browse-shared/useFreetextFilterState";
import useOwnerState from "gui/browse-shared/useOwnerState";
import useTagState from "gui/browse-shared/useTagState";
import useOrderState from "./useOrderState";

import type { Tag } from "lib/tags/types";

/*
 * This sidebar uses state from the exported hooks here. The page that
 * renders this sidebar should use the same state in the apiParams.
 */
export { useFreetextFilterState, useOwnerState, useTagState, useOrderState };

interface Props {
  tags: Tag[];
  freetextLabel: string;
}

export default function BrowseDashboardsSidebar(props: Props) {
  const activeContext = useActiveContext();

  const { freetextFilter, setFreetextFilter } = useFreetextFilterState();
  const [owner, , getOwnerUrl] = useOwnerState();
  const [selectedTag, , getTagUrl] = useTagState();
  const [order, , getOrderUrl] = useOrderState();

  function getTrendingOrderUrl(time_range: "1h" | "4h" | "24h") {
    return getOrderUrl({ by: "trending", time_range });
  }

  function getFavoriteOrderUrl(time_range: "24h" | "7d" | "30d" | "all") {
    return getOrderUrl({ by: "favorites", time_range });
  }

  return (
    <>
      <aside className={styles.searchOptions}>
        <RadioLinkGroup
          appearance="buttons"
          label="Rank dashboards by"
          value={order.by}
        >
          <RadioButtonLink
            value="favorites"
            href={getOrderUrl({ by: "favorites", time_range: "7d" })}
          >
            <span>⭐ Favorites</span>
          </RadioButtonLink>
          <RadioButtonLink
            value="trending"
            href={getOrderUrl({ by: "trending", time_range: "4h" })}
          >
            <span>🔥 Trending</span>
          </RadioButtonLink>
          <RadioButtonLink
            value="created_at"
            href={getOrderUrl({ by: "created_at" })}
          >
            <span>🎊 New</span>
          </RadioButtonLink>
        </RadioLinkGroup>

        <FieldLabel label={props.freetextLabel}>
          <InputText
            placeholder="DEX..."
            autoComplete="off"
            type="search"
            value={freetextFilter}
            onChange={(event) => {
              setFreetextFilter(event.target.value);
            }}
          />
        </FieldLabel>

        {order.by === "trending" && (
          <RadioLinkGroup
            appearance="buttons"
            label="Time range"
            value={order.time_range ?? "all"}
          >
            <RadioButtonLink href={getTrendingOrderUrl("1h")} value="1h">
              1 hour
            </RadioButtonLink>
            <RadioButtonLink href={getTrendingOrderUrl("4h")} value="4h">
              4 hours
            </RadioButtonLink>
            <RadioButtonLink href={getTrendingOrderUrl("24h")} value="24h">
              24 hours
            </RadioButtonLink>
          </RadioLinkGroup>
        )}

        {order.by === "favorites" && (
          <RadioLinkGroup
            appearance="buttons"
            label="Time range"
            value={order.time_range ?? "all"}
          >
            <RadioButtonLink value="24h" href={getFavoriteOrderUrl("24h")}>
              24 hours
            </RadioButtonLink>
            <RadioButtonLink value="7d" href={getFavoriteOrderUrl("7d")}>
              7 days
            </RadioButtonLink>
            <RadioButtonLink value="30d" href={getFavoriteOrderUrl("30d")}>
              30 days
            </RadioButtonLink>
            <RadioButtonLink value="all" href={getFavoriteOrderUrl("all")}>
              All time
            </RadioButtonLink>
          </RadioLinkGroup>
        )}

        {(owner || selectedTag) && (
          <ul>
            {owner && (
              <li className={searchStyles.selection}>
                <Icon icon="person" aria-label="Selected user" />
                <span className={searchStyles.title}>
                  <Link href={`/${owner.handle}`}>
                    <a>@{owner.handle}</a>
                  </Link>
                </span>
                <Link prefetch={false} href={getOwnerUrl(undefined)}>
                  <a className={searchStyles.action}>
                    <Icon icon="x" aria-label="Clear" />
                  </a>
                </Link>
              </li>
            )}

            {selectedTag && (
              <li className={searchStyles.selection}>
                <Icon icon="tag" aria-label="Selected tag" />
                <span className={searchStyles.title}>{selectedTag}</span>
                <Link prefetch={false} href={getTagUrl(undefined)}>
                  <a className={searchStyles.action}>
                    <Icon icon="x" aria-label="Clear" />
                  </a>
                </Link>
              </li>
            )}
          </ul>
        )}

        {activeContext?.permissions.canEditContent && (
          <div className={searchStyles.create}>
            <DashboardCreateButton redirect />
          </div>
        )}
      </aside>

      <aside className={styles.tags}>
        <BoxList title="Popular dashboard tags" border>
          {props.tags.map(({ tag, popularity }: Tag, index) => (
            <li>
              <Link prefetch={false} href={getTagUrl(tag)} key={tag}>
                <a aria-current={tag === selectedTag}>
                  <div className={cn(listStyles.item)}>
                    <span className={listStyles.icon}>
                      <Icon icon="tag" />
                    </span>
                    <span
                      className={listStyles.text}
                      style={{
                        borderTop:
                          index === 0 ? "" : "1px solid var(--gray-300)",
                      }}
                    >
                      <span>{tag}</span>
                    </span>
                    <span
                      className={listStyles.count}
                      style={{
                        borderTop:
                          index === 0 ? "" : "1px solid var(--gray-300)",
                      }}
                    >
                      <span>{popularity}</span>
                    </span>
                  </div>
                </a>
              </Link>
            </li>
          ))}
        </BoxList>
      </aside>

      <section className={styles.helperInfo}>
        <HelperDashboardsQueries />
      </section>
    </>
  );
}
