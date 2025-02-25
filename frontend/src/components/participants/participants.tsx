type ParticipantsProps = {
  users: string[];
}

export default function Participants(props: ParticipantsProps) {
  const { users } = props;
  return (
    <div className={""}>
      <span>Participants <b>({users.length})</b>: {users.join(', ')}</span>
    </div>
  );
}