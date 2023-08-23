import { useRouter } from "next/router";

export function useLoginUrl() {
  const router = useRouter();
  const { asPath } = router;

  if (asPath.startsWith("/auth/")) {
    const { next } = router.query;

    return typeof next === "string"
      ? getLoginUrlWithNextUrl(next)
      : "/auth/login";
  }

  return getLoginUrlWithNextUrl(asPath);
}

export function getLoginUrlWithNextUrl(nextUrl: string) {
  return nextUrl.length > 0
    ? `/auth/login?next=${encodeURIComponent(nextUrl)}`
    : "/auth/login";
}
