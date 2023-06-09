import styles from "./DashboardsList.module.css";

import Link from "next/link";
import { TimeRelative } from "gui/time/time";
import { Icon } from "gui/icon/icon";
import Star from "./DashboardStar";

import useDashboardsFavorites from "../api/useDashboardsFavorites";

import type { DashboardType } from "../api/dashboardItem";
import { Tags } from "gui/tags/tags";
import { AvatarOrIcon } from "gui/browse-shared/AvatarOrIcon";

interface Props {
  dashboards: DashboardType[];
  origin?: "creations";
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
              <AvatarOrIcon
                handle={dashboard.owner.handle}
                href={`/${dashboard.owner.handle}/${dashboard.slug}`}
                resource="dashboard"
                origin={props.origin}
                profile_image_url={dashboard.owner.profile_image_url}
              />
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
                  <Link href={`/${dashboard.owner.handle}`}>
                    <a>@{dashboard.owner.handle}</a>
                  </Link>{" "}
                  <ul>
                    <li>
                      <span>updated</span>
                      <TimeRelative>{dashboard.updated_at}</TimeRelative>
                    </li>
                  </ul>
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
