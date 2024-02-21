import { TableColumn } from '@components/table/column.type';
import { DefaultConfigService } from '@services/default-config.service';
import { TableService } from '@services/table.service';
import { GenericColumn, IndexListOptions, RawColumnKey } from '../data';

export interface IndexServiceInterface<K extends RawColumnKey, O extends IndexListOptions> {
  readonly defaultConfigService: DefaultConfigService;
  readonly tableService: TableService;

  readonly defaultColumns: K[];
  readonly availableTableColumns: TableColumn<K>[];

  readonly defaultOptions: O;

  readonly defaultIntervalValue: number;
  readonly defaultLockColumns: boolean;

  // Interval
  saveIntervalValue(value: number): void;
  restoreIntervalValue(): number;

  // Lock columns
  saveLockColumns(value: boolean): void;
  restoreLockColumns(): boolean;

  // Options
  saveOptions(options: O): void;
  restoreOptions(): O;

  // Columns
  saveColumns(columns: K[]): void;
  restoreColumns(): K[];
  resetColumns(): (TableColumn<K> | K)[];
}

export interface IndexServiceGenericInterface<K extends RawColumnKey, O extends IndexListOptions> extends IndexServiceInterface<K, O> {
  saveGenericColumns(columns: GenericColumn[]): void;

  restoreGenericColumns(): GenericColumn[];
}