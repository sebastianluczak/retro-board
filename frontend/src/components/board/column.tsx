import { ConnectDropTarget, useDrop } from "react-dnd";
import { CardComponent } from "@/components/board/card";
import { Ref } from "react";

export type Card = {
  id: number;
  content: string;
  ownedBy: string; // User ID
  image?: string; // URL to image
};

export const ItemType = {
  CARD: "card",
};

type ColumnProps = {
  name: string,
  boardName: string;
  currentUser: string;
  cards: Card[],
  columnIndex: number;
  changeColumnName: (columnIndex: number, name: string) => void;
  moveCard: (dragIndex: number, sourceColumnIndex: number, targetColumnIndex: number) => void;
  addCard: (columnIndex: number) => void;
  updateCardContent: (columnIndex: number, cardIndex: number, content: string) => void;
};


export default function Column({ name, boardName, currentUser, cards, columnIndex, changeColumnName, moveCard, addCard, updateCardContent }: ColumnProps){
  const [, drop] = useDrop({
    accept: ItemType.CARD,
    drop: (draggedItem: { index: number; columnIndex: number }) => {
      if (draggedItem.columnIndex !== columnIndex) {
        moveCard(draggedItem.index, draggedItem.columnIndex, columnIndex);
      }
    },
  }) as [unknown, ConnectDropTarget];

  return (
    <div className="flex flex-col gap-2 bg-gray-800 p-4 rounded-lg shadow-md">
      <input
        type={"text"}
        value={name}
        className="p-2 bg-gray-800 text-white rounded hover:bg-gray-700 font-bold transition"
        onChange={(r) => changeColumnName(columnIndex, r.target.value)}
      />
      <button
        ref={drop as unknown as Ref<HTMLButtonElement>}
        className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        onClick={() => addCard(columnIndex)}
      >
        + Add Card
      </button>
      {cards.map((card, index) => (
        <CardComponent
          key={card.id}
          card={card}
          index={index}
          columnIndex={columnIndex}
          updateCardContent={updateCardContent}
          boardName={boardName}
          disabled={card.ownedBy !== currentUser}
        />
      ))}
    </div>
  );
};