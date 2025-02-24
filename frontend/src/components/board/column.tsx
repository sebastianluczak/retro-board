import {ConnectDropTarget, useDrop} from "react-dnd";
import { CardComponent } from "@/components/board/card";
import {Ref} from "react";

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
  moveCard: (dragIndex: number, sourceColumnIndex: number, targetColumnIndex: number) => void;
  addCard: (columnIndex: number) => void;
  updateCardContent: (columnIndex: number, cardIndex: number, content: string) => void;
};


export default function Column({ name, boardName, currentUser, cards, columnIndex, moveCard, addCard, updateCardContent }: ColumnProps){
  const [, drop] = useDrop({
    accept: ItemType.CARD,
    drop: (draggedItem: { index: number; columnIndex: number }) => {
      if (draggedItem.columnIndex !== columnIndex) {
        moveCard(draggedItem.index, draggedItem.columnIndex, columnIndex);
      }
    },
  }) as [unknown, ConnectDropTarget];

  // some cards should be disabled for some users
  // if user is not the owner of the card, disable the card
  return (
    <div className="flex flex-col gap-2 bg-gray-800 p-4 rounded-lg shadow-md">
      <h2 className="text-lg font-bold text-white">{name}</h2>
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