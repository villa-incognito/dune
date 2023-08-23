import styles from "gui/BrowseDashboardsPage/BrowsePage.module.css";

import { Header } from "shared/Header/Header";
import { PageHead } from "gui/head/head";
import { BrowseSubNav } from "gui/browse-shared/sub-nav";
import { Loading } from "gui/loading/loading";
import List from "gui/BrowseDashboardsPage/List/DashboardsList";
import { Empty } from "gui/empty/empty";
import Link from "next/link";
import { useLoginUrl } from "src/hooks/useLoginUrl";
import EmptyBecausePageIsOutOfBounds from "gui/browse-shared/EmptyBecausePageIsOutOfBounds";
import BrowsePagination, {
  usePaginationState,
} from "gui/browse-shared/BrowsePagination";
import Sidebar, {
  useFreetextFilterState,
  useOwnerState,
  useTagState,
  useOrderState,
} from "./Sidebar/BrowseDashboardsSidebar";

import { useMemo } from "react";
import useListBrowseDashboards from "./api/useListBrowseDashboards";
import { transformData, ApiParams } from "./api/listBrowseDashboards";
import { useSession } from "gui/session/session";

import type { Tag } from "lib/tags/types";

// State
interface Filter {
  freetext: string;
  owner?: {
    type: "user" | "team";
    handle: string;
  };
  tag?: string;
}

// Props
export interface Props {
  tags: Tag[];
}

export default function BrowseDashboardsPage(props: Props) {
  // Filter
  const { freetextFilterDebounced } = useFreetextFilterState();
  const [owner] = useOwnerState();
  const [tag] = useTagState();

  const filter = useMemo(
    (): Filter => ({
      freetext: freetextFilterDebounced,
      owner,
      tag,
    }),
    [freetextFilterDebounced, owner, tag]
  );

  // Order
  const [order] = useOrderState();

  // Pagination
  const [page] = usePaginationState();

  // Parameters to gql query
  const apiParams = useMemo(() => ({ filter, order, page, pageSize: 20 }), [
    filter,
    order,
    page,
  ]);

  const dashboardsResult = useListBrowseDashboards(apiParams);

  return (
    <>
      <PageHead title="Dashboards" />
      <div className={styles.page}>
        <Header />
        <main>
          <BrowseSubNav className={styles.subNav} />

          <section className={styles.results}>
            <Results
              dashboardsResult={dashboardsResult}
              pageSize={apiParams.pageSize}
              order={apiParams.order}
            />
          </section>

          <Sidebar tags={props.tags} freetextLabel="Search for dashboards" />
        </main>
      </div>
    </>
  );
}

function Results(props: {
  dashboardsResult: ReturnType<typeof useListBrowseDashboards>;
  pageSize: number;
  order: ApiParams["order"];
}) {
  const { dashboardsResult, pageSize } = props;
  const [page] = usePaginationState();

  if (dashboardsResult.error) {
    return <section>Error</section>;
  }
  if (dashboardsResult.data) {
    const data = transformData(dashboardsResult.data);

    if (data.total_count === 0) {
      return <NoResults />;
    }

    // Check if page from url is out of bounds.
    // Consider there to always be at least one page, even if it's empty.
    const lastPage = Math.max(1, Math.ceil(data.total_count / pageSize));

    if (page > lastPage) {
      return <EmptyBecausePageIsOutOfBounds lastPage={lastPage} />;
    }

    return (
      <>
        <List dashboards={data.dashboards} />

        <BrowsePagination pageSize={pageSize} totalCount={data.total_count} />
      </>
    );
  }
  if (dashboardsResult.loading) {
    return <Loading />;
  }
  // "idle": Not even started initial fetch
  return <Loading />;
}

function NoResults() {
  const session = useSession();
  const loginUrl = useLoginUrl();

  return (
    <Empty icon="circle-fill" title="No matching dashboards">
      <p>
        <Link href="/browse/queries" prefetch={false}>
          <a>Try searching for queries instead</a>
        </Link>
      </p>
      {!session && (
        <p>
          Or, <a href={loginUrl}>sign up to create your own dashboards</a>.
        </p>
      )}
    </Empty>
  );
}
