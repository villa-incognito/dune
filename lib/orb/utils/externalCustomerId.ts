/*
 * On an Orb customer, `external_customer_id` should be either:
 *
 * - user_{user.id}
 * - team_{team.id}
 *
 * where user or team are in the Dune db
 */
export type ExternalCustomerId = string;

// ONLY USE WHEN CREATING CUSTOMER
// Until all customers are migrated from the old format (123) to the new (user_123),
// do not use the generated external_customer_id for lookups, as they different users
// will have ids on different formats. When creating, create users on the new format.
export function fromUserId(id: number): ExternalCustomerId {
  return `user_${id}`;
}

export function fromTeamId(id: number): ExternalCustomerId {
  return `team_${id}`;
}

export interface DuneEntity {
  type: "user" | "team";
  id: number;
}

export function parse(external_customer_id: ExternalCustomerId): DuneEntity {
  const parts = external_customer_id.split("_");
  const [type, idString] = parts;
  const id = Number(idString);

  if (parts.length !== 2) {
    throw Error(
      `Could not parse external_customer_id=${external_customer_id}, invalid format:` +
        // eslint-disable-next-line no-useless-escape
        ` Should match /^(user|team)_\d+$/ (e.g. user_69420).`
    );
  }

  if (!Number.isInteger(id)) {
    throw Error(
      `Could not parse external_customer_id=${external_customer_id}, invalid id=${idString}:` +
        ` Should be an integer`
    );
  }

  switch (type) {
    case "user":
    case "team":
      return { type, id };

    default:
      throw Error(
        `Could not parse external_customer_id=${external_customer_id}, invalid type=${type}:` +
          ` Should be "user" or "team"`
      );
  }
}

export function toUserId(external_customer_id: ExternalCustomerId) {
  const entity = parse(external_customer_id);

  if (entity.type !== "user") {
    throw Error(
      `external_customer_id=${external_customer_id} does not represent a Dune user`
    );
  }

  return entity.id;
}

export function toTeamId(external_customer_id: ExternalCustomerId) {
  const entity = parse(external_customer_id);

  if (entity.type !== "team") {
    throw Error(
      `external_customer_id=${external_customer_id} does not represent a Dune team`
    );
  }

  return entity.id;
}
