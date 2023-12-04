import User from '../interfaces/chat-user.interface';
import GameSessionUser from '../interfaces/game-session-user.interface';
import UserData from '../interfaces/user-data.interface';
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

/**
 * Returns a boolean indicating whether the user with the given ID is player 1 in the game session.
 * @param players - An array of GameSessionUser objects representing the players in the game session.
 * @param userId - The ID of the user to check.
 * @returns A boolean indicating whether the user with the given ID is player 1 in the game session.
 */
export function getIsPlayer1(
  players: GameSessionUser[],
  userId: number,
): boolean {
  const playerIndex: number = players?.findIndex(
    (player: any) => player?.intraId === userId,
  );

  return playerIndex === 0;
}

/**
 * Creates a new direct message between two users.
 * @param {Object} params - The parameters for creating a new direct message.
 * @param {UserData} params.userData - The data of the user sending the message.
 * @param {User} params.selectedUser - The data of the user receiving the message.
 * @param {string} params.contentText - The content of the message.
 * @returns {Object} The newly created direct message, containing the IDs of the sender and receiver, the sender's name and avatar, the content of the message, and the timestamp.
 */
export function createNewDirectMessage({
  userData,
  selectedUser,
  contentText,
}: {
  userData: UserData;
  selectedUser: User;
  contentText: string;
}) {
  return {
    id:
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15),
    senderIntraId: userData.intraId || 0,
    receiverIntraId: selectedUser.intraId || 0,
    senderName: userData.username || 'Anonymous',
    senderAvatar: userData.avatar || 'Anonymous',
    content: contentText,
    timestamp: new Date().toString(),
  };
}

export function patchChannelPassword(
  channelName: string,
  ownerIntraId: number,
  password: string | null,
): void {
  if (channelName && ownerIntraId) {
    console.log('channelName:', channelName);
    console.log('ownerIntraId:', ownerIntraId);
    fetchAuthorized(`${getBaseUrl()}/chat/${channelName}/updatePassword`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Cookies.get('token')}`,
      },
      body: JSON.stringify({
        ownerIntra: {
          ownerIntra: ownerIntraId,
          password: password
        }
      }),
    });
  }
}

export function patchMuteUser(
  channelName: string,
  mutedIntraId: number,
  ownerIntraId: number,
  isMuted: number
): void {
  if (channelName && mutedIntraId && ownerIntraId) {
    console.log('channelName:', channelName);
    console.log('mutedIntraId:', mutedIntraId);
    fetchAuthorized(`${getBaseUrl()}/chat/${channelName}/${mutedIntraId}/${isMuted}/setMute`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Cookies.get('token')}`,
      },
      body: JSON.stringify({
        ownerIntra: {
          ownerIntra: ownerIntraId
        }
      }),
    });
  }
}

export function setAdminIntra(
  channelName: string,
  adminIntraId: number,
  ownerIntraId: number,
  isAdmin: number
): void {
  if (channelName && adminIntraId && ownerIntraId) {
    console.log('channelName:', channelName);
    console.log('adminIntraId:', adminIntraId);
    console.log('ownerIntraId:', ownerIntraId);
    fetchAuthorized(`${getBaseUrl()}/chat/${channelName}/${adminIntraId}/${isAdmin}/setAdmin`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Cookies.get('token')}`,
      },
      body: JSON.stringify({
        ownerIntra: {
          ownerIntra: ownerIntraId
        }
      }),
    });
  }
}

export async function patchBlockUser(
  userIntraId: number,
  blockIntraId: number,
  isBlocked: number
): Promise<number> {
  if (userIntraId && blockIntraId) {
    console.log('userIntraId:', userIntraId);
    console.log('blockIntraId:', blockIntraId);
    console.log('isBlocked:', isBlocked);
    const response = await fetchAuthorized(`${getBaseUrl()}/chat/${userIntraId}/${blockIntraId}/${isBlocked}/blockUser`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Cookies.get('token')}`,
      }
    });
    return response.status;
  }
  return 0;
}