import { useEffect, useState } from "react";
import Image from "next/image";
import toast, { Themes } from "react-simple-toasts";
import 'react-simple-toasts/dist/theme/failure.css';

export type Participant = {
  name: string;
  isAdminOfBoard: boolean;
};

type ParticipantsProps = {
  users: Participant[];
};

async function hash(value: Participant) {
  const utf8 = new TextEncoder().encode(value.name.toLowerCase().trim());
  const hashBuffer = await crypto.subtle.digest("SHA-256", utf8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray
    .map((bytes) => bytes.toString(16).padStart(2, "0"))
    .join("");
}

export default function Participants({ users }: ParticipantsProps) {
  const [hashes, setHashes] = useState<Record<string, string>>({});

  useEffect(() => {
    const computeHashes = async () => {
      const entries = await Promise.all(
        users.map(async (user) => [user.name, await hash(user)])
      );
      setHashes(Object.fromEntries(entries));
    };

    void computeHashes();
  }, [users]);

  return (
    <div className="fixed top-16 left-0 w-full bg-gray-900 text-white p-4 shadow-lg flex flex-row items-center">
      <div className={"font-bold text-center"}>Online ({users.length})</div>
      <div className="flex gap-3 overflow-x-auto w-full">
        {users.map((user, index) => (
          <div key={index} className="flex items-center gap-3" title={user.name}>
            {hashes[user.name] ? (
              <Image
                src={`https://gravatar.com/avatar/${hashes[user.name]}?d=initials`}
                alt={user.name}
                className="w-10 h-10 rounded-full"
                width={80}
                height={80}
              />
            ) : (
              <div className="w-10 h-10 bg-gray-700 rounded-full animate-pulse" />
            )}
          </div>
        ))}
        <div className={"flex-grow text-right items-center"}>
          <input
            type={"button"}
            value={"Logout"}
            className={"bg-red-700 shadow shadow-red-600 rounded p-2 text-center font-bold"}
            onClick={() => toast("Logout is not implemented, yet.", {
              theme: Themes.FAILURE,
              clickClosable: true,
            })}
          />
        </div>
      </div>
    </div>
  );
}
