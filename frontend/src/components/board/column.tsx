import { useDrop } from "react-dnd";
import { CardComponent } from "@/components/board/card";

export type Card = {
  id: number;
  content: string;
};

export const ItemType = {
  CARD: "card",
};

type ColumnProps = {
  name: string,
  cards: Card[],
  columnIndex: number;
  moveCard: (dragIndex: number, sourceColumnIndex: number, targetColumnIndex: number) => void;
  addCard: (columnIndex: number) => void;
  updateCardContent: (columnIndex: number, cardIndex: number, content: string) => void;
};


export default function Column({ name, cards, columnIndex, moveCard, addCard, updateCardContent }: ColumnProps){
  console.log(cards);
  const [, drop] = useDrop({
    accept: ItemType.CARD,
    drop: (draggedItem: { index: number; columnIndex: number }) => {
      if (draggedItem.columnIndex !== columnIndex) {
        moveCard(draggedItem.index, draggedItem.columnIndex, columnIndex);
      }
    },
  });

  return (
    <div className="flex flex-col gap-2 bg-gray-800 p-4 rounded-lg shadow-md">
      <h2 className="text-lg font-bold text-white">{name}</h2>
      <button
        // @ts-expect-error - TS doesn't know about the ref prop
        ref={drop}
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
        />
      ))}
    </div>
  );
};