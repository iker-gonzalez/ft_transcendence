import ProfileIcon from '../../assets/svg/profile-icon.svg';
import PlayIcon from '../../assets/svg/play-icon.svg';
import StatsIcon from '../../assets/svg/stats-icon.svg';
import ChatIcon from '../../assets/svg/chat-icon.svg';
import LeaderboardIcon from '../../assets/svg/leaderboard-icon.svg';

export const NAVIGATION_LINKS: {
  to: string;
  isPermanent: boolean;
  icon: string;
  text: string;
  id: string;
}[] = [
  {
    to: '/profile',
    isPermanent: false,
    icon: ProfileIcon,
    text: 'Profile',
    id: 'profile',
  },
  {
    to: '/game',
    isPermanent: false,
    icon: PlayIcon,
    text: 'Play',
    id: 'game',
  },
  {
    to: '/chat',
    isPermanent: false,
    icon: ChatIcon,
    text: 'Chat',
    id: 'chat',
  },
  {
    to: '/stats',
    isPermanent: false,
    icon: StatsIcon,
    text: 'Stats',
    id: 'stats',
  },
  {
    to: '/leaderboard',
    isPermanent: true,
    icon: LeaderboardIcon,
    text: 'Leaderboard',
    id: 'leader',
  },
];
