import { fetchAuthorized, getBaseUrl } from '../utils/utils';
import Cookies from 'js-cookie';
import { useUserData } from './UserDataContext';
import User from '../interfaces/chat-user.interface';
import Group from '../interfaces/chat-group.interface';
import UserData from '../interfaces/user-data.interface';

export const useChatData = () => {
  const { userData } = useUserData();

  const fetchPrivateChats = async () => {
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

  return { fetchPrivateChats, fetchUserGroups, fetchAllGroups };
};
