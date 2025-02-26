import { UserIcon } from 'lucide-react';

type TopBarProps = {
  username?: string;
  loggedIn: boolean;
}

export default function TopBar(props: TopBarProps) {
  const { username, loggedIn } = props;

  return (
    <div className="absolute top-0 left-0 w-full p-4 flex justify-between bg-gray-800 text-white shadow-md">
      <span className="font-bold">μRetro</span>
      {username && loggedIn && (
        <span className="flex items-center gap-2 rounded text-gray-200 shadow shadow-gray-900">
          <UserIcon className="w-5 h-5" />
          {username}
        </span>
      )}
    </div>
  );
}
