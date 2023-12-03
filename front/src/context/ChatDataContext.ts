import { fetchAuthorized, getBaseUrl } from '../utils/utils';
import Cookies from 'js-cookie';
import { useUserData } from './UserDataContext';
import User from '../interfaces/chat-user.interface';
import Group from '../interfaces/chat-group.interface';
import { getIntraIdFromUsername, getUsernameFromIntraId } from '../utils/utils';

export const useChatData = () => {
  const { userData } = useUserData();

  const fetchDirectMessageUsers = async () => {
    const response = await fetchAuthorized(
      `${getBaseUrl()}/chat/${userData?.intraId}/DM`,
      {
        headers: {
          Authorization: `Bearer ${Cookies.get('token')}`,
        },
      },
    );
    const data = await response.json();
    const users = data.map((item: User) => {
      return {
        intraId: item.intraId,
        avatar: item.avatar,
        username: item.username,
      };
    });
    return users;
  };

  const fetchUserGroups = async () => {
    const response = await fetchAuthorized(
      `${getBaseUrl()}/chat/${userData?.intraId}/CM`,
      {
        headers: {
          Authorization: `Bearer ${Cookies.get('token')}`,
        },
      },
    );
    const data: Group[] = await response.json();
    const groups = data.map((item) => {
      return {
        id: item.id,
        name: item.name,
        type: item.type,
      };
    });
    return groups;
  };

  const fetchAllGroups = async () => {
    const response = await fetchAuthorized(
      `${getBaseUrl()}/chat/allExistingChannel`,
      {
        headers: {
          Authorization: `Bearer ${Cookies.get('token')}`,
        },
      },
    );
    const data: Group[] = await response.json();
    const allGroups = data.map((item) => {
      return {
        id: item.id,
        name: item.name,
        type: item.type,
      };
    });
    return allGroups;
  };

  return { fetchDirectMessageUsers, fetchUserGroups, fetchAllGroups };
};

export const useMessageData = () => {
  const { userData } = useUserData();

  const fetchUserMessages = async (user: User) => {
    const userIntraId = getIntraIdFromUsername(user.username); //temporary until endpoint is fixed
    const response = await fetchAuthorized(
      `${getBaseUrl()}/chat/${userData?.intraId}/${userIntraId}/DM`,
      /* temporary until endpoint is fixed */ {
        headers: {
          Authorization: `Bearer ${Cookies.get('token')}`,
        },
      },
    );
    const data = await response.json();
    return data;
  };

  const fetchGroupMessages = async (group: Group) => {
    const response = await fetchAuthorized(
      `${getBaseUrl()}/chat/${group.name}/allChannel`,
      /* temporary until endpoint is fixed */ {
        headers: {
          Authorization: `Bearer ${Cookies.get('token')}`,
        },
      },
    );
    const data = await response.json();
    return data;
  };

  return { fetchUserMessages, fetchGroupMessages };
};

export const useChannelData = () => {
  const fetchChannelData = async (group: string) => {
    const response = await fetchAuthorized(
      `${getBaseUrl()}/chat/${group}/allChannel`,
      /* temporary until endpoint is fixed */ {
        headers: {
          Authorization: `Bearer ${Cookies.get('token')}`, //only returns messages from the user to see if group message rendering improves
        },
      },
    );
    const data = await response.json();
    console.log('datafromChannel:', data);
    return data;
  };

  return { fetchChannelData };
}


