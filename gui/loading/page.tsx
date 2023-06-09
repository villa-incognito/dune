import { Header } from "shared/Header/Header";
import { Loading } from "gui/loading/loading";
import { PageMain } from "gui/page/page";
import { PageHead } from "gui/head/head";

export const LoadingPage: React.FC<{
  screenshot?: string;
  title?: string;
  description?: string;
}> = (props) => {
  return (
    <>
      <PageHead
        title={props.title !== "" ? props.title : "Dune"}
        description={props.description}
        screenshot={props.screenshot}
      />
      <Header />
      <PageMain size="md">
        <Loading />
      </PageMain>
    </>
  );
};
