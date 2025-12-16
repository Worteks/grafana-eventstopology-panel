import React, { useEffect, useRef, useState } from 'react';
import { css } from '@emotion/css';
import { useStyles2, useTheme2 } from '@grafana/ui';
import { Event } from 'types';
import { calculateDuration } from 'helpers';

interface Props {
  visible: boolean;
  event: Event;
}

const width = 300;
const height = 100;
const mouse_gap = 20; // Pixels between mouse and tooltip

export const TooltipComponent = ({ visible, event }: Props) => {
  const styles = useStyles2(getStyles);
  const theme = useTheme2();

  const tooltipRef = useRef<HTMLDivElement>(null);
  const [x, setX] = useState(-10000);
  const [y, setY] = useState(-10000);

  useEffect(() => {
    if (tooltipRef.current) {
      // Move tooltip body to <body> tag so it can overflow chart container
      document.getElementsByTagName('body')[0].appendChild(tooltipRef.current);
    }

    const handleWindowMouseMove = (event: MouseEvent) => {
      if (!visible) return;
      setX(event.clientX + mouse_gap);
      setY(event.clientY + mouse_gap);
    };
    window.addEventListener('mousemove', handleWindowMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
    };
  }, [visible]);

  const date = new Date(event.time);
  const end = new Date(event.time_end);
  const duration = calculateDuration(date, end);

  return (
    <foreignObject>
      <div
        ref={tooltipRef}
        className={styles.tooltip}
        style={{
          left: x,
          top: y,
          width,
          height,
          borderColor: theme.colors.border.medium,
          backgroundColor: theme.colors.background.primary,
          visibility: visible ? 'visible' : 'hidden',
        }}
      >
        <div
          className={styles.title}
          style={{
            borderColor: theme.colors.border.medium,
          }}
        >
          {date.toLocaleDateString()} {date.toLocaleTimeString()}
        </div>
        <div className={styles.body}>
          <table className={styles.table}>
            <tr>
              <td>Duration</td>
              <td className={styles.value}>{duration}</td>
            </tr>
          </table>
        </div>
      </div>
    </foreignObject>
  );
};

const getStyles = () => ({
  tooltip: css`
    position: absolute;
    border: 1px solid;
    border-radius: 2px;
    font-size: small;
    z-index: 999;
  `,
  title: css`
    font-weight: bold;
    border-bottom: 1px solid;
    padding: 5px;
  `,
  body: css`
    padding: 5px;
  `,
  table: css`
    width: 100%;
  `,
  value: css`
    text-align: right;
  `,
});
