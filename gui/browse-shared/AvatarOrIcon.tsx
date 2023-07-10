import { Avatar } from "gui/avatar/avatar";
import { Icon } from "gui/icon/icon";
import Link from "next/link";

interface Props {
  handle: string;
  href: string;
  resource: "dashboard" | "terminal";
  origin?: "creations";
  profile_image_url?: string;
}

export function AvatarOrIcon(props: Props) {
  const { handle, href, resource, origin, profile_image_url } = props;
  return (
    <>
      {origin === "creations" ? (
        <Link href={href}>
          <a>
            <Icon icon={resource} />
          </a>
        </Link>
      ) : (
        <Link href={`/${handle}`}>
          <a>
            <Avatar src={profile_image_url} alt={handle} size={25} />
          </a>
        </Link>
      )}
    </>
  );
}
