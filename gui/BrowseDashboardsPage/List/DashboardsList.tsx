import styles from "shared/ContentList/ContentList.module.css";

import Link from "next/link";
import { TimeRelative } from "gui/time/time";
import { Icon } from "gui/icon/icon";
import Star from "./DashboardStar";
import { DashboardScheduleBadge } from "shared/ScheduleBadge/DashboardScheduleBadge";

import useDashboardsFavorites, { Output } from "../api/useDashboardsFavorites";
import { useHasViewPermission } from "lib/permissions/permissions";

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
          <DashboardTableRow
            key={dashboard.id}
            dashboard={dashboard}
            favorites={favorites}
            origin={props.origin}
          />
        ))}
      </tbody>
    </table>
  );
}

export const DashboardTableRow = ({
  dashboard,
  favorites,
  origin,
}: {
  dashboard: DashboardType;
  favorites: Output;
  origin?: "creations";
}) => {
  const hasViewPermission = useHasViewPermission(dashboard.owner);

  return (
    <tr>
      <td className={styles.avatarColumn}>
        <AvatarOrIcon
          handle={dashboard.owner.handle}
          href={`/${dashboard.owner.handle}/${dashboard.slug}`}
          resource="dashboard"
          origin={origin}
          profile_image_url={dashboard.owner.profile_image_url}
        />
      </td>
      <td>
        <div className={styles.multiline}>
          <div className={styles.nameAndTags}>
            <Link href={`/${dashboard.owner.handle}/${dashboard.slug}`}>
              <a className={styles.contentName}>
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
        <div className={styles.rightContainer}>
          <div className={styles.badges}>
            {hasViewPermission && (
              <DashboardScheduleBadge size="L" dashboardId={dashboard.id} />
            )}
          </div>
          <Star
            dashboard_id={dashboard.id}
            stars={dashboard.favoriteCount}
            isFavorite={favorites.dict?.[dashboard.id]?.iHaveFavorited ?? false}
          />
        </div>
      </td>
    </tr>
  );
};
