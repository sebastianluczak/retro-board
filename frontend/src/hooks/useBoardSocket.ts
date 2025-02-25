import { useState, useEffect } from "react";
import { socket } from "@/app/socket";
import { ColumnRow } from "@/components/room/room";

export function useBoardSocket() {
  const [columns, setColumns] = useState<ColumnRow[]>([]);
  const [participants, setParticipants] = useState<string[]>([]);

  useEffect(() => {
    const handleColumnsUpdate = (updatedColumns: ColumnRow[]) => {
      setColumns(updatedColumns);
    };

    const handleParticipantsUpdate = (updatedParticipants: string[]) => {
      setParticipants(updatedParticipants);
    };

    socket.on("columnsUpdated", handleColumnsUpdate);
    socket.on("participantsUpdated", handleParticipantsUpdate);

    return () => {
      socket.off("columnsUpdated", handleColumnsUpdate);
      socket.off("participantsUpdated", handleParticipantsUpdate);
    };
  }, []);

  return { columns, setColumns, participants };
}
