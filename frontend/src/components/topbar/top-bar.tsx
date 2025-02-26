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
        <span>Username: {username}</span>
      )}
    </div>
  );
}
