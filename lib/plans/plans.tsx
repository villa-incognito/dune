import { EmojiName } from "gui/emoji";

export const formattedPlanName = (planName: string): string => {
  switch (planName) {
    case "community":
      return "Free";
    case "analyzooor":
      return "Analyzooor";
    case "thug_life":
      return "Thug Life";
    case "elite":
      return "Elite";
    case "pro":
      return "Pro";

    // Api plans
    case "free_lunch":
      return "Free Lunch";
    case "fix_it":
      return "Fix It";
    case "starter_pack":
      return "Starter Pack";

    // New paid plans
    case "free":
      return "Free";
    case "plus":
      return "Plus";
    case "premium":
      return "Premium";

    default:
      return "Custom";
  }
};

export const emojiMapping = (planName: string): EmojiName => {
  switch (planName) {
    case "community":
      return "community";
    case "starter_pack":
    case "analyzooor":
      return "brain";
    case "fix_it":
    case "thug_life":
      return "thugLife";
    case "elite":
      return "ninja";
    case "pro":
      return "dizzy";
    // We assume that all plans not specified above are enterprise plans.
    default:
      return "briefcase";
  }
};

export const formattedPerformance = (performance: string): string => {
  switch (performance) {
    case "standard":
      return "Normal (1x)";
    case "medium":
      return "Fast (~2x)";
    case "high":
      return "Faster (~4x)";
    case "very_high":
      return "Fastest (~8x)";
    default:
      return performance;
  }
};
