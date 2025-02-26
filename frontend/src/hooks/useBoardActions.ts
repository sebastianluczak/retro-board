import { Card } from "@/components/board/column";
import { socket } from "@/app/socket";
import { ColumnRow } from "@/components/room/room";

export function useBoardActions(
  boardName: string,
  username: string,
  columns: ColumnRow[],
  setColumns: React.Dispatch<React.SetStateAction<ColumnRow[]>>
) {
  const addCard = (columnIndex: number) => {
    const newCard: Card = { id: Date.now(), ownedBy: username, content: "New Card", votes: 0 };
    const newColumns = [...columns];
    newColumns[columnIndex].cards.unshift(newCard);
    setColumns(newColumns);
    socket.emit("addCard", { boardName, columnIndex, card: newCard });
  };

  const deleteCard = (cardId: number, columnIndex: number) => {
    const newColumns = [...columns];
    newColumns[columnIndex].cards = newColumns[columnIndex].cards.filter(card => card.id !== cardId);
    setColumns(newColumns);
    socket.emit("deleteCard", { boardName, columnIndex, id: cardId });
  };

  const changeColumnName = (columnIndex: number, name: string) => {
    const newColumns = [...columns];
    newColumns[columnIndex].name = name;
    setColumns(newColumns);
    socket.emit("columnNameChanged", { boardName, columnIndex, name });
  };

  const createNewColumn = (columnName: string) => {
    setColumns([...columns, { name: columnName, cards: [], voting: false }]);
    socket.emit("createColumn", { boardName, columnName });
  };

  const removeColumn = (columnIndex: number) => {
    setColumns(columns.filter((_, i) => i !== columnIndex));
    socket.emit("removeColumn", { boardName, columnIndex });
  };

  const moveCard = (dragIndex: number, sourceColumnIndex: number, targetColumnIndex: number) => {
    const newColumns = [...columns];
    const [draggedCard] = newColumns[sourceColumnIndex].cards.splice(dragIndex, 1);
    newColumns[targetColumnIndex].cards.unshift(draggedCard);
    setColumns(newColumns);
    socket.emit("moveCard", { boardName, dragIndex, sourceColumnIndex, targetColumnIndex });
  };

  const updateCardContent = (columnIndex: number, cardIndex: number, content: string, imageUrl?: string) => {
    const newColumns = [...columns];
    newColumns[columnIndex].cards[cardIndex] = { ...newColumns[columnIndex].cards[cardIndex], content, image: imageUrl ?? newColumns[columnIndex].cards[cardIndex].image };
    setColumns(newColumns);
    socket.emit("updateCardContent", { boardName, columnIndex, cardIndex, content, image: imageUrl });
  };

  const changeVotingStatus = (state: boolean) => {
    socket.emit('changeVotingStatus', { boardName, state })
  }

  return { addCard, deleteCard, changeColumnName, createNewColumn, removeColumn, moveCard, updateCardContent, changeVotingStatus };
}
