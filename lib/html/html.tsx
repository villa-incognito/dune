import sanitizeHtml from "sanitize-html";
import { IOptions } from "sanitize-html";

export const sanitizeHTML = (value: string) => {
  return sanitizeHtml(value, sanitizerOptions);
};

export const isDeniedLink = (url: string) => {
  return deniedLinks.some((p) => p.test(url));
};

const sanitizerOptions: IOptions = {
  allowedTags: ["a"],
  allowedSchemes: ["https"],
  allowedAttributes: { a: ["href", "target"] },

  exclusiveFilter: (frame) => {
    return frame.tag === "a" && isDeniedLink(frame.attribs.href);
  },
};

const deniedLinks = [new RegExp("^https://([a-z0-9]+[.])*flipsidecrypto.com")];
