import {
	FieldConfigProperty,
	PanelPlugin
} from '@grafana/data';
import {
	PluginOptions
} from './types';
import {
	EventsTopologyPanel
} from 'components/EventsTopologyPanel';

export const plugin = new PanelPlugin<PluginOptions>(EventsTopologyPanel)
  .useFieldConfig({
    disableStandardOptions: [
      FieldConfigProperty.Color,
      FieldConfigProperty.Unit,
      FieldConfigProperty.Min,
      FieldConfigProperty.Max,
      FieldConfigProperty.Decimals,
      FieldConfigProperty.DisplayName,
      FieldConfigProperty.NoValue,
      FieldConfigProperty.Links,
      FieldConfigProperty.FieldMinMax,
    ],
  })
  .setPanelOptions((builder) => {
    return builder
      .addTextInput({
        path: 'separator',
        name: 'Separator',
        description: 'Character used to split field names',
        defaultValue: '|',
      })
      .addBooleanSwitch({
        path: 'show_legend',
        name: 'Legend',
        description: 'Show legend box',
        defaultValue: true,
      })
      .addTextInput({
        path: 'headers',
        name: 'Column Headers',
        description: 'Column headers (separated with separator char)',
        defaultValue: '',
      });
  });
