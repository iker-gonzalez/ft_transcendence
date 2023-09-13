/**
 * Depending if the current hostname is localhost or not (e.g. a GitHub Codespace), it returns the correct base url to use in API calls.
 * @returns the computed base url of the api
 */

export function getBaseUrl(): string {
  const apiPort: string = process.env.REACT_APP_API_PORT || "3000";
  const clientPort: string = process.env.REACT_APP_CLIENT_PORT || "4200";

  return window.location.hostname === "localhost"
    ? `http://localhost:${apiPort}`
    : `https://${window.location.hostname.replace(apiPort, clientPort)}`;
}

export function getRedirectUri(): string {
  const apiPort: string = process.env.REACT_APP_API_PORT || "3000";
  const clientPort: string = process.env.REACT_APP_CLIENT_PORT || "4200";

  return window.location.hostname === "localhost"
    ? `http://localhost:${apiPort}/profile`
    : `https://${window.location.hostname.replace(apiPort, clientPort)}/profile`;
}
