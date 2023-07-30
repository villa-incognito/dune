export function minDelay(fn: () => Promise<unknown>, minDelay: number) {
  const minDelayPromise = new Promise((res) =>
    setTimeout(() => res(undefined), minDelay)
  );
  return Promise.all([minDelayPromise, fn()]).then((result) => result[1]);
}
