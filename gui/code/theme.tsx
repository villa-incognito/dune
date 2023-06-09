export type Theme = "dark" | "light";

export const defaultTheme: Theme = "dark";

export const getThemeOrDefault = (theme: string | null): Theme => {
  switch (theme) {
    case "light":
    case "dark":
      return theme;
    default:
      return defaultTheme;
  }
};
