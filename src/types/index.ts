export type ControlType = 'slider' | 'button' | 'knob' | 'fader' | 'xypad' | 'toggle' | 'label';

export interface OscConfig {
  address: string;
  addressY?: string;
  dataType: 'float' | 'int' | 'string' | 'boolean';
  port: number;
  min: number;
  max: number;
  host: string;
}

export interface MidiConfig {
  channel: number;
  cc: number;
  enabled: boolean;
}

export interface LuaScript {
  enabled: boolean;
  code: string;
}

export interface ControlWidget {
  id: string;
  type: ControlType;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  color: string;
  value: number;
  valueY?: number;
  osc: OscConfig;
  midi: MidiConfig;
  lua: LuaScript;
  locked: boolean;
  visible: boolean;
  // Type-specific
  momentary?: boolean; // for button
  orientation?: 'horizontal' | 'vertical'; // for slider/fader
}

export interface Page {
  id: string;
  name: string;
  color: string;
  widgets: ControlWidget[];
}

export interface ProjectState {
  name: string;
  pages: Page[];
  activePageId: string;
  selectedWidgetIds: string[];
  editMode: boolean;
  gridSize: number;
  snapToGrid: boolean;
  showGrid: boolean;
  oscGlobalHost: string;
  oscGlobalPort: number;
}

export interface OscMessage {
  address: string;
  args: (number | string)[];
  timestamp: number;
}
