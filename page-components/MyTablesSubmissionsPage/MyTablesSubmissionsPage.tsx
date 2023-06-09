import { FC } from "react";
import cn from "classnames";
import Link from "next/link";
import { useRouter } from "next/router";

import browsePageStyles from "gui/BrowseDashboardsPage/BrowsePage.module.css";
import styles from "./MyTablesSubmissionsPage.module.css";

import { useUploadedTablesQuery } from "lib/types/graphql";
import { useSession } from "gui/session/session";
import { useIsFeatureEnabled } from "lib/hooks/useIsFeatureEnabled";
import { useDebouncedEffect } from "lib/hooks/use-debounced-effect";

import { BrowseSubNav } from "gui/browse-shared/sub-nav";
import { PageHead } from "gui/head/head";
import { Header } from "shared/Header/Header";
import { UploadedTablesList } from "./UploadedTablesList";
import { LoadingPage } from "gui/loading/page";

export const MyTablesSubmissionPage: FC = () => {
  const session = useSession();
  const router = useRouter();
  const dataUploadEnabled = useIsFeatureEnabled("data-upload-v1");

  const { data } = useUploadedTablesQuery({
    context: { session },
    fetchPolicy: "cache-first",
    skip: !dataUploadEnabled,
  });
  const uploadedTables = data?.uploaded_tables ?? [];

  useDebouncedEffect(
    { delayMs: 3000 },
    () => {
      if (!dataUploadEnabled) {
        router.replace("/");
      }
    },
    [dataUploadEnabled, router]
  );

  if (!dataUploadEnabled) {
    return <LoadingPage />;
  }

  return (
    <>
      <PageHead title="My tables" />
      <div className={browsePageStyles.page}>
        <Header />
        <main>
          <BrowseSubNav filter="authored" className={browsePageStyles.subNav} />

          <section className={browsePageStyles.results}>
            <UploadedTablesList uploadedTables={uploadedTables} />
          </section>
          <section className={cn(browsePageStyles.disclaimer, styles.message)}>
            <p>
              Visit{" "}
              <Link href="/data/upload">
                <a>this link</a>
              </Link>{" "}
              to upload a new table.
            </p>
          </section>
        </main>
      </div>
    </>
  );
};
