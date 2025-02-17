import { useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

type Card = {
    id: number;
    content: string;
};

type ColumnProps = {
    column: Card[];
    columnIndex: number;
    moveCard: (dragIndex: number, hoverIndex: number, sourceColumnIndex: number, targetColumnIndex: number) => void;
    addCard: (columnIndex: number) => void;
};

type CardProps = {
    card: Card;
    index: number;
    columnIndex: number;
    moveCard: (dragIndex: number, hoverIndex: number, sourceColumnIndex: number, targetColumnIndex: number) => void;
};

const ItemType = {
    CARD: "card",
};

const CardComponent = ({ card, index, columnIndex, moveCard }: CardProps) => {
    const [{ isDragging }, ref] = useDrag({
        type: ItemType.CARD,
        item: { index, columnIndex },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    const [, drop] = useDrop({
        accept: ItemType.CARD,
        hover: (draggedItem: { index: number; columnIndex: number }) => {
            if (draggedItem.index === index && draggedItem.columnIndex === columnIndex) return;

            moveCard(draggedItem.index, index, draggedItem.columnIndex, columnIndex);
        },
    });

    return (
        <div
            ref={(node) => ref(drop(node))}
            className={`p-4 bg-gray-700 text-white rounded shadow ${isDragging ? "opacity-50" : "opacity-100"}`}
        >
            {card.content}
        </div>
    );
};

const Column = ({ column, columnIndex, moveCard, addCard }: ColumnProps) => {
    const [, drop] = useDrop({
        accept: ItemType.CARD,
        drop: (draggedItem: { index: number; columnIndex: number }) => {
            if (draggedItem.columnIndex !== columnIndex) {
                moveCard(draggedItem.index, column.length, draggedItem.columnIndex, columnIndex);
            }
        },
    });

    return (
        <div ref={drop} className="flex flex-col gap-2 bg-gray-800 p-4 rounded-lg shadow-md">
            <button
                className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                onClick={() => addCard(columnIndex)}
            >
                + Add Card
            </button>
            {column.map((card, index) => (
                <CardComponent
                    key={card.id}
                    card={card}
                    index={index}
                    columnIndex={columnIndex}
                    moveCard={moveCard}
                />
            ))}
        </div>
    );
};

export default function Room() {
    const [columns, setColumns] = useState<Card[][]>([[], [], [], []]);

    const addCard = (columnIndex: number) => {
        const newCard: Card = {
            id: Date.now(),
            content: "New Card",
        };
        const newColumns = [...columns];
        newColumns[columnIndex].unshift(newCard);
        setColumns(newColumns);
    };

    const moveCard = (dragIndex: number, hoverIndex: number, sourceColumnIndex: number, targetColumnIndex: number) => {
        const sourceColumn = [...columns[sourceColumnIndex]];
        const [movedCard] = sourceColumn.splice(dragIndex, 1);
        const targetColumn = [...columns[targetColumnIndex]];
        targetColumn.splice(hoverIndex, 0, movedCard);

        const newColumns = [...columns];
        newColumns[sourceColumnIndex] = sourceColumn;
        newColumns[targetColumnIndex] = targetColumn;
        setColumns(newColumns);
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="grid grid-cols-4 gap-4 p-4">
                {columns.map((column, columnIndex) => (
                    <Column
                        key={columnIndex}
                        column={column}
                        columnIndex={columnIndex}
                        moveCard={moveCard}
                        addCard={addCard}
                    />
                ))}
            </div>
        </DndProvider>
    );
}