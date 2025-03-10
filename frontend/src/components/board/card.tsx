import { forwardRef, useImperativeHandle, useRef, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { Card, ItemType } from '@/components/board/column';
import Image from 'next/image';
import { socket } from '@/app/socket';
import { X, ThumbsUp } from 'lucide-react';
import toast from 'react-simple-toasts';

type CardProps = {
  card: Card;
  boardName: string;
  index: number;
  columnIndex: number;
  disabled: boolean;
  votingEnabled: boolean;
  blurred: boolean;
  upvoteCard: (cardId: number) => void;
  deleteCard: (cardId: number, columnIndex: number) => void;
  updateCardContent: (columnIndex: number, cardIndex: number, content: string, imageUrl?: string) => void;
};

// eslint-disable-next-line react/display-name
export const CardComponent = forwardRef<HTMLDivElement, CardProps>(
  ({ card, boardName, disabled, votingEnabled, index, columnIndex, deleteCard, updateCardContent, upvoteCard, blurred }, ref) => {
    const [{ isDragging }, drag] = useDrag({
      type: ItemType.CARD,
      item: { index, columnIndex },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });

    const elementRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    drag(elementRef);

    // @ts-expect-error - TS doesn't know about the ref prop
    useImperativeHandle(ref, () => elementRef.current);

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      updateCardContent(columnIndex, index, e.target.value, card.image);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) {
        return;
      }
      
      if (file.size > 512 * 1024) {
        toast('File is too large! Max size is 0.5 MB.');
        e.target.value = '';

        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        updateCardContent(columnIndex, index, card.content, base64String);
        socket.emit('updateCardContent', {
          boardName: boardName,
          columnIndex: columnIndex,
          cardIndex: index,
          content: card.content,
          image: base64String,
        });
      };
      reader.readAsDataURL(file);
    };

    useEffect(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    }, [card.content, card.image]);

    return (
      <div
        ref={elementRef}
        className={`relative p-4 bg-gray-700 text-white rounded shadow ${isDragging ? 'opacity-50' : 'opacity-100'}`}
        style={{ cursor: disabled ? 'not-allowed' : 'grab' }}
      >
        {!disabled && (
          <button
            className="absolute top-1 right-1 text-gray-400 hover:text-red-500 transition z-10"
            onClick={() => deleteCard(card.id, columnIndex)}
          >
            <X size={20} />
          </button>
        )}

        {card.image?.length && (
          <Image
            src={card.image}
            alt={card.content}
            width={300}
            height={200}
            style={{ width: '300px', height: 'auto' }}
            className={'rounded-lg mb-2'}
          />
        )}
        <textarea
          ref={textareaRef}
          className={`flex w-full bg-gray-700 text-white border-none resize-none overflow-hidden justify-center text-justify ${blurred ? 'blur-md' : ''}`}
          value={card.content}
          onChange={handleContentChange}
          disabled={disabled}
        />
        <div className="mb-4 text-sm text-gray-400">Owned by {card.ownedBy}</div>
        {!disabled && (
          <div className="relative w-full">
            <input
              type="file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleImageChange}
            />
            <button
              type="button"
              className="w-full bg-blue-950 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
            >
              Upload Image
            </button>
          </div>
        )}
        {votingEnabled && (
          <div className="mt-4 text-sm flex items-center gap-1 justify-end">
            <button
              onClick={() => upvoteCard(card.id)}
              className="flex items-center gap-1 text-green-200"
            >
              <ThumbsUp/> {card.votes}
            </button>
          </div>
        )}
      </div>
    );
  },
);