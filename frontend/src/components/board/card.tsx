import {forwardRef, useImperativeHandle, useRef} from "react";
import {useDrag} from "react-dnd";
import {Card, ItemType} from "@/components/board/column";
import Image from "next/image";

type CardProps = {
  card: Card;
  index: number;
  columnIndex: number;
  updateCardContent: (columnIndex: number, cardIndex: number, content: string) => void;
};

// eslint-disable-next-line react/display-name
export const CardComponent = forwardRef<HTMLDivElement, CardProps>(({ card, index, columnIndex, updateCardContent }, ref) => {
  const [{ isDragging }, drag] = useDrag({
    type: ItemType.CARD,
    item: { index, columnIndex },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const elementRef = useRef<HTMLDivElement>(null);
  drag(elementRef);

  // @ts-expect-error - TS doesn't know about the ref prop
  useImperativeHandle(ref, () => elementRef.current);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateCardContent(columnIndex, index, e.target.value);
  };

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
        className="w-full bg-gray-700 text-white border-none resize-none"
        value={card.content}
        onChange={handleContentChange}
      />
    </div>
  );
});