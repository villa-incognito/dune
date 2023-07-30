import { useRouter } from "next/router";

export function useSignupUrl() {
  const router = useRouter();
  const { asPath } = router;

  if (asPath.startsWith("/auth/")) {
    const { next } = router.query;

    return typeof next === "string"
      ? getSignupUrlWithNextUrl(next)
      : "/auth/register";
  }

  return getSignupUrlWithNextUrl(asPath);
}

function getSignupUrlWithNextUrl(nextUrl: string) {
  return nextUrl.length > 0
    ? `/auth/register?next=${encodeURIComponent(nextUrl)}`
    : "/auth/register";
}
