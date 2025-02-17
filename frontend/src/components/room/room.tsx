import { useState, useRef, useImperativeHandle, forwardRef } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

type Card = {
    id: number;
    content: string;
};

type ColumnProps = {
    column: Card[];
    columnIndex: number;
    moveCard: (dragIndex: number, sourceColumnIndex: number, targetColumnIndex: number) => void;
    addCard: (columnIndex: number) => void;
    updateCardContent: (columnIndex: number, cardIndex: number, content: string) => void;
};

type CardProps = {
    card: Card;
    index: number;
    columnIndex: number;
    updateCardContent: (columnIndex: number, cardIndex: number, content: string) => void;
};

const ItemType = {
    CARD: "card",
};

const CardComponent = forwardRef<HTMLDivElement, CardProps>(({ card, index, columnIndex, updateCardContent }, ref) => {
    const [{ isDragging }, drag] = useDrag({
        type: ItemType.CARD,
        item: { index, columnIndex },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    const elementRef = useRef<HTMLDivElement>(null);
    drag(elementRef);

    useImperativeHandle(ref, () => elementRef.current);

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        updateCardContent(columnIndex, index, e.target.value);
    };

    return (
        <div
            ref={elementRef}
            className={`p-4 bg-gray-700 text-white rounded shadow ${isDragging ? "opacity-50" : "opacity-100"}`}
        >
            <textarea
                className="w-full bg-gray-700 text-white border-none resize-none"
                value={card.content}
                onChange={handleContentChange}
            />
        </div>
    );
});

const Column = ({ column, columnIndex, moveCard, addCard, updateCardContent }: ColumnProps) => {
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
            <button
                ref={drop}
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
                    updateCardContent={updateCardContent}
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

    const moveCard = (dragIndex: number, sourceColumnIndex: number, targetColumnIndex: number) => {
        const sourceColumn = [...columns[sourceColumnIndex]];
        const [movedCard] = sourceColumn.splice(dragIndex, 1);
        const targetColumn = [...columns[targetColumnIndex]];
        targetColumn.unshift(movedCard);

        const newColumns = [...columns];
        newColumns[sourceColumnIndex] = sourceColumn;
        newColumns[targetColumnIndex] = targetColumn;
        setColumns(newColumns);
    };

    const updateCardContent = (columnIndex: number, cardIndex: number, content: string) => {
        const newColumns = [...columns];
        newColumns[columnIndex][cardIndex].content = content;
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
                        updateCardContent={updateCardContent}
                    />
                ))}
            </div>
        </DndProvider>
    );
}