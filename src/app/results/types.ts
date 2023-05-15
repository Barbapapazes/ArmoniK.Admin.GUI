import {ResultRaw as GrpcResultRaw} from '@aneoconsultingfr/armonik.api.angular';
import { ColumnKey, FieldKey } from '@app/types/data';
import { Filter, FilterField } from '@app/types/filters';
import { ListOptions } from '@app/types/options';

// TODO: rename type in order to have the same order that generics
export type ResultRaw = GrpcResultRaw.AsObject;
export type ResultRawColumn = ColumnKey<ResultRaw>;
// We need to find a way to use filter field for _after and for _before
export type ResultRawKeyField = FieldKey<ResultRaw>;
export type ResultRawFilterField = FilterField<ResultRaw>;
export type ResultRawFilter = Filter<ResultRaw>;
export type ResultRawListOptions = ListOptions<ResultRaw>;
// Waiting to externalize the sort direction
// type ResultRawSortDirection = SortDirection<ListResultsRequest.OrderDirection>
