/* eslint @typescript-eslint/strict-boolean-expressions: off */

import React from "react";
import { useActiveContext } from "shared/ContextSwitcher/store";
import { IconRocketLaunch } from "components/Icons/IconRocketLaunch";
import { Banner } from "../Banner/Banner";

export const MigrationBanner = () => {
  const activeContext = useActiveContext();
  return (
    <Banner>
      <IconRocketLaunch />
      Welcome to your new {activeContext?.name} plan! Start accessing premium
      features and enjoy a more powerful Dune experience.
    </Banner>
  );
};
