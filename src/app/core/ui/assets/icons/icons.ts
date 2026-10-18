/* Icon registry, all drawn on a 24x24 stroke grid. */

export interface IconShape {
  kind: 'path' | 'rect' | 'circle';
  d?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rx?: number;
  cx?: number;
  cy?: number;
  r?: number;
}

const path = (d: string): IconShape => ({ kind: 'path', d });
const rect = (x: number, y: number, width: number, height: number, rx: number): IconShape => ({
  kind: 'rect',
  x,
  y,
  width,
  height,
  rx,
});
const circle = (cx: number, cy: number, r: number): IconShape => ({ kind: 'circle', cx, cy, r });

export const ICONS = {
  overview: [
    rect(3, 3, 7, 9, 2),
    rect(14, 3, 7, 5, 2),
    rect(14, 12, 7, 9, 2),
    rect(3, 16, 7, 5, 2),
  ],
  spending: [
    path('M3 20h18'),
    path('M6 16v-6'),
    path('M11 16V5'),
    path('M16 16v-4'),
    path('M20 16V8'),
  ],
  calendar: [rect(3, 5, 18, 16, 3), path('M3 10h18'), path('M8 3v4'), path('M16 3v4')],
  briefcase: [rect(3, 7, 18, 13, 3), path('M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2')],
  goals: [circle(12, 12, 9), circle(12, 12, 5), circle(12, 12, 1.5)],
  filter: [path('M3 5h18l-7 8v6l-4-2v-4L3 5z')],
  settings: [
    circle(12, 12, 3),
    path('M12 2v3'),
    path('M12 19v3'),
    path('M2 12h3'),
    path('M19 12h3'),
    path('M4.9 4.9l2.1 2.1'),
    path('M17 17l2.1 2.1'),
    path('M4.9 19.1L7 17'),
    path('M17 7l2.1-2.1'),
  ],
  sliders: [
    path('M4 6h10'),
    path('M18 6h2'),
    circle(16, 6, 2),
    path('M4 12h4'),
    path('M12 12h8'),
    circle(10, 12, 2),
    path('M4 18h12'),
    circle(18, 18, 2),
  ],
  plus: [path('M12 5v14'), path('M5 12h14')],
  'chevron-left': [path('M15 6l-6 6 6 6')],
  'chevron-right': [path('M9 6l6 6-6 6')],
  check: [path('M5 12l5 5 9-10')],
  lock: [rect(5, 11, 14, 9, 2), path('M8 11V8a4 4 0 0 1 8 0v3')],
  'log-out': [
    path('M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4'),
    path('M16 17l5-5-5-5'),
    path('M21 12H9'),
  ],
  'shield-check': [
    path('M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3z'),
    path('M9 12l2 2 4-4'),
  ],
  'arrow-right': [path('M5 12h14'), path('M13 6l6 6-6 6')],
  wallet: [rect(3, 6, 18, 13, 2), path('M3 10h18'), path('M16 15h2')],
  upload: [path('M12 16V4'), path('M7 9l5-5 5 5'), path('M4 20h16')],
  clock: [circle(12, 12, 9), path('M12 7v5l3 2')],
  pencil: [path('M4 20h4L19 9l-4-4L4 16v4z'), path('M13.5 6.5l4 4')],
  trash: [
    path('M4 7h16'),
    path('M10 11v6'),
    path('M14 11v6'),
    path('M6 7l1 13h10l1-13'),
    path('M9 7V4h6v3'),
  ],
} satisfies Record<string, IconShape[]>;

export type IconName = keyof typeof ICONS;
