import { ApplicationRawEnumField, PartitionRawEnumField, SessionRawEnumField, TaskOptionEnumField, TaskStatus, TaskSummaryEnumField } from '@aneoconsultingfr/armonik.api.angular';
import { ApplicationRaw, ApplicationRawColumnKey, ApplicationRawFilter, ApplicationRawListOptions } from '@app/applications/types';
import { PartitionRaw } from '@app/partitions/types';
import { SessionRaw } from '@app/sessions/types';
import { TaskOptions, TaskSummary } from '@app/tasks/types';
import { ColumnKey } from '@app/types/data';
import { FiltersOr } from '@app/types/filters';
import { ListOptions } from '@app/types/options';

export type LineType = 'Applications' | 'Tasks' | 'Sessions' | 'Partitions' | 'CountStatus';
export type Summary = TaskSummary | ApplicationRaw | PartitionRaw | SessionRaw;
export type SummaryOptions = TaskOptions;
export type FiltersEnums = ApplicationRawEnumField | PartitionRawEnumField | SessionRawEnumField | TaskSummaryEnumField;
export type FiltersOptionsEnums = TaskOptionEnumField;

export type Line = {
  name: string,
  type: LineType
  interval: number,
  hideGroupsHeader?: boolean,
  filters: FiltersOr<FiltersEnums, FiltersOptionsEnums> | ApplicationRawFilter,
  options?: ListOptions<Summary> | ApplicationRawListOptions;
  taskStatusesGroups?: TasksStatusesGroup[],
  displayedColumns?: ColumnKey<Summary, SummaryOptions> | ApplicationRawColumnKey[],
  lockColumns?: boolean;
};

export type TasksStatusesGroup = {
  name: string;
  color?: string;
  statuses: TaskStatus[];
};

export type ManageGroupsDialogData = {
  groups: TasksStatusesGroup[];
};

export type ManageGroupsDialogResult = {
  groups: TasksStatusesGroup[];
};

export type StatusLabeled = { name: string, value: string };

export type AddStatusGroupDialogData = {
  statuses: StatusLabeled[];
};

export type EditStatusGroupDialogData = {
  group: TasksStatusesGroup;
  statuses: StatusLabeled[];
};
