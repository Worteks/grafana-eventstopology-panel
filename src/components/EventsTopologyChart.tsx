import React from 'react';
import { Event } from 'types';
import { EventComponent } from './EventComponent';
import { useTheme2 } from '@grafana/ui';

interface Props {
  width: number;
  height: number;
  from: number;
  to: number;
  lines: Event[][];
  margin: number; // The horizontal margin between events
  debug?: boolean;
}

const min_graduation_width = 175;

export const EventsTopologyChart = ({ width, height, from, to, lines, margin, debug }: Props) => {
  if (debug) {
    console.log('Chart component props: ', { width, height, from, to, margin });
  }

  const theme = useTheme2();
  const graduation_color = theme.colors.border.medium;

  const time_range = to - from;

  // Calculate time graduations count and position
  const graduation_count = Math.ceil(width / min_graduation_width);
  const graduations = Array.apply(null, Array(graduation_count + 1))
    .map((_, index) => from + (index * time_range) / (graduation_count + 1))
    // Remove graduation at left edge
    .splice(1);
  if (debug) {
    console.log('Graduations: ', graduations);
  }

  const line_height = (height - lines.length * margin) / lines.length;
  if (debug) {
    console.log(`${lines.length} lines to show, line height is ${line_height}`);
  }

  let y = -line_height - margin;

  /**
   * Get position on chart for a given time
   */
  function getTimePosition(time: number): number {
    return ((time - from) / time_range) * width;
  }

  return (
    <svg width={width} height={height} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
      {graduations.map((time, index) => {
        const x = getTimePosition(time);
        return (
          <g key={`graduation-${index}`}>
            <line x1={x} y1="0" x2={x} y2={height} stroke={graduation_color}></line>
            <text x={x + 5} y={height - 2} fill="rgb(204, 204, 220)" fontSize="smaller">
              {new Date(time).toLocaleTimeString()}
            </text>
          </g>
        );
      })}
      {lines.map((line, line_idx) => {
        y += line_height + margin;
        return line.map((event, event_idx) => {
          const x = getTimePosition(event.time);
          const width = getTimePosition(event.time_end) - x;
          return (
            <EventComponent
              key={`line-${line_idx}-event-${event_idx}`}
              x={x}
              y={y}
              width={width}
              height={line_height}
              color={event.color}
              event={event}
            ></EventComponent>
          );
        });
      })}
    </svg>
  );
};
