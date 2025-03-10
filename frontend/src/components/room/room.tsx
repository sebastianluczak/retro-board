import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Column, { Card } from '@/components/board/column';
import Participants from '@/components/participants/participants';
import { useEffect, useState } from 'react';
import { useBoardSocket } from '@/hooks/useBoardSocket';
import { useGridStyles } from '@/hooks/useGridStyles';
import { useBoardActions } from '@/hooks/useBoardActions';
import toast, { toastConfig } from 'react-simple-toasts';
import 'react-simple-toasts/dist/style.css';
import 'react-simple-toasts/dist/theme/dark.css';

toastConfig({ theme: 'dark' });

type RoomProps = {
  boardName: string;
  username: string;
};

export type ColumnRow = {
  name: string;
  voting: boolean;
  blurry: boolean;
  cards: Card[];
};

export default function Room({ boardName, username }: RoomProps) {
  const { columns, setColumns, participants } = useBoardSocket();
  const { gridTemplateColumns, gridGap } = useGridStyles(columns.length);
  const {
    addCard,
    deleteCard,
    changeColumnName,
    createNewColumn,
    removeColumn,
    moveCard,
    updateCardContent,
    changeVotingStatus,
    upvoteCard,
    changeBlurStatus,
    startTimer,
  } = useBoardActions(boardName, username, columns, setColumns);
  const [ votingEnabled, setVotingEnabled ] = useState<boolean>(false);
  const [ blurEnabled, setBlurEnabled ] = useState<boolean>(false);

  const isAdminOfBoard = () => {
    const adminUserOfBoard = participants.filter((user) => user.isAdminOfBoard).pop();

    return adminUserOfBoard?.isAdminOfBoard || false;
  };

  useEffect(() => {
    if (votingEnabled) {
      toast('Voting enabled!', { duration: 3000, maxVisibleToasts: 1 });
    } else {
      toast('Voting disabled!', { duration: 3000, maxVisibleToasts: 1 });
    }
  }, [votingEnabled]);

  useEffect(() => {
    if (blurEnabled) {
      toast('Blurring enabled!', { duration: 3000, maxVisibleToasts: 1 });
    } else {
      toast('Blurring disabled!', { duration: 3000, maxVisibleToasts: 1 });
    }
  }, [blurEnabled]);

  const snapshotBoard = () => {
    const board = {
      name: boardName,
      columns: columns,
    };

    const blob = new Blob([JSON.stringify(board)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${boardName}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
            className="bg-blue-800 font-bold p-3 m-1 rounded shadow shadow-blue-950"
            onClick={() => createNewColumn('New Column')}
          />
          {isAdminOfBoard() && (
            <>
              <input
                type={'button'}
                value={'💾 Save board'}
                className="bg-blue-800 font-bold text-white p-3 m-1 rounded shadow shadow-blue-950"
                onClick={() => snapshotBoard()}
              />
              <input
                type="button"
                value={ votingEnabled ? 'Disable votes' : 'Enable votes' }
                className={`font-bold text-white p-3 m-1 rounded shadow ${votingEnabled ? 'bg-red-950  shadow-red-700' : 'bg-green-950 shadow-green-700'}`}
                onClick={() => {
                  setVotingEnabled(!votingEnabled);
                  changeVotingStatus(!votingEnabled);
                }}
              />
              <input
                type="button"
                value={ blurEnabled ? 'Disable blur' : 'Enable blur' }
                className={`font-bold text-white p-3 m-1 rounded shadow ${blurEnabled ? 'bg-red-950  shadow-red-700' : 'bg-green-950 shadow-green-700'}`}
                onClick={() => {
                  setBlurEnabled(!blurEnabled);
                  changeBlurStatus(!blurEnabled);
                }}
              />
              <input
                type="button"
                value="Start timer"
                className="bg-red-950 font-bold text-white p-3 m-1 rounded shadow shadow-red-700"
                onClick={() => startTimer()}
              />
            </>
          )}
          <h1 className="text-3xl font-bold text-left m-4">{boardName}</h1>
          <div style={{ display: 'grid', gridTemplateColumns, gap: gridGap }} className="justify-start">
            {columns.map((column, columnIndex) => (
              <Column
                key={columnIndex}
                {...column}
                columnIndex={columnIndex}
                boardName={boardName}
                votingEnabled={column.voting}
                blurry={ column.blurry }
                changeColumnName={changeColumnName}
                removeColumn={removeColumn}
                moveCard={moveCard}
                addCard={addCard}
                deleteCard={deleteCard}
                updateCardContent={updateCardContent}
                upvoteCard={upvoteCard}
                currentUser={username}
              />
            ))}
          </div>
        </div>
      </div>
    </DndProvider>
  );
}
