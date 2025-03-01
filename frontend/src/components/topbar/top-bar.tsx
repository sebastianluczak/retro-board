import { UserIcon, Clock1Icon } from 'lucide-react';

type TopBarProps = {
  username?: string;
  loggedIn: boolean;
  timer?: { secondsLeft: number; isRunning: boolean } | null;
}

export default function TopBar(props: TopBarProps) {
  const { username, loggedIn, timer } = props;

  return (
    <div className="absolute top-0 left-0 w-full p-4 flex justify-between bg-gray-800 text-white shadow-md">
      <h1 className="font-extrabold">μRetro</h1>

      {timer && timer.secondsLeft > 0 && (
        <span className="flex items-center gap-2 rounded text-gray-200 shadow shadow-gray-900">
          <Clock1Icon className="w-5 h-5" />
          {timer.secondsLeft} seconds left
        </span>
      )}
      {username && loggedIn && (
        <span className="flex items-center gap-2 rounded text-gray-200 shadow shadow-gray-900">
          <UserIcon className="w-5 h-5" />
          {username}
        </span>
      )}
    </div>
  );
}
