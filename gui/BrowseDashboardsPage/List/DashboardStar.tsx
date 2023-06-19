import { gql } from "@apollo/client";
import {
  RefetchDashboardFavoritesQuery,
  RefetchDashboardFavoritesQueryVariables,
  RefetchDashboardFavoritesDocument,
} from "lib/types/graphql";

import styles from "./DashboardsList.module.css";

import { Icon } from "gui/icon/icon";
import { formatNumber } from "lib/intl/number";

import type { Session } from "lib/users/types";
import { useSession } from "gui/session/session";
import { apolloCore } from "lib/apollo/apollo";
import {
  insertFavoriteDashboard,
  deleteFavoriteDashboard,
} from "lib/entries/graphql";
import {
  InsertFavoriteDashboardMutation,
  InsertFavoriteDashboardMutationVariables,
  DeleteFavoriteDashboardMutation,
  DeleteFavoriteDashboardMutationVariables,
} from "lib/types/graphql";

interface Props {
  dashboard_id: number;
  stars: number;
  isFavorite: boolean;
  enableFavoriting?: boolean;
}

export default function DashboardStar(props: Props) {
  const session = useSession();
  const { enableFavoriting = true } = props;

  if (!session || !enableFavoriting) {
    return (
      <div className={styles.favorites}>
        {formatNumber(props.stars)}
        <Icon icon="person" />
      </div>
    );
  } else if (props.isFavorite === undefined) {
    return (
      <div className={styles.favorites}>
        {formatNumber(props.stars)}
        <Icon icon="star" />
      </div>
    );
  } else {
    return <ToggleableDashboardStar {...props} />;
  }
}

function ToggleableDashboardStar(props: Props) {
  const session = useSession();

  if (!props.isFavorite) {
    return (
      <div className={styles.favorites}>
        {formatNumber(props.stars)}
        <button
          aria-label="Add to favorites"
          onClick={() => {
            addToFavorites(session, props.dashboard_id)
              .then(() => refetchFavorites(session, props.dashboard_id))
              .catch(
                () => {} // ignore failed request
              );
          }}
        >
          <Icon icon="star" />
        </button>
      </div>
    );
  } else {
    return (
      <div className={styles.favorites}>
        {formatNumber(props.stars)}
        <button
          aria-label="Remove from favorites"
          onClick={() => {
            removeFromFavorites(session, props.dashboard_id)
              .then(() => refetchFavorites(session, props.dashboard_id))
              .catch(
                () => {} // ignore failed request
              );
          }}
        >
          <Icon icon="star-fill" />
        </button>
      </div>
    );
  }
}

// Actions
function addToFavorites(session: Session | undefined, dashboard_id: number) {
  const session_id = session?.user?.id;

  if (session_id === undefined) {
    return Promise.reject();
  }

  return apolloCore
    .mutate<
      InsertFavoriteDashboardMutation,
      InsertFavoriteDashboardMutationVariables
    >({
      mutation: insertFavoriteDashboard,
      variables: { session_id, dashboard_id },
      fetchPolicy: "no-cache",
      context: { session },
    })
    .catch((error) => {
      if (
        error instanceof Error &&
        error.message ===
          'Uniqueness violation. duplicate key value violates unique constraint "favorite_dashboards_unique_user_dashboard_id_ix"'
      ) {
        // Already favorited by this user in another tab/session
        return Promise.resolve();
      } else {
        throw error;
      }
    });
}

function removeFromFavorites(
  session: Session | undefined,
  dashboard_id: number
) {
  const session_id = session?.user?.id;

  if (session_id === undefined) {
    return Promise.reject();
  }

  return apolloCore.mutate<
    DeleteFavoriteDashboardMutation,
    DeleteFavoriteDashboardMutationVariables
  >({
    mutation: deleteFavoriteDashboard,
    variables: { session_id, dashboard_id },
    fetchPolicy: "no-cache",
    context: { session },
  });
}

/*
 * Refetch the favorite state after toggling. This is done by a separate
 * gql dashboard, that only fetches the affected state for the affected item.
 *
 * This replaces data in the apollo cache which is returned for two
 * different gql dashboards (one that fetches the list, and one that fetches
 * whehter current user has favorited). If we instead re-executed those,
 * we would fetch more than necessary, but mainly, the list would get
 * reordered when toggling favorite, which is not desireable behavior.
 */
function refetchFavorites(session: Session | undefined, dashboard_id: number) {
  const session_id = session?.user?.id;

  if (session_id === undefined) {
    return Promise.reject();
  }

  return apolloCore.query<
    RefetchDashboardFavoritesQuery,
    RefetchDashboardFavoritesQueryVariables
  >({
    query: RefetchDashboardFavoritesDocument,
    variables: { session_id, id: dashboard_id },
    // network-only: Force fetch, store result in cache
    fetchPolicy: "network-only",
    context: { session },
  });
}

// Not assigned to constant here. Using generated. See _GrahphQL requests_ in readme.
gql`
  query RefetchDashboardFavorites($id: Int!, $session_id: Int!) {
    dashboards_by_pk(id: $id) {
      id

      favorite_dashboards(where: { user_id: { _eq: $session_id } }, limit: 1) {
        created_at
      }

      dashboard_favorite_count_all {
        favorite_count
      }
      dashboard_favorite_count_last_24h {
        favorite_count
      }
      dashboard_favorite_count_last_7d {
        favorite_count
      }
      dashboard_favorite_count_last_30d {
        favorite_count
      }
    }
  }
`;
