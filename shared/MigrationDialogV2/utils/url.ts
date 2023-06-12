export function getSubscribeUrl(handle: string, planName: string) {
  return `/t/${handle}/subscribe/${planName}?migrate=1`;
}

export function getNewTeamUrl(planName: string) {
  return `/teams/new/${planName}`;
}
