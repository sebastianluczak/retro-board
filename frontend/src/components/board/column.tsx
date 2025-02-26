import { ConnectDropTarget, useDrop } from 'react-dnd';
import { CardComponent } from '@/components/board/card';
import { Ref } from 'react';
import { X } from 'lucide-react';

export type Card = {
  id: number;
  content: string;
  ownedBy: string; // User ID
  votes: number; // Votes on this card
  image?: string; // URL to image
};

export const ItemType = {
  CARD: 'card',
};

type ColumnProps = {
  name: string,
  boardName: string;
  currentUser: string;
  cards: Card[],
  columnIndex: number;
  votingEnabled: boolean;
  upvoteCard: (cardId: number) => void;
  changeColumnName: (columnIndex: number, name: string) => void;
  removeColumn: (columnIndex: number) => void;
  moveCard: (dragIndex: number, sourceColumnIndex: number, targetColumnIndex: number) => void;
  addCard: (columnIndex: number) => void;
  deleteCard: (cardId: number, columnIndex: number) => void;
  updateCardContent: (columnIndex: number, cardIndex: number, content: string) => void;
};

export default function Column(
  {
    name,
    boardName,
    currentUser,
    cards,
    columnIndex,
    votingEnabled,
    changeColumnName,
    removeColumn,
    moveCard,
    addCard,
    deleteCard,
    updateCardContent,
    upvoteCard,
  }: ColumnProps,
){
  const [, drop] = useDrop({
    accept: ItemType.CARD,
    drop: (draggedItem: { index: number; columnIndex: number }) => {
      if (draggedItem.columnIndex !== columnIndex) {
        moveCard(draggedItem.index, draggedItem.columnIndex, columnIndex);
      }
    },
  }) as [unknown, ConnectDropTarget];

  return (
    <div
      className="flex flex-col gap-2 bg-gray-800 p-4 rounded-lg shadow-md"
      ref={drop as unknown as Ref<HTMLDivElement>}
    >
      <div className={'flex justify-start items-center'}>
        <button
          className="text-gray-400 hover:text-red-500 transition"
          onClick={() => removeColumn(columnIndex)}
        >
          <X size={20} />
        </button>
        <input
          type={'text'}
          value={name}
          className="p-2 bg-gray-800 text-white rounded hover:bg-gray-700 font-bold transition"
          onChange={(r) => changeColumnName(columnIndex, r.target.value)}
        />
      </div>

      <button
        className="p-2 bg-blue-800 text-white rounded hover:bg-blue-700 transition"
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
          upvoteCard={upvoteCard}
          updateCardContent={updateCardContent}
          deleteCard={deleteCard}
          boardName={boardName}
          votingEnabled={votingEnabled}
          disabled={card.ownedBy !== currentUser}
        />
      ))}
    </div>
  );
};