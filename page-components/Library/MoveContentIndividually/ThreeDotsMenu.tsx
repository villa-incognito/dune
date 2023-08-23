import styles from "shared/ContentList/ContentList.module.css";
import { MoveToFolder } from "page-components/Library/MoveContentIndividually/MoveToFolder";
import { ClickPopover } from "components/ClickPopover";
import { IconButton } from "components/Button/IconButton";
import { IconThreeDots } from "components/Icons/IconThreeDots";
import { useSessionWithUser } from "gui/session/session";
import { useRouter } from "next/router";

interface Props {
  contentItem: {
    type: "query" | "dashboard";
    id: number;
  };
  refetchFolderContent?: () => Promise<void> | void;
}

export function ThreeDotsMenu(props: Props) {
  const session = useSessionWithUser();
  const router = useRouter();
  const isLibrary = router.pathname.includes("/workspace/library");
  const isArchivedFolder = router.pathname.includes(
    "/workspace/library/archived"
  );
  const folderName = router.query.name;

  if (
    !session ||
    isArchivedFolder ||
    !isLibrary ||
    (folderName !== undefined && typeof folderName !== "string")
  ) {
    return null;
  }

  return (
    <div className={styles.threeDotMenu}>
      <ClickPopover
        content={() => (
          <MoveToFolder
            contentItem={props.contentItem}
            refetch={props.refetchFolderContent}
            isCreations={router.pathname.includes(
              "workspace/library/creations"
            )}
            currentFolderName={folderName}
            session={session}
          />
        )}
        position="below-align-right"
        closeOnClickOutside={true}
      >
        <IconButton theme="tertiary" size="XS">
          <IconThreeDots />
        </IconButton>
      </ClickPopover>
    </div>
  );
}
