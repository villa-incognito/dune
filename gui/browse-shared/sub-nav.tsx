/* eslint @typescript-eslint/strict-boolean-expressions: off */

import { EntryFilter } from "lib/entries/types";
import { Icon } from "gui/icon/icon";
import { Pagenav } from "gui/pagenav/pagenav";
import { PagenavItem } from "gui/pagenav/pagenav";

export const BrowseSubNav: React.FC<{
  filter?: EntryFilter;
  className?: string;
}> = ({ filter, className }) => {
  const filterPath = filter ? `/${filter}` : "";
  /*
   * Don't prefetch Discover pages, since they fetch a lot in `getStaticProps`.
   * Favorites and My Creations can be prefetched, though.
   *
   * (When prefetch is enabled, use prefetch={undefined}, to avoid a warning
   * during tests saying that prefetch={true} is unnecessary 🤷)
   */
  const shouldPrefetch = filter !== undefined;
  const prefetch = shouldPrefetch && undefined;

  return (
    <Pagenav className={className}>
      <PagenavItem href={"/browse/dashboards" + filterPath} prefetch={prefetch}>
        <Icon icon="dashboard" />
        Dashboards
      </PagenavItem>
      <PagenavItem href={"/browse/queries" + filterPath} prefetch={prefetch}>
        <Icon icon="terminal" />
        Queries
      </PagenavItem>
      {filter === undefined && (
        <>
          <PagenavItem href={"/browse/wizards"} prefetch={false}>
            <Icon icon="person" />
            Wizards
          </PagenavItem>
          <PagenavItem href={"/browse/teams"} prefetch={false}>
            <Icon icon="people" />
            Teams
          </PagenavItem>
        </>
      )}
    </Pagenav>
  );
};
