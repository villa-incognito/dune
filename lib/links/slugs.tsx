import slugify from "slugify";
import unidecode from "unidecode";

export const generateSlug = (phrase: string): string => {
  return slugify(unidecode(phrase), {
    lower: true,
    // Remove special characters as a slug must only be composed of
    // alphanumerical characters and `-`s.
    remove: /[_*+~.()'"!:@]/g,
  });
};

export const validateSlug = (slug: string): boolean => {
  // A valid slug is:
  //   - an optional sequence of characters followed by a '-' (dash) that can be repeated,
  //     followed by,
  //   - a mandatory sequence of 1 or more characters
  const slugPattern = new RegExp("^([a-z0-9]+-)*[a-z0-9]+$");

  return slugPattern.test(slug);
};

export const generateTeamHandleSlug = (phrase: string): string => {
  return slugify(unidecode(phrase), {
    lower: true,
    // Remove special characters as a slug must only be composed of
    // alphanumerical characters, `-` and `_`s.
    remove: /[*+~.()'"!:@]/g,
  });
};

export const validateTeamHandleSlug = (slug: string): boolean => {
  // A valid slug is:
  //   - an optional sequence of characters followed by an `_` (underscore) or `-` (dash) that can be repeated,
  //     followed by,
  //   - a mandatory sequence of 1 or more characters
  const slugPattern = new RegExp("^([a-z0-9]+[-_])*[a-z0-9]+$");

  return slugPattern.test(slug);
};
