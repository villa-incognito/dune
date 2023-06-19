import styles from "./DashboardsList.module.css";

import Link from "next/link";
import { Avatar } from "gui/avatar/avatar";
import { TimeRelative } from "gui/time/time";
import { Icon } from "gui/icon/icon";
import Star from "./DashboardStar";

import useDashboardsFavorites from "../api/useDashboardsFavorites";

import type { DashboardType } from "../api/dashboardItem";
import { Tags } from "gui/tags/tags";

interface Props {
  dashboards: DashboardType[];
}

export default function DashboardsList(props: Props) {
  const dashboardIds = props.dashboards.map((q) => q.id);
  const favorites = useDashboardsFavorites(dashboardIds);

  return (
    <table className={styles.table}>
      <tbody>
        {props.dashboards.map((dashboard) => (
          <tr key={dashboard.id}>
            <td className={styles.avatarColumn}>
              <Link href={`/${dashboard.owner.handle}`}>
                <a>
                  <Avatar
                    src={dashboard.owner.profile_image_url}
                    alt={dashboard.owner.handle}
                    size={25}
                  />
                </a>
              </Link>
            </td>
            <td>
              <div className={styles.multiline}>
                <div className={styles.nameAndTags}>
                  <Link href={`/${dashboard.owner.handle}/${dashboard.slug}`}>
                    <a className={styles.dashboardName}>
                      {dashboard.name}
                      {dashboard.isTrending && <span>&nbsp;🔥</span>}
                    </a>
                  </Link>
                  {dashboard.tags.length > 0 && (
                    <Tags
                      className={styles.tags}
                      slug="dashboards"
                      tags={dashboard.tags.slice(0, 5)}
                    />
                  )}
                </div>
                <div className={styles.userName}>
                  Created by{" "}
                  <Link href={`/${dashboard.owner.handle}`}>
                    <a>@{dashboard.owner.handle}</a>
                  </Link>{" "}
                  <TimeRelative>{dashboard.created_at}</TimeRelative>
                  {dashboard.is_private && <Icon icon="lock-fill" />}
                </div>
              </div>
            </td>
            <td>
              <Star
                dashboard_id={dashboard.id}
                stars={dashboard.favoriteCount}
                isFavorite={
                  favorites.dict?.[dashboard.id]?.iHaveFavorited ?? false
                }
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
