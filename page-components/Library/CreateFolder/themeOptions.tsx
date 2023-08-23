import { IconConfetti } from "components/Icons/IconConfetti";
import { IconFactory } from "components/Icons/IconFactory";
import { IconFolder } from "components/Icons/IconFolder";
import { IconPlanet } from "components/Icons/IconPlanet";
import { IconRocketLaunch } from "components/Icons/IconRocketLaunch";
import { IconBird } from "components/Icons/IconBird";
import { IconBuildings } from "components/Icons/IconBuildings";
import { IconArchive } from "components/Icons/IconArchive";

export const COLOR_OPTIONS = [
  {
    value: "var(--feedback--accent--success)",
    displayName: "Green",
    label: "green",
  },
  {
    value: "var(--feedback--accent--warning)",
    displayName: "Yellow",
    label: "yellow",
  },
  {
    value: "var(--feedback--accent--error)",
    displayName: "Red",
    label: "red",
  },
  {
    value: "var(--feedback--accent--info)",
    displayName: "Light Blue",
    label: "blue-light",
  },
  {
    value: "var(--feedback--accent--neutral)",
    displayName: "Gray",
    label: "gray",
  },
  {
    value: "var(--feedback--accent--brand-orange)",
    displayName: "Orange",
    label: "orange",
  },
  {
    value: "var(--feedback--accent--brand-blue)",
    displayName: "Blue",
    label: "blue",
  },
];

export const ICON_OPTIONS = [
  {
    value: "folder",
    label: <IconFolder />,
  },

  {
    value: "confetti",
    label: <IconConfetti />,
  },

  {
    value: "factory",
    label: <IconFactory />,
  },
  {
    value: "buildings",
    label: <IconBuildings />,
  },
  {
    value: "bird",
    label: <IconBird />,
  },
  {
    value: "planet",
    label: <IconPlanet />,
  },
  {
    value: "rocketlaunch",
    label: <IconRocketLaunch />,
  },
  {
    value: "archive",
    label: <IconArchive />,
  },
];

export const getIcon = (icon: string) => {
  return (
    ICON_OPTIONS.find((option) => option.value === icon)?.label ?? (
      <IconFolder />
    )
  );
};

export const getColor = (color: string) => {
  return (
    COLOR_OPTIONS.find((option) => option.label === color)?.value ??
    "var(--feedback--accent--neutral)"
  );
};

export function getBadgeColor(color: string) {
  switch (color) {
    case "green":
      return "success";
    case "red":
      return "error";
    case "yellow":
      return "warning";
    case "blue-light":
      return "info";
    case "orange":
      return "brand-orange";
    case "blue":
      return "brand-blue";
    case "gray":
    default:
      return "neutral";
  }
}
