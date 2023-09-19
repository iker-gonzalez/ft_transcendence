/**
 * Depending on whether the current hostname is localhost or not (e.g., a GitHub Codespace),
 * it returns the correct base URL to use in API calls with an optional relative path.
 * @param relativePath - The relative path to append to the URL (optional).
 * @returns the computed URL.
 */

export function getUrlWithRelativePath(relativePath: string = ""): string {
  const apiPort: string = process.env.REACT_APP_API_PORT || "3000";
  const clientPort: string = process.env.REACT_APP_CLIENT_PORT || "4200";
  const baseUrl = window.location.hostname === "localhost"
    ? `http://localhost:${apiPort}`
    : `https://${window.location.hostname.replace(clientPort, apiPort)}`;

  return baseUrl + (relativePath ? `/${relativePath}` : "");
}

export function getRedirectUri() {
  const endpoint = 'https://api.intra.42.fr/oauth/authorize';
  const redirectUri = window.location.hostname === "localhost"
    ? `${endpoint}?client_id=${process.env.REACT_APP_INTRA_CLIENT_ID}&redirect_uri=http%3A%2F%2Flocalhost%3A4200%2Flogin&response_type=code`
    : `${endpoint}?client_id=${process.env.REACT_APP_INTRA_CLIENT_ID}&redirect_uri=${process.env.REACT_APP_INTRA_AUTH_REDIRECT_URI}&response_type=code`;

  return redirectUri;
}
