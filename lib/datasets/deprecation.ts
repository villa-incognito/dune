import type { Datasets } from "lib/types/graphql";

export function isDeprecated(dataset: Pick<Datasets, "name">) {
  return !dataset.name.includes("Dune SQL");
}

export function isEditingDisabled(dataset: Pick<Datasets, "name">) {
  return !dataset.name.includes("Dune SQL");
}

export function isExecutionDisabled(dataset: Pick<Datasets, "name">) {
  return !dataset.name.includes("Dune SQL");
}
