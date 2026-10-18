import { Component, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { DatePipe } from '@angular/common';
import { IconName } from '../../assets/icons/icons';
import { Button } from '../button/button';
import { Tag, TagColor } from '../tag/tag';

/** How a column renders its cells. */
export type TableColumnType = 'text' | 'date' | 'tag' | 'dot' | 'initial' | 'actions';

export interface TableAction<T = any> {
  icon: IconName;
  title: (row: T) => string;
  action: (row: T) => void;
  isDisabled?: (row: T) => boolean;
  isVisible?: (row: T) => boolean;
}

/** Per-row text style of a cell. */
export type TableCellTone = 'strong' | 'muted' | 'success' | 'danger';

export interface TableColumn<T = any> {
  key: keyof T | string;
  label: string;
  type?: TableColumnType;
  align?: 'left' | 'right';
  emphasis?: boolean;
  muted?: boolean;
  getLabel?: (row: T) => string;
  getTagColor?: (row: T) => TagColor;
  getDotColor?: (row: T) => string;
  getBadgeColor?: (row: T) => string;
  getTone?: (row: T) => TableCellTone;
  dateFormat?: string;
  actions?: TableAction<T>[];
}

@Component({
  selector: 'app-table',
  imports: [TranslocoPipe, Button, Tag, DatePipe],
  templateUrl: './table.html',
  styleUrl: './table.css',
})
export class Table<T = any> {
  columns = input.required<TableColumn<T>[]>();
  data = input.required<T[]>();
  showHeader = input(true);
  stickyHeader = input(false);
  divided = input(false);
  emptyTitle = input<string>();
  emptyText = input<string>();
  locale = input<string>();

  protected cellValue(column: TableColumn<T>, row: T): unknown {
    return (row as Record<string, unknown>)[column.key as string];
  }

  protected cellLabel(column: TableColumn<T>, row: T): string {
    return column.getLabel?.(row) ?? String(this.cellValue(column, row) ?? '');
  }
}
