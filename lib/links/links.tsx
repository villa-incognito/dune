import { Entry } from "lib/entries/types";
import { frontend } from "lib/env/env";
import { isDashboard } from "lib/entries/entries";
import { isNonNullable } from "lib/types/types";

export const entryPath = (entry: Entry) => {
  return isDashboard(entry)
    ? dashboardPath(entry.owner.handle, entry.slug)
    : queryPath(entry.id);
};

export const dashboardPath = (user: string, slug: string, key?: string) => {
  return createPath(user, slug, key);
};

export const dashboardLink = (user: string, slug: string, key?: string) => {
  return createLink(user, slug, key);
};

export const queryPath = (query?: number, visual?: number) => {
  return createPath("queries", query, visual);
};

export const queryLink = (query: number, visual?: number) => {
  return createLink("queries", query, visual);
};

export const embedPath = (query: number, visual: number, key?: string) => {
  return createPath("embeds", query, visual, key);
};

export const embedLink = (query: number, visual: number, key?: string) => {
  return createLink("embeds", query, visual, key);
};

export const projectLink = (project: string) => {
  return createLink("projects", project);
};

export const userLink = (user: string) => {
  return createLink(user);
};

export const sanitizeRedirectLink = (link: string): string | undefined => {
  // Note this is a temporary check that can be removed when proper CSP's have been put in place
  // throw away anything that includes javascript
  if (link.toLowerCase().includes("javascript")) {
    return undefined;
    // Only redirect to pages on this domain
  } else if (!link.startsWith("/")) {
    return undefined;
  }
  return link;
};

const createLink = (...segments: (string | number | undefined)[]) => {
  return frontend() + createPath(...segments);
};

const createPath = (...segments: (string | number | undefined)[]) => {
  return "/" + segments.filter(isNonNullable).join("/");
};
