/* eslint @typescript-eslint/strict-boolean-expressions: off */

import { dashboardPath, queryPath } from "lib/links/links";
import React, { useMemo } from "react";

import useGetGlobalSearchResults from "./useGetGlobalSearchResults";
import panelStyles from "../MenuPanel.module.css";
import { useDebouncedValue } from "src/hooks/useDebouncedValue";
import { Maybe } from "lib/types/graphql";
import { ArrowRight } from "phosphor-react";
import { Icon } from "gui/icon/icon";
import { Avatar } from "../../avatar/avatar";

export interface Item {
  key: string;
  href: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  label: string;
  categoryHeader?: boolean;
  category: "dashboard" | "query" | "user" | "team";
  createdBy?: {
    imageUrl?: Maybe<string>;
    name?: Maybe<string>;
  };
}

export default function useGlobalSearch(searchString: string): Item[] {
  const { data } = useGetGlobalSearchResults(
    useDebouncedValue({ delayMs: 300 }, searchString)
  );

  return useMemo(() => {
    const items: Array<Item> = [];

    // Dashboards
    items.push({
      key: "search-dashboard",
      href: `/browse/dashboards?q=${searchString}`,
      label: "Dashboards",
      rightElement: <ArrowRight size={16} />,
      categoryHeader: true,
      category: "dashboard",
    });

    data?.dashboard_favorite_count_all.forEach(({ dashboard = null }) => {
      if (dashboard === null) {
        return;
      }

      const owner = dashboard.team || dashboard.user;
      const ownerHandle = dashboard.user?.name ?? dashboard.team?.handle;

      items.push({
        key: `dashboard-${dashboard.id}`,
        href: ownerHandle ? dashboardPath(ownerHandle, dashboard.slug) : "",
        leftElement: <Icon icon="dashboard" className={panelStyles.iconLeft} />,
        label: dashboard.name,
        category: "dashboard",
        createdBy: {
          imageUrl: owner?.profile_image_url,
          name: owner?.name,
        },
      });
    });

    // Queries
    items.push({
      key: "search-queries",
      href: `/browse/queries?q=${searchString}`,
      label: "Queries",
      rightElement: <ArrowRight size={16} />,
      categoryHeader: true,
      category: "query",
    });

    data?.query_favorite_count_all.forEach(({ query = null }) => {
      if (query === null) {
        return;
      }

      const owner = query.team || query.user;

      items.push({
        key: `query-${query.id}`,
        href: queryPath(query.id),
        leftElement: <Icon icon="query" className={panelStyles.iconLeft} />,
        label: query.name || "",
        category: "query",
        createdBy: {
          imageUrl: owner?.profile_image_url,
          name: owner?.name,
        },
      });
    });

    // Users
    items.push({
      key: "search-users",
      href: `/browse/wizards?q=${searchString}`,
      label: "Wizards",
      rightElement: <ArrowRight size={16} />,
      categoryHeader: true,
      category: "user",
    });

    data?.user_received_stars.forEach(({ user = null }) => {
      if (user === null) {
        return;
      }

      items.push({
        key: `user-${user.id}`,
        href: `/${user.name}`,
        leftElement: <Avatar src={user.profile_image_url} size={18} />,
        label: user.name,
        category: "user",
      });
    });

    // Teams
    items.push({
      key: "search-teams",
      href: `/browse/teams?q=${searchString}`,
      label: "Teams",
      rightElement: <ArrowRight size={16} />,
      categoryHeader: true,
      category: "team",
    });

    data?.teams.forEach((team) =>
      items.push({
        key: `team-${team.id}`,
        href: `/${team.handle}`,
        leftElement: <Avatar src={team.profile_image_url} size={18} />,
        label: team.name,
        category: "team",
      })
    );

    return items;
  }, [searchString, data]);
}
