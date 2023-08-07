import { useTeamRole } from "lib/teams/teams";
import { useActiveContext } from "../../ContextSwitcher/store";

export const useInviteRoleOptions = (): {
  role?: string;
  options: Array<{
    key: string;
    display: string;
  }>;
} => {
  const activeContext = useActiveContext();
  const { role } = useTeamRole(activeContext);
  const baseOptions = [
    { key: "viewer", display: "Viewer" },
    { key: "editor", display: "Editor" },
  ];

  switch (role) {
    case "admin":
      return {
        role,
        options: [...baseOptions, { key: "admin", display: "Admin" }],
      };
    case "editor": {
      return { role, options: baseOptions };
    }
    default:
      return { role, options: [] };
  }
};
