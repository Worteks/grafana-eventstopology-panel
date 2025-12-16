import React, { useState } from 'react';
import { TooltipComponent } from './TooltipComponent';
import { Event } from 'types';

interface Props {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  event: Event;
}

export const EventComponent = ({ x, y, width, height, color, event }: Props) => {
  const [show_tooltip, setShowTooltip] = useState(false);

  return (
    <g onMouseOver={() => setShowTooltip(true)} onMouseOut={() => setShowTooltip(false)}>
      <rect stroke={color} fill={color} fillOpacity="0.4" x={x} y={y} width={width} height={height} />
      <TooltipComponent visible={show_tooltip} event={event} />
    </g>
  );
};
