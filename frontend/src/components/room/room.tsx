import { useState, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { socket} from "@/app/socket";
import Column, {Card} from "@/components/board/column";

export default function Room(props: { boardName: string }) {
    const { boardName } = props;
    const [columns, setColumns] = useState<{ name: string, cards: Card[]}[]>([]);
    const [participants, setParticipants] = useState<string[]>([]);

    const addCard = (columnIndex: number) => {
        const newCard: Card = {
            id: Date.now(),
            content: "New Card",
        };
        const newColumns = [...columns];
        newColumns[columnIndex].cards.unshift(newCard);
        setColumns(newColumns);
        socket.emit('addCard', {
            boardName: boardName,
            columnIndex: columnIndex,
            card: newCard,
        });
    };

    const moveCard = (dragIndex: number, sourceColumnIndex: number, targetColumnIndex: number) => {
        const newColumns = [...columns];
        const [draggedCard] = newColumns[sourceColumnIndex].cards.splice(dragIndex, 1);
        newColumns[targetColumnIndex].cards.unshift(draggedCard);
        setColumns(newColumns);
    };

    const updateCardContent = (columnIndex: number, cardIndex: number, content: string) => {
        const newColumns = [...columns];
        newColumns[columnIndex].cards[cardIndex].content = content;
        setColumns(newColumns);
    };

    useEffect(() => {
        socket.on('columnsUpdated', (columns) => {
            console.log('Columns updated with count', columns.length);
            setColumns(columns);
        });
        socket.on('participantsUpdated', (participants) => {
            console.log('Participants updated with count', participants.length);
            setParticipants(participants);
        });
    }, []);

    return (
        <DndProvider backend={HTML5Backend}>
            <h1 className="text-3xl font-bold text-center">{boardName}</h1>
            <span>Participants: {participants.join(', ')}</span>
            <div className="grid grid-cols-4 gap-4 p-4">
                {columns.map((column, columnIndex) => (
                    <Column
                        key={columnIndex}
                        cards={column.cards}
                        name={column.name}
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