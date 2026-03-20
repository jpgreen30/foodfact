export function proxyImg(url: string): string {
  return `/api/img?url=${encodeURIComponent(url)}`
}
