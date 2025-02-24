import { forwardRef, useImperativeHandle, useRef, useEffect } from "react";
import { useDrag } from "react-dnd";
import { Card, ItemType } from "@/components/board/column";
import Image from "next/image";
import { socket } from "@/app/socket";

type CardProps = {
  card: Card;
  boardName: string;
  index: number;
  columnIndex: number;
  updateCardContent: (columnIndex: number, cardIndex: number, content: string, imageUrl?: string) => void;
};

// eslint-disable-next-line react/display-name
export const CardComponent = forwardRef<HTMLDivElement, CardProps>(({ card, boardName, index, columnIndex, updateCardContent }, ref) => {
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
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [card.content, card.image]);

  // Card sometimes has an image.
  return (
    <div
      ref={elementRef}
      className={`p-4 bg-gray-700 text-white rounded shadow ${isDragging ? "opacity-50" : "opacity-100"}`}
    >
      {card.image?.length && (
        <Image src={card.image} alt={card.content} width={300} height={200} />
      )}
      <textarea
        ref={textareaRef}
        className="w-full bg-gray-700 text-white border-none resize-none overflow-hidden"
        value={card.content}
        onChange={handleContentChange}
      />
      <input
        type="file"
        className="w-full bg-gray-700 text-white border-none"
        onChange={handleImageChange}
      />
    </div>
  );
});