/**
 * Returns the base URL in the app depending on whether the current hostname is localhost or not (e.g., a GitHub Codespace),
 * @returns base URL
 */

export function getBaseUrl(): string {
  const apiPort: string = process.env.REACT_APP_API_PORT || '3000';
  const clientPort: string = process.env.REACT_APP_CLIENT_PORT || '4200';

  return window.location.hostname === 'localhost'
    ? `http://localhost:${apiPort}`
    : `https://${window.location.hostname.replace(clientPort, apiPort)}`;
}

/**
 * Capitalizes the first letter of a string.
 * @param string The string to capitalize.
 * @returns The capitalized string.
 */
export function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
