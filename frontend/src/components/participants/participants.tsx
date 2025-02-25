type ParticipantsProps = {
  users: string[];
};

export default function Participants({ users }: ParticipantsProps) {
  return (
    <div className="fixed top-16 left-0 h-[calc(100vh-4rem)] w-80 bg-gray-900 text-white p-4 shadow-lg flex flex-col">
      <h2 className="text-lg font-bold mb-4">Participants ({users.length})</h2>
      <div className="flex flex-col gap-3 overflow-y-auto w-full">
        {users.map((user, index) => (
          <div key={index} className="flex items-center gap-3">
            {/* Avatar Placeholder */}
            <img src="https://placehold.co/40" alt="Avatar" className="w-10 h-10 rounded-full" />
            <span>{user}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
