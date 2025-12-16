import { createTheme, Field, MappingType } from '@grafana/data';

const theme = createTheme();
const colors = theme.visualization.palette;

// Cache events colors so we don't re-generating them
const event_colors_cache: {
  [key: string]: string;
} = {};

/**
 * Generate color for event
 */
export function generateColor(field: Field, value: string | number, debug: boolean): string {
  if (debug) {
    console.log(`Processing field ${field.name} with value ${value}, config: `, field.config);
  }

  let color, origin;

  const value_number = parseInt(`${value}`, 10);

  for (let t of field.config.thresholds?.steps ?? []) {
    if (value_number >= t.value) {
      color = theme.visualization.getColorByName(t.color);
      origin = 'threshold mapping';
    }
  }

  for (let m of field.config.mappings ?? []) {
    if (m.type === MappingType.ValueToText) {
      const key = Object.keys(m.options).find((key) => `${key}` === `${value}`);
      if (key) {
        color = theme.visualization.getColorByName(m.options[key].color ?? '');
        origin = 'value mapping';
      }
    }
  }

  if (color === undefined) {
    // Generate random color bound to event label
    const cache_key = value;
    if (!event_colors_cache[cache_key]) {
      const color_index =
        Object.keys(event_colors_cache).length -
        Math.floor(Object.keys(event_colors_cache).length / colors.length) * colors.length;
      event_colors_cache[cache_key] = colors[color_index];
    }
    color = event_colors_cache[cache_key];
    origin = 'random picking';
  }

  if (debug) {
    console.log(`  color from ${origin}: ${color}`);
  }

  return color;
}

export function calculateDuration(start: Date, end: Date): string {
  let hour = 0;
  let min = 0;
  let sec = 0;

  let remaining = end.getTime() - start.getTime();

  if (remaining >= 3600 * 1000) {
    hour = Math.floor(remaining / (3600 * 1000));
    remaining = remaining - hour * 3600 * 1000;
  }

  if (remaining >= 60 * 1000) {
    min = Math.floor(remaining / (60 * 1000));
    remaining = remaining - min * 60 * 1000;
  }

  sec = Math.floor(remaining / 1000);

  return (hour > 0 ? `${hour}h ` : '') + `${min}m ${sec}s`;
}
