import React from "react";
import { AiOutlineAreaChart } from "react-icons/ai";
import { AiOutlineDotChart } from "react-icons/ai";
import { AiOutlineFileImage } from "react-icons/ai";
import { BiCog } from "react-icons/bi";
import { BiCube } from "react-icons/bi";
import {
  BsAlt,
  BsDash,
  BsExclamationCircle,
  BsEye,
  BsPeople,
  BsWallet,
} from "react-icons/bs";
import { BsArchive } from "react-icons/bs";
import { BsArrowDown } from "react-icons/bs";
import { BsArrowLeft } from "react-icons/bs";
import { BsArrowRepeat } from "react-icons/bs";
import { BsArrowRight } from "react-icons/bs";
import { BsArrowUp } from "react-icons/bs";
import { BsArrowDownRight } from "react-icons/bs";
import { BsArrowDownUp } from "react-icons/bs";
import { BsBarChart } from "react-icons/bs";
import { BsBarChartFill } from "react-icons/bs";
import { BsBook } from "react-icons/bs";
import { BsBookmark } from "react-icons/bs";
import { BsBoxArrowUpRight } from "react-icons/bs";
import { BsBuilding } from "react-icons/bs";
import { BsCalendar } from "react-icons/bs";
import { BsCaretDownFill } from "react-icons/bs";
import { BsCaretUpFill } from "react-icons/bs";
import { BsCaretRightFill } from "react-icons/bs";
import { BsChat } from "react-icons/bs";
import { BsChatSquareDots } from "react-icons/bs";
import { BsCheckCircle } from "react-icons/bs";
import { BsCheckCircleFill } from "react-icons/bs";
import { BsCheck2 } from "react-icons/bs";
import { BsChevronDoubleLeft } from "react-icons/bs";
import { BsChevronDoubleRight } from "react-icons/bs";
import { BsChevronDown } from "react-icons/bs";
import { BsChevronLeft } from "react-icons/bs";
import { BsChevronRight } from "react-icons/bs";
import { BsChevronUp } from "react-icons/bs";
import { BsCircle } from "react-icons/bs";
import { BsCircleFill } from "react-icons/bs";
import { BsClock } from "react-icons/bs";
import { BsCloudArrowUp } from "react-icons/bs";
import { BsCloudDownload } from "react-icons/bs";
import { BsCodeSlash } from "react-icons/bs";
import { BsCreditCard } from "react-icons/bs";
import { BsCursor } from "react-icons/bs";
import { BsEgg } from "react-icons/bs";
import { BsEnvelope } from "react-icons/bs";
import { BsExclamationDiamond } from "react-icons/bs";
import { BsExclamationTriangle } from "react-icons/bs";
import { BsFileText } from "react-icons/bs";
import { BsGear } from "react-icons/bs";
import { BsGraphUp } from "react-icons/bs";
import { BsGrid } from "react-icons/bs";
import { BsGridFill } from "react-icons/bs";
import { BsHouse } from "react-icons/bs";
import { BsInfoCircleFill } from "react-icons/bs";
import { BsInfoCircle } from "react-icons/bs";
import { BsKey } from "react-icons/bs";
import { BsLink45Deg } from "react-icons/bs";
import { BiLinkExternal } from "react-icons/bi";
import { BsList } from "react-icons/bs";
import { BsListNested } from "react-icons/bs";
import { BsListUl } from "react-icons/bs";
import { BsLock } from "react-icons/bs";
import { BsLockFill } from "react-icons/bs";
import { BsMoonFill } from "react-icons/bs";
import { BsPencil } from "react-icons/bs";
import { BsPerson } from "react-icons/bs";
import { BsPersonFill } from "react-icons/bs";
import { BsPieChart } from "react-icons/bs";
import { BsPlusCircle } from "react-icons/bs";
import { BsPlus } from "react-icons/bs";
import { BsQuestionCircle } from "react-icons/bs";
import { BsSearch } from "react-icons/bs";
import { BsShield } from "react-icons/bs";
import { BsStar } from "react-icons/bs";
import { BsStarFill } from "react-icons/bs";
import { BsFillSunFill } from "react-icons/bs";
import { BsTable } from "react-icons/bs";
import { BsTag } from "react-icons/bs";
import { BsTerminal } from "react-icons/bs";
import { BsTerminalFill } from "react-icons/bs";
import { BsTrash } from "react-icons/bs";
import { BsTrashFill } from "react-icons/bs";
import { BsThreeDots } from "react-icons/bs";
import { BsX } from "react-icons/bs";
import { FaHatWizard } from "react-icons/fa";
import { ImMagicWand } from "react-icons/im";
import { MdKeyboardArrowDown } from "react-icons/md";
import { RiFileCopyLine } from "react-icons/ri";
import { RiPlantLine } from "react-icons/ri";
import { RiTwitterLine } from "react-icons/ri";
import { FaEthereum } from "react-icons/fa";
import { HiOutlineMenu } from "react-icons/hi";

import { logger } from "lib/logger/browser";

export const Icon: React.FC<{
  icon: string;
  className?: string;
  "aria-label"?: string;
}> = (props) => {
  const icon = createIconComponent(props.icon);

  if (!icon) {
    return null;
  }

  const iconProps = {
    ...props,
    "aria-hidden": !props["aria-label"],
    alt: "",
  };

  return React.createElement(icon, iconProps);
};

// This switch must include the list of icon names in Sanity.
// https://github.com/duneanalytics/cms/blob/master/schemas/objects/icon.js
const createIconComponent = (icon: string) => {
  switch (icon) {
    case "archive":
      return BsArchive;
    case "area-chart":
      return AiOutlineAreaChart;
    case "keyboard-arrow-down":
      return MdKeyboardArrowDown;
    case "arrow-down":
      return BsArrowDown;
    case "arrow-down-right":
      return BsArrowDownRight;
    case "arrow-left":
      return BsArrowLeft;
    case "arrow-right":
      return BsArrowRight;
    case "arrow-up":
      return BsArrowUp;
    case "bar-chart":
      return BsBarChart;
    case "bar-chart-fill":
      return BsBarChartFill;
    case "book":
      return BsBook;
    case "bookmark":
      return BsBookmark;
    case "box-arrow-up-right":
      return BsBoxArrowUpRight;
    case "building":
      return BsBuilding;
    case "bullet-list":
      return BsListUl;
    case "calendar":
      return BsCalendar;
    case "caret-down-fill":
      return BsCaretDownFill;
    case "caret-right-fill":
      return BsCaretRightFill;
    case "caret-up-fill":
      return BsCaretUpFill;
    case "chat":
      return BsChat;
    case "check":
      return BsCheckCircle;
    case "check-filled":
      return BsCheckCircleFill;
    case "simple-check":
      return BsCheck2;
    case "chevron-double-left":
      return BsChevronDoubleLeft;
    case "chevron-double-right":
      return BsChevronDoubleRight;
    case "chevron-down":
      return BsChevronDown;
    case "chevron-left":
      return BsChevronLeft;
    case "chevron-right":
      return BsChevronRight;
    case "chevron-up":
      return BsChevronUp;
    case "circle":
      return BsCircle;
    case "circle-fill":
      return BsCircleFill;
    case "clock":
      return BsClock;
    case "cog":
      return BiCog;
    case "copy":
      return RiFileCopyLine;
    case "code-slash":
      return BsCodeSlash;
    case "credit-card":
      return BsCreditCard;
    case "cube":
      return BiCube;
    case "dashboard":
      return BsGrid;
    case "dashboard-fill":
      return BsGridFill;
    case "discord":
      return BsChatSquareDots;
    case "dots":
      return BsThreeDots;
    case "download":
      return BsCloudDownload;
    case "upload":
      return BsCloudArrowUp;
    case "edit":
      return BsPencil;
    case "egg":
      return BsEgg;
    case "ethereum":
      return FaEthereum;
    case "exclamation-circle":
      return BsExclamationCircle;
    case "eye":
      return BsEye;
    case "fork":
      return BsAlt;
    case "gear":
      return BsGear;
    case "home":
      return BsHouse;
    case "image":
      return AiOutlineFileImage;
    case "info-circle":
      return BsInfoCircleFill;
    case "info":
      return BsInfoCircle;
    case "key":
      return BsKey;
    case "list":
      return BsList;
    case "list-nested":
      return BsListNested;
    case "line-chart":
      return BsGraphUp;
    case "link":
      return BsLink45Deg;
    case "external-link":
      return BiLinkExternal;
    case "lock":
      return BsLock;
    case "lock-fill":
      return BsLockFill;
    case "mail":
      return BsEnvelope;
    case "menu":
      return HiOutlineMenu;
    case "moon-fill":
      return BsMoonFill;
    case "person":
      return BsPerson;
    case "person-fill":
      return BsPersonFill;
    case "people":
      return BsPeople;
    case "pie-chart":
      return BsPieChart;
    case "plus-circle":
      return BsPlusCircle;
    case "plus":
      return BsPlus;
    case "minus":
      return BsDash;
    case "query":
      return BsTerminal;
    case "question":
      return BsQuestionCircle;
    case "running":
      return BsArrowRepeat;
    case "scatter-chart":
      return AiOutlineDotChart;
    case "search":
      return BsSearch;
    case "shield":
      return BsShield;
    case "sort":
      return BsArrowDownUp;
    case "star":
      return BsStar;
    case "star-fill":
      return BsStarFill;
    case "sun-fill":
      return BsFillSunFill;
    case "telegram":
      return BsCursor;
    case "table":
      return BsTable;
    case "tag":
      return BsTag;
    case "terminal":
      return BsTerminal;
    case "terminal-fill":
      return BsTerminalFill;
    case "text":
      return BsFileText;
    case "trash":
      return BsTrash;
    case "trash-fill":
      return BsTrashFill;
    case "twitter":
      return RiTwitterLine;
    case "wallet":
      return BsWallet;
    case "wand":
      return ImMagicWand;
    case "warning":
      return BsExclamationDiamond;
    case "warning-triangle":
      return BsExclamationTriangle;
    case "wizard":
      return FaHatWizard;
    case "x":
      return BsX;
    case "plant":
      return RiPlantLine;
    default:
      logger.warn("unknown icon name:", icon);
      return null;
  }
};
