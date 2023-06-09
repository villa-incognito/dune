import markdownIt from "markdown-it";
import markdownItReplaceLink from "markdown-it-replace-link";
import { logger } from "lib/logger/browser";
import { isDeniedLink } from "lib/html/html";

interface Token {
  tag: string;
  attrs: string[2][];
}

export const renderMarkdown = (raw: string, validateLinks = true) => {
  return validateLinks
    ? parserWithLinkValidation.render(raw)
    : parser.render(raw);
};

// A helper that removes href attrs with disallowed values.
const replaceLink = (link: string, env: unknown, token: Token) => {
  if (token.tag === "a" && isDeniedLink(link)) {
    logger.debug("removed disallowed link:", link);
    token.attrs = [];
  }

  return link;
};

// Create a markdown parser that allows all links.
const parser = markdownIt({
  typographer: false,
  linkify: true,
  html: false,
});

// Create a markdown parser that removes disallowed links.
const parserWithLinkValidation = markdownIt({
  typographer: false,
  linkify: false,
  html: false,
}).use(markdownItReplaceLink, { replaceLink });
