import * as Menu from "components/MenuPanel/MenuPanel";
import { useListFolders } from "../ListFolders/useListFolders";
import { Badge } from "components/Badge/Badge";
import { getBadgeColor, getIcon } from "../CreateFolder/themeOptions";
import { useMoveContent } from "../AddContent/useMoveContent";
import { Folder } from "../FolderPage/ThreeDotsMenu/FolderType";
import { addToastNotification } from "shared/Toasts/toastNotificationStore";
import { useAnalytics } from "gui/analytics/analytics";
import { SessionWithUser } from "lib/users/types";
import { IconFolder } from "components/Icons/IconFolder";

interface Props {
  session: SessionWithUser;
  contentItem: {
    type: "query" | "dashboard";
    id: number;
  };
  isCreations: boolean;
  currentFolderName?: string;
  refetch?: () => Promise<void> | void;
}

export function MoveToFolder(props: Props) {
  const {
    session,
    contentItem: { type, id },
    isCreations,
    currentFolderName,
    refetch,
  } = props;

  const results = useListFolders(session);
  const folders = results.data?.get_folders.results;
  const [moveContent] = useMoveContent();
  const { captureEvent } = useAnalytics();

  if (results === undefined || folders === undefined) {
    return null;
  }

  const onMoveContent = (folder?: Folder) => {
    moveContent(session, {
      selectedDashboards: type === "dashboard" ? [id] : [],
      selectedQueries: type === "query" ? [id] : [],
      folderId: folder?.id,
    })
      .then(() => {
        addToastNotification({
          level: "success",
          title: `${type === "dashboard" ? `Dashboard` : `Query`} moved to ${
            folder !== undefined ? folder.name : "Creations"
          }`,
        });
        captureEvent("Content added to folder", {
          folder_id: folder !== undefined ? folder.id : "Creations",
        });
        {
          refetch && refetch();
        }
      })
      .catch((err) => {
        addToastNotification({
          level: "error",
          title: err.message,
        });
      });
  };

  return (
    <Menu.Panel>
      <Menu.Section title="Move to">
        {!isCreations && (
          <Menu.ItemButton onClick={() => onMoveContent()}>
            <Badge size="M" variant="filled" color="neutral" iconOnly>
              <IconFolder />
            </Badge>
            Creations
          </Menu.ItemButton>
        )}

        {folders
          .filter((f) => f.name !== currentFolderName)
          .map((folder) => (
            <Menu.ItemButton
              onClick={() => {
                onMoveContent(folder);
              }}
            >
              <Badge
                size={"M"}
                variant="filled"
                color={getBadgeColor(folder.color)}
                iconOnly
              >
                {getIcon(folder.icon)}
              </Badge>
              {folder.name}
            </Menu.ItemButton>
          ))}
      </Menu.Section>
    </Menu.Panel>
  );
}
