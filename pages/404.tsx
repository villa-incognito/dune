import { Center } from "gui/center/center";
import { Header } from "shared/Header/Header";
import { PageMain } from "gui/page/page";
import { PageHead } from "gui/head/head";

export const NotFoundPage: React.FC = () => {
  return (
    <>
      <PageHead title="404 Page Not Found" robots="noindex" />
      <Header />
      <PageMain size="md">
        <Center>404 Page Not Found or Private</Center>
      </PageMain>
    </>
  );
};

export default NotFoundPage;
