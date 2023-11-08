import React, { useEffect, useState } from 'react';
import { fetchAuthorized, getBaseUrl } from '../../utils/utils';
import Cookies from 'js-cookie';
import UserStatus from '../../interfaces/user-status.interface';
import { sm } from '../../constants/styles';

type UserStatusInfoProps = {
  intraId?: number;
};

const UserStatusInfo: React.FC<UserStatusInfoProps> = ({
  intraId,
}): JSX.Element => {
  const [statusInfo, setStatusInfo] = useState<{
    status: string;
    icon: string;
  } | null>(null);

  useEffect(() => {
    fetchAuthorized(
      `${getBaseUrl()}/user/status${intraId ? `/${intraId}` : ``}`,
      {
        headers: {
          Authorization: `Bearer ${Cookies.get('token')}`,
        },
      },
    )
      .then((res: any) => {
        return res.json();
      })
      .then((data: any) => {
        setStatusInfo(localizedStatusInfo(data.data.status));
      })
      .catch((e: any) => {
        setStatusInfo(null);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const localizedStatusInfo = (
    status: string,
  ): {
    status: string;
    icon: string;
  } | null => {
    switch (status) {
      case UserStatus.OFFLINE:
        return { status: 'Offline', icon: '🔴' };
      case UserStatus.ONLINE:
        return { status: 'Online', icon: '🟢' };
      case UserStatus.PLAYING:
        return { status: 'In a game', icon: '🕹️' };
      default:
        return null;
    }
  };

  if (statusInfo) {
    return (
      <>
        {window.innerWidth > parseInt(sm) ? (
          <p>
            {statusInfo.status}{' '}
            <span aria-hidden="true">{statusInfo.icon}</span>
          </p>
        ) : (
          <p aria-label={statusInfo.status}>{statusInfo.icon}</p>
        )}
      </>
    );
  }

  return <></>;
};

export default UserStatusInfo;
