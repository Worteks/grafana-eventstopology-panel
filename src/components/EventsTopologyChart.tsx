import React, { useRef } from 'react';

import { Event } from 'types';
import { EventComponent } from './EventComponent';
import { useTheme2 } from '@grafana/ui';
import { locationService } from '@grafana/runtime';
import { MouseDragComponent } from './MouseDragComponent';

interface Props {
  width: number;
  height: number;
  from: number;
  to: number;
  lines: Event[][];
  margin: number; // The margin between lines
  debug?: boolean;
}

const min_graduation_width = 175;

export const EventsTopologyChart = ({ width, height, from, to, lines, margin, debug }: Props) => {
  if (debug) {
    console.log('Chart component props: ', { width, height, from, to, margin });
  }

  const svgRef = useRef<SVGSVGElement>(null);

  const theme = useTheme2();

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

  /**
   * Get time for a given position on chart
   */
  function getPositonTime(position: number): number {
    return from + Math.floor((position / width) * time_range);
  }

  function setTimeRange(start: number, end: number) {
    if (debug) {
      console.log(
        `Selected time range: ${new Date(getPositonTime(start)).toLocaleString()} => ${new Date(
          getPositonTime(end)
        ).toLocaleString()}`
      );
    }
    // Set new time range
    locationService.partial({ from: getPositonTime(start), to: getPositonTime(end) }, true);
  }

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      {graduations.map((time, index) => {
        const x = getTimePosition(time);
        return (
          <g key={`graduation-${index}`}>
            <line x1={x} y1="0" x2={x} y2={height} stroke={theme.colors.border.medium}></line>
            <text x={x + 5} y={height - 2} fill={theme.colors.text.primary} fontSize="smaller">
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
      <MouseDragComponent setTimeRange={setTimeRange} targetElement={svgRef.current} />
    </svg>
  );
};
