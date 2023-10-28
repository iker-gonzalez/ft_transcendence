import UserStatus from '../interfaces/user-status.interface';
import Cookies from 'js-cookie';

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

/**
 * Makes an authorized fetch request to the specified URL.
 * @param input The URL or Request object to fetch data from.
 * @param init The options to use for the fetch request.
 * @returns A Promise that resolves to the response object.
 */
export async function fetchAuthorized(
  input: RequestInfo | URL,
  init?: RequestInit | undefined,
): Promise<Response> {
  const res: Response = await fetch(input, init);

  if (res.status === 401) {
    window.location.replace('/');
  }

  return res;
}

/**
 * Formats a given number of milliseconds into a string representation of minutes and seconds.
 * @param ms - The number of milliseconds to format.
 * @returns A string representation of the given milliseconds.
 */
export function formatMsToFullTime(ms: number): string {
  const date = new Date(ms);
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  return `${minutes ? minutes + 'm ' : ''} ${seconds ? seconds + 's' : ''}`;
}

/**
 * Updates the status of the current user.
 * @param status The new status of the user.
 * @returns void
 */
export function patchUserStatus(status: UserStatus): void {
  fetchAuthorized(`${getBaseUrl()}/user/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${Cookies.get('token')}`,
    },
    body: JSON.stringify({
      status,
    }),
  });
}
