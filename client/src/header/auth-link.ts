export function getAuthURL(pathname: string, appendNext: boolean = true) {
  let next = window.location.pathname
  let prefix = ''

  // When doing local development with Yari, the link to authenticate in Kuma
  // needs to be absolute. And we also need to send the absolute URL as the
  // `next` query string parameter so Kuma sends us back when the user has
  // authenticated there.
  if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_KUMA_HOST) {
    next = window.location.href
    prefix = `http://${process.env.REACT_APP_KUMA_HOST}`
  }
  let url = `${prefix}${pathname}`
  if (appendNext) {
    const sp = new URLSearchParams()
    sp.set('next', next)
    url += `?${sp.toString()}`
  }
  return url
}
