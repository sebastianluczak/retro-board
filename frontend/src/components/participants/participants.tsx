import { useEffect, useState } from "react";
import Image from "next/image";

type ParticipantsProps = {
  users: string[];
};

async function hash(value: string) {
  const utf8 = new TextEncoder().encode(value.toLowerCase().trim());
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
        users.map(async (user) => [user, await hash(user)])
      );
      setHashes(Object.fromEntries(entries));
    };

    computeHashes().then(r => { console.log("Hashes computed.", r) });
  }, [users]);

  return (
    <div className="fixed top-16 left-0 w-full bg-gray-900 text-white p-4 shadow-lg flex flex-row items-center">
      <div className={"font-bold text-center"}>Online ({users.length})</div>
      <div className="flex gap-3 overflow-x-auto w-full">
        {users.map((user, index) => (
          <div key={index} className="flex items-center gap-3" title={user}>
            {hashes[user] ? (
              <Image
                src={`https://gravatar.com/avatar/${hashes[user]}?d=initials`}
                alt={user}
                className="w-10 h-10 rounded-full"
                width={80}
                height={80}
              />
            ) : (
              <div className="w-10 h-10 bg-gray-700 rounded-full animate-pulse" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
