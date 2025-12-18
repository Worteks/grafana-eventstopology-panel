import React, { useLayoutEffect, useRef, useState } from 'react';
import { css } from '@emotion/css';
import { DataFrame, PanelProps } from '@grafana/data';
import { useStyles2 } from '@grafana/ui';
import { EventsTopologyChart } from './EventsTopologyChart';
import { PluginOptions, Event, Line } from 'types';
import { generateColor } from 'helpers';

interface Props extends PanelProps<PluginOptions> {}

const debug = true;
const margin_between_lines_ratio = 0.05; // The overall heigh ratio that is dedicated to margin between events
const header_line_height = 40; // px

export const EventsTopologyPanel: React.FC<Props> = (props) => {
  const { options, data, width, height, timeRange } = props;
  const { separator, headers: headers_string, show_legend } = options;

  const from = timeRange.from.valueOf();
  const to = timeRange.to.valueOf();

  const styles = useStyles2(getStyles);
  const topologyPathsRef = useRef<HTMLDivElement>(null);
  const legendRef = useRef<HTMLUListElement>(null);

  const headers = headers_string === '' ? null : headers_string.split(separator);

  if (debug) {
    console.log('Panel props: ', { separator, show_legend, headers, width, height, frames: data.series });
    console.log('Panel options: ', options);
    console.log('DataFrames: ', data);
  }

  const [graph_width, setGraphWidth] = useState(0);
  const [graph_height, setGraphHeight] = useState(0);
  const [margin, setMargin] = useState(0);
  useLayoutEffect(() => {
    setGraphWidth(
      width -
        (topologyPathsRef?.current?.getBoundingClientRect()?.width ?? 0) -
        (legendRef?.current?.getBoundingClientRect()?.width ?? 0)
    );
    setGraphHeight(height - (headers ? header_line_height : 0));
    setMargin(height * margin_between_lines_ratio);
  }, [show_legend, headers, width, height]);

  /**
   * Remove redundancy from two topology paths
   *
   * this:
   *   [ "Category 1", "Subcategory 1", "Element 1" ],
   *   [ "Category 1", "Subcategory 1", "Element 2" ],
   * becomes:
   *   [ "Category 1", "Subcategory 1", "Element 1" ],
   *   [           "",              "", "Element 2" ],
   *
   */
  function clearRedundancy(current: DataFrame, previous: DataFrame) {
    const parts = current.name?.split(separator) ?? [];
    if (!previous) {
      return parts;
    } else {
      const prev_parts = previous.name?.split(separator) ?? [];
      let has_local_changes = false;
      return parts.map((part, index) => {
        if (has_local_changes || prev_parts[index] !== part) {
          has_local_changes = true;
          return part;
        } else {
          return '';
        }
      });
    }
  }

  const topology: Line[] = data.series.map((frame, index) => {
    const events: Event[] = [];
    frame.fields
      .find((f) => f.name === 'event_time')
      ?.values.forEach((time, index) => {
        // Extract event data
        const field = frame.fields.find((f) => f.name === '_');
        const value = field?.values[index] ?? '';
        const time_end = frame.fields.find((f) => f.name === 'event_time_end')?.values[index];
        const color = field ? generateColor(field, value, debug) : '';

        // Set previous event "time_end" from current event "time" if two related events follow each other
        if (events.length && !events[index - 1].time_end) {
          events[index - 1].time_end = time;
        }

        events.push({ time, time_end, label: value, color });
      });

    // If last event has no "time_end", generate a fake value far outside the graph
    if (events.length > 1 && !events[events.length - 1].time_end) {
      events[events.length - 1].time_end = to + 10000;
    }

    const line: Line = {
      path: clearRedundancy(frame, data.series[index - 1]),
      events,
    };

    return line;
  });

  if (debug) {
    console.log('Topology: ', topology);
  }

  return (
    <div className={styles.container}>
      {/* Render topology */}
      <div
        ref={topologyPathsRef}
        className={styles.headers}
        style={{
          gridTemplateColumns: `repeat(${topology[0].path.length}, auto)`,
          // Fix size row containing headers (if any) and
          // Auto-size rows containing event topology labels
          gridTemplateRows: `${headers ? `${header_line_height}px` : ''} repeat(${topology.length}, auto)`,
        }}
      >
        {(headers ?? []).map((label, index) => {
          return (
            <span key={`header-${index}`} style={{ height: `${header_line_height}px` }}>
              {label}
            </span>
          );
        })}
        {topology
          .map((l) => l.path)
          .flat()
          .map((label, index) => {
            return (
              <span key={`line-${index}`} className={styles.header_element} style={{ paddingBottom: `${margin}px` }}>
                {label}
              </span>
            );
          })}
      </div>

      <div className={styles.chart} style={{ paddingTop: headers ? header_line_height : 0 }}>
        {/* Render events */}
        <EventsTopologyChart
          width={graph_width}
          height={graph_height}
          lines={topology.map((l) => l.events)}
          margin={margin}
          from={from}
          to={to}
          debug={debug}
        />
      </div>

      {/* Render legend */}
      {show_legend ? (
        <ul ref={legendRef} className={styles.legend}>
          {topology
            .map((l) => l.events)
            .flat()
            .map((event, index) => {
              return (
                <li key={`legend-${index}`} className={styles.legend_item}>
                  <hr className={styles.legend_color_marker} style={{ borderColor: event.color }}></hr>
                  {event.label}
                </li>
              );
            })}
        </ul>
      ) : (
        <span ref={legendRef}></span>
      )}
    </div>
  );
};

const getStyles = () => ({
  container: css`
    display: flex;
    height: 100%;
    width: 100%;
    overflow: hidden;
    user-select: none;
  `,
  headers: css`
    display: grid;
    gap: 0 20px;
    flex-grow: 0;
    flex-shrink: 0;
    overflow: hidden;
    white-space: nowrap;
    padding-right: 25px;
  `,
  header_element: css`
    display: inline-flex;
    align-items: center;
  `,
  chart: css`
    flex-grow: 1;
  `,
  legend: css`
    flex-grow: 0;
    flex-shrink: 0;
    max-width: 20%;
    list-style: none;
    padding-left: 25px;
    padding-right: 10px;
  `,
  legend_item: css`
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: smaller;
    padding-top: 2px;
    padding-bottom: 2px;
  `,
  legend_color_marker: css`
    display: inline-block;
    width: 1em;
    border-bottom: 2px solid;
    border-top: 2px solid;
    border-radius: 5px;
    margin: 0;
  `,
});
