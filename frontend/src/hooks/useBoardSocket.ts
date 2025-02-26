import { useState, useEffect } from 'react';
import { socket } from '@/app/socket';
import { ColumnRow } from '@/components/room/room';
import { Participant } from '@/components/participants/participants';

export function useBoardSocket() {
  const [columns, setColumns] = useState<ColumnRow[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);

  useEffect(() => {
    const handleColumnsUpdate = (updatedColumns: ColumnRow[]) => {
      setColumns(updatedColumns);
      console.info('Columns updated', updatedColumns);
    };

    const handleParticipantsUpdate = (updatedParticipants: Participant[]) => {
      setParticipants(updatedParticipants);
    };

    socket.on('columnsUpdated', handleColumnsUpdate);
    socket.on('participantsUpdated', handleParticipantsUpdate);

    return () => {
      socket.off('columnsUpdated', handleColumnsUpdate);
      socket.off('participantsUpdated', handleParticipantsUpdate);
    };
  }, [participants]);

  return { columns, setColumns, participants };
}
