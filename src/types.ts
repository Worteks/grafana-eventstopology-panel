export const debug = true;

export interface PluginOptions {
  separator: string;
  headers: string;
  show_legend: boolean;
}

export interface Line {
	path: string[];
	events: Event[];
}

export interface Event {
	time: number;
	time_end: number;
	label: string;
	color: string;
}
