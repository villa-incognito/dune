import Page, {
  Props as PageProps,
} from "gui/BrowseDashboardsPage/BrowseDashboardsPage";
import type { GetStaticProps } from "next";

import { fetchTags } from "lib/tags/tags";
import {
  getListBrowseDashboardsToPopulateCache,
  usePopulateListBrowseDashboardsCache,
  ListBrowseDashboardsCacheDataItem,
} from "gui/BrowseDashboardsPage/api/cacheListBrowseDashboards";

interface Props extends PageProps {
  listBrowseDashboardsCacheData: ListBrowseDashboardsCacheDataItem[];
  expiresAt: number;
}

export default function PagesBrowseDashboards(props: Props) {
  const { listBrowseDashboardsCacheData, expiresAt, ...pageProps } = props;

  usePopulateListBrowseDashboardsCache(listBrowseDashboardsCacheData, {
    expiresAt,
  });

  return <Page {...pageProps} />;
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const [tags, listBrowseDashboardsCacheData] = await Promise.all([
    // `tags`
    fetchTags("dashboards", 20, 0),

    // `listBrowseDashboardsCacheData`
    Promise.all([
      getListBrowseDashboardsToPopulateCache({
        order: { by: "trending", time_range: "4h" },
        filter: { freetext: "" },
        page: 1,
        pageSize: 20,
      }),
    ]),
  ]);

  return {
    props: {
      tags,
      listBrowseDashboardsCacheData,
      expiresAt: Date.now() + 2.5 * 60 * 1000, // Expires after 2.5 minutes (ok if it's a little stale)
    },
    revalidate: 2 * 60, // 2 minute cache
  };
};
