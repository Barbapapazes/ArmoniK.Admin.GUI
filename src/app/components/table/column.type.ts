import { RawColumnKey } from '@app/types/data';

export type TableColumn<K extends RawColumnKey> = {
  name: string;
  key: K;
  type: 'link' | 'simple' | 'count' | 'object' | 'actions' | 'date' | 'duration' | 'status' | 'custom';
  sortable: boolean;
  link?: string;
  queryParams?: Record<string, string>;
};