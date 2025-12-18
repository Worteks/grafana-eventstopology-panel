import React, { useEffect, useState } from 'react';

interface Props {
  setTimeRange: (start: number, end: number) => void;
  targetElement: SVGSVGElement | null;
}

export const MouseDragComponent = ({ setTimeRange, targetElement }: Props) => {
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [dragEnd, setDragEnd] = useState(0);

  useEffect(() => {
    const CTM = targetElement?.getScreenCTM();

    const handleMouseDown = (event: MouseEvent) => {
      if (CTM) {
        setDragStart((event.clientX - CTM.e) / CTM.a);
        setDragEnd((event.clientX - CTM.e) / CTM.a);
        setDragging(true);
        event.stopPropagation();
      }
    };
    const handleMouseUp = (event: MouseEvent) => {
      setDragging(false);
      if (CTM) {
        setDragEnd((event.clientX - CTM.e) / CTM.a);
        setTimeRange(dragStart, dragEnd);
      }
      event.stopPropagation();
    };
    const handleMouseMove = (event: MouseEvent) => {
      if (dragging) {
        if (CTM) {
          if ((event.clientX - CTM.e) / CTM.a >= 0) {
            setDragEnd((event.clientX - CTM.e) / CTM.a);
          } else {
            setDragStart(0);
            setDragEnd(0);
            setDragging(false);
          }
        }
        event.stopPropagation();
      }
    };
    targetElement?.addEventListener('mousedown', handleMouseDown);
    targetElement?.addEventListener('mouseup', handleMouseUp);
    targetElement?.addEventListener('mousemove', handleMouseMove);

    return () => {
      targetElement?.removeEventListener('mousedown', handleMouseDown);
      targetElement?.removeEventListener('mouseup', handleMouseUp);
      targetElement?.removeEventListener('mousemove', handleMouseMove);
    };
  });

  return (
    <rect
      x={dragStart}
      y={0}
      width={dragEnd > dragStart ? dragEnd - dragStart : 0}
      height="100%"
      fillOpacity="0.2"
      visibility={dragging ? 'visible' : 'hidden'}
    ></rect>
  );
};
