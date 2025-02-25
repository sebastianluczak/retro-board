import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Column, { Card } from "@/components/board/column";
import Participants from "@/components/participants/participants";
import { useBoardSocket } from "@/hooks/useBoardSocket";
import { useGridStyles } from "@/hooks/useGridStyles";
import { useBoardActions } from "@/hooks/useBoardActions";

type RoomProps = {
    boardName: string;
    username: string;
};

export type ColumnRow = {
    name: string;
    cards: Card[];
};

export default function Room({ boardName, username }: RoomProps) {
    const { columns, setColumns, participants } = useBoardSocket();
    const { gridTemplateColumns, gridGap } = useGridStyles(columns.length);
    const { addCard, deleteCard, changeColumnName, createNewColumn, removeColumn, moveCard, updateCardContent } = useBoardActions(boardName, username, columns, setColumns);

    return (
      <DndProvider backend={HTML5Backend}>
          <div className="flex h-full">
              <div className="shrink-0">
                  <Participants users={participants} />
              </div>
              <div className="mt-16 flex-grow min-w-0 overflow-x-auto p-4">
                  <input
                    type="button"
                    value="+ Add Column"
                    className="bg-blue-500 font-bold p-3 m-1 rounded shadow shadow-blue-950"
                    onClick={() => createNewColumn("New Column")}
                  />
                  <h1 className="text-3xl font-bold text-left m-4">{boardName}</h1>
                  <div style={{ display: 'grid', gridTemplateColumns, gap: gridGap }} className="justify-start">
                      {columns.map((column, columnIndex) => (
                        <Column
                          key={columnIndex}
                          {...column}
                          columnIndex={columnIndex}
                          boardName={boardName}
                          changeColumnName={changeColumnName}
                          removeColumn={removeColumn}
                          moveCard={moveCard}
                          addCard={addCard}
                          deleteCard={deleteCard}
                          updateCardContent={updateCardContent}
                          currentUser={username}
                        />
                      ))}
                  </div>
              </div>
          </div>
      </DndProvider>
    );
}
