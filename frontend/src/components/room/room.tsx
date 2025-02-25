import { useState, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { socket} from "@/app/socket";
import Column, {Card} from "@/components/board/column";
import Participants from "@/components/participants/participants";

type RoomProps = {
    boardName: string;
    username: string;
};

export default function Room(props: RoomProps) {
    const { boardName, username } = props;
    const [columns, setColumns] = useState<{ name: string, cards: Card[]}[]>([]);
    const [participants, setParticipants] = useState<string[]>([]);

    const addCard = (columnIndex: number) => {
        const newCard: Card = {
            id: Date.now(),
            ownedBy: username,
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
        socket.emit('moveCard', {
            boardName: boardName,
            dragIndex: dragIndex,
            sourceColumnIndex: sourceColumnIndex,
            targetColumnIndex: targetColumnIndex,
        })
    };

    const updateCardContent = (columnIndex: number, cardIndex: number, content: string, imageUrl?: string) => {
        const newColumns = [...columns];
        newColumns[columnIndex].cards[cardIndex].content = content;
        newColumns[columnIndex].cards[cardIndex].image = imageUrl ?? newColumns[columnIndex].cards[cardIndex].image;
        setColumns(newColumns);
        socket.emit('updateCardContent', {
            boardName: boardName,
            columnIndex: columnIndex,
            cardIndex: cardIndex,
            content: content,
            image: imageUrl,
        });
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
            <Participants
                users={participants}
            />
            <div className="grid grid-cols-4 gap-4 p-4">
                {columns.map((column, columnIndex) => (
                    <Column
                        key={columnIndex}
                        cards={column.cards}
                        boardName={boardName}
                        name={column.name}
                        columnIndex={columnIndex}
                        moveCard={moveCard}
                        addCard={addCard}
                        updateCardContent={updateCardContent}
                        currentUser={username}
                    />
                ))}
            </div>
        </DndProvider>
    );
}