import { FilterStringOperator, TaskSummaryEnumField } from '@aneoconsultingfr/armonik.api.angular';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { SortDirection } from '@angular/material/sort';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { Duration, Timestamp } from '@ngx-grpc/well-known-types';
import { Observable, Subject, Subscription, catchError, map, merge, mergeAll, of, startWith, switchMap } from 'rxjs';
import { NoWrapDirective } from '@app/directives/no-wrap.directive';
import { TasksFiltersService } from '@app/tasks/services/tasks-filters.service';
import { TasksGrpcService } from '@app/tasks/services/tasks-grpc.service';
import { TasksIndexService } from '@app/tasks/services/tasks-index.service';
import { TasksStatusesService } from '@app/tasks/services/tasks-statuses.service';
import { DATA_FILTERS_SERVICE } from '@app/tokens/filters.token';
import { TableColumn } from '@app/types/column.type';
import { GenericColumn } from '@app/types/data';
import { TaskStatusColored } from '@app/types/dialog';
import { Page } from '@app/types/pages';
import { CountTasksByStatusComponent } from '@components/count-tasks-by-status.component';
import { FiltersToolbarComponent } from '@components/filters/filters-toolbar.component';
import { ManageGenericColumnDialogComponent } from '@components/manage-generic-dialog.component';
import { PageHeaderComponent } from '@components/page-header.component';
import { TableActionsToolbarComponent } from '@components/table-actions-toolbar.component';
import { TableContainerComponent } from '@components/table-container.component';
import { DurationPipe } from '@pipes/duration.pipe';
import { EmptyCellPipe } from '@pipes/empty-cell.pipe';
import { AutoRefreshService } from '@services/auto-refresh.service';
import { FiltersService } from '@services/filters.service';
import { IconsService } from '@services/icons.service';
import { NotificationService } from '@services/notification.service';
import { QueryParamsService } from '@services/query-params.service';
import { ShareUrlService } from '@services/share-url.service';
import { StorageService } from '@services/storage.service';
import { TableStorageService } from '@services/table-storage.service';
import { TableURLService } from '@services/table-url.service';
import { TableService } from '@services/table.service';
import { TasksByStatusService } from '@services/tasks-by-status.service';
import { UtilsService } from '@services/utils.service';
import { ApplicationsTableComponent } from './components/table.component';
import { SessionsFiltersService } from './services/sessions-filters.service';
import { SessionsGrpcService } from './services/sessions-grpc.service';
import { SessionsIndexService } from './services/sessions-index.service';
import { SessionsStatusesService } from './services/sessions-statuses.service';
import { SessionRaw, SessionRawColumnKey, SessionRawFilters, SessionRawListOptions } from './types';

@Component({
  selector: 'app-sessions-index',
  templateUrl: './index.component.html',
  styles: [`
app-table-actions-toolbar {
  flex-grow: 1;
}

.filters {
  height: auto;
  min-height: 64px;

  padding: 1rem;
}
  `],
  standalone: true,
  providers: [
    TasksByStatusService,
    IconsService,
    ShareUrlService,
    QueryParamsService,
    StorageService,
    TableURLService,
    TableStorageService,
    TableService,
    UtilsService,
    AutoRefreshService,
    SessionsIndexService,
    SessionsGrpcService,
    NotificationService,
    TasksByStatusService,
    TasksStatusesService,
    TasksIndexService,
    FiltersService,
    TasksFiltersService,
    SessionsFiltersService,
    {
      provide: DATA_FILTERS_SERVICE,
      useExisting: SessionsFiltersService
    },
    SessionsStatusesService,
    MatDialog,
    TasksGrpcService,
  ],
  imports: [
    DurationPipe,
    EmptyCellPipe,
    NoWrapDirective,
    CountTasksByStatusComponent,
    NgIf,
    NgFor,
    DatePipe,
    RouterLink,
    DragDropModule,
    PageHeaderComponent,
    TableActionsToolbarComponent,
    FiltersToolbarComponent,
    TableContainerComponent,
    MatTooltipModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatMenuModule,
    ApplicationsTableComponent
  ]
})
export class IndexComponent implements OnInit, AfterViewInit, OnDestroy {
  readonly #tasksByStatusService = inject(TasksByStatusService);
  readonly #notificationService = inject(NotificationService);
  readonly #sessionsFiltersService = inject(SessionsFiltersService);
  readonly _tasksByStatusService = inject(TasksByStatusService);
  readonly _tasksGrpcService = inject(TasksGrpcService);
  readonly #dialog = inject(MatDialog);

  displayedColumns: TableColumn<SessionRawColumnKey>[] = [];
  availableColumns: SessionRawColumnKey[] = [];
  displayedColumnsKeys: SessionRawColumnKey[] = [];
  genericColumns: GenericColumn[];
  lockColumns: boolean = false;
  columnsLabels: Record<SessionRawColumnKey, string> = {} as unknown as Record<SessionRawColumnKey, string>;

  isLoading = true;
  data: SessionRaw[] = [];
  total = 0;

  options: SessionRawListOptions;

  filters: SessionRawFilters = [];

  intervalValue = 0;
  sharableURL = '';

  isDurationSorted: boolean = false;

  refresh: Subject<void> = new Subject<void>();
  stopInterval: Subject<void> = new Subject<void>();
  interval: Subject<number> = new Subject<number>();
  interval$: Observable<number> = this._autoRefreshService.createInterval(this.interval, this.stopInterval);
  optionsChange: Subject<void> = new Subject<void>();

  sessionEndedDates: {sessionId: string, date: Timestamp | undefined}[] = [];
  sessionCreationDates: {sessionId: string, date: Timestamp | undefined}[] = [];
  nextDuration$ = new Subject<string>();
  computeDuration$ = new Subject<void>();

  data$ = new Subject<SessionRaw[]>();

  tasksStatusesColored: TaskStatusColored[] = [];

  subscriptions: Subscription = new Subscription();

  constructor(
    private _iconsService: IconsService,
    private _shareURLService: ShareUrlService,
    private _sessionsIndexService: SessionsIndexService,
    private _sessionsGrpcService: SessionsGrpcService,
    private _autoRefreshService: AutoRefreshService
  ) {}

  ngOnInit() {
    this.displayedColumnsKeys = this._sessionsIndexService.restoreColumns();
    this.availableColumns = this._sessionsIndexService.availableTableColumns.map(column => column.key);
    this.genericColumns = this._sessionsIndexService.restoreGenericColumns();
    this.availableColumns.push(...this.genericColumns);
    this.lockColumns = this._sessionsIndexService.restoreLockColumns();
    this._sessionsIndexService.availableTableColumns.forEach(column => {
      this.columnsLabels[column.key] = column.name;
    });
    this.updateDisplayedColumns();

    this.options = this._sessionsIndexService.restoreOptions();

    this.filters = this.#sessionsFiltersService.restoreFilters();

    this.intervalValue = this._sessionsIndexService.restoreIntervalValue();

    this.sharableURL = this._shareURLService.generateSharableURL(this.options, this.filters);

    this.tasksStatusesColored = this.#tasksByStatusService.restoreStatuses('sessions');
  }

  ngAfterViewInit(): void {
    const mergeSubscription = merge(this.optionsChange, this.refresh, this.interval$)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoading = true;

          const filters = this.filters;
          const options = structuredClone(this.options);

          this.sharableURL = this._shareURLService.generateSharableURL(this.options, filters);
          this._sessionsIndexService.saveOptions(this.options);

          if(this.isDurationDisplayed() && this.options.sort.active === 'duration') {
            options.sort.active = 'createdAt';
            this.isDurationSorted = true;
          } else {
            this.isDurationSorted = false;
          }

          return this._sessionsGrpcService.list$(options, filters).pipe(
            catchError((error) => {
              console.error(error);
              this.#notificationService.error('Unable to fetch sessions');
              return of(null);
            }),
          );
        }),
        map(data => {
          this.total = data?.total ?? 0;
          const sessions = data?.sessions ?? [];
          return sessions;
        })
      )
      .subscribe(data => {
        this.data = data;
        if (this.data.length !== 0 && this.isDurationDisplayed()) {
          data.forEach(session => {
            this.nextDuration$.next(session.sessionId);
          });
        } else {
          this.isLoading = false;
          this.data$.next(data);
        }
      });

    this.computeDuration$.subscribe(() => {
      if (this.data.length === this.sessionEndedDates.length && this.data.length === this.sessionCreationDates.length) {
        const keys: string[] = this.sessionEndedDates.map(duration => duration.sessionId);
        keys.forEach(key => {
          const sessionIndex = this.data.findIndex(session => session.sessionId === key);
          if (sessionIndex !== -1) {
            const lastDuration = this.sessionEndedDates.find(duration => duration.sessionId === key)?.date;
            const firstDuration = this.sessionCreationDates.find(duration => duration.sessionId === key)?.date;
            if (firstDuration && lastDuration) {
              this.data[sessionIndex].duration = {
                seconds: (Number(lastDuration.seconds) - Number(firstDuration.seconds)).toString(),
                nanos: Math.abs(lastDuration.nanos - firstDuration.nanos)
              } as Duration;
            } else {
              this.#notificationService.warning('Error while computing duration for session: ' + key);
            }
          }
        });
        if (this.isDurationSorted) {
          this.orderByDuration();
        }
        this.sessionEndedDates = [];
        this.sessionCreationDates = [];
        this.data$.next(this.data);
        this.isLoading = false;
      }
    });
    
    this.nextDuration$.pipe(
      map(sessionId => this.getTaskData$(sessionId, 'createdAt', 'asc')),
      mergeAll(),
    ).subscribe(task => this.durationSubscription(task, 'created'));

    this.nextDuration$.pipe(
      map(sessionId => this.getTaskData$(sessionId, 'endedAt', 'desc')),
      mergeAll(),
    ).subscribe(task => this.durationSubscription(task, 'ended'));

    this.handleAutoRefreshStart();
    this.subscriptions.add(mergeSubscription);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  updateDisplayedColumns(): void {
    this.displayedColumns = this.displayedColumnsKeys.map(key => {
      if (key.includes('generic.')) {
        const customColumn = key.replaceAll('generic.', '');
        return {
          key: `options.options.${customColumn}`,
          name: customColumn,
          sortable: true,
        };
      } else {
        return this._sessionsIndexService.availableTableColumns.find(column => column.key === key) as TableColumn<SessionRawColumnKey>;
      }
    });
  }

  getIcon(name: string): string {
    return this._iconsService.getIcon(name);
  }

  getPageIcon(name: Page): string {
    return this._iconsService.getPageIcon(name);
  }

  onRefresh() {
    this.refresh.next();
  }

  onIntervalValueChange(value: number) {
    this.intervalValue = value;

    if (value === 0) {
      this.stopInterval.next();
    } else {
      this.interval.next(value);
      this.refresh.next();
    }

    this._sessionsIndexService.saveIntervalValue(value);
  }

  onColumnsChange(data: SessionRawColumnKey[]) {
    this.displayedColumnsKeys = data;
    this.updateDisplayedColumns();
    this._sessionsIndexService.saveColumns(data);
  }

  onColumnsReset() {
    this.displayedColumnsKeys = this._sessionsIndexService.resetColumns();
    this.updateDisplayedColumns();
  }

  onFiltersChange(filters: unknown[]) {
    this.filters = filters as SessionRawFilters;

    this.#sessionsFiltersService.saveFilters(filters as SessionRawFilters);
    this.options.pageIndex = 0;
    this.refresh.next();
  }

  onFiltersReset() {
    this.filters = this.#sessionsFiltersService.resetFilters();
    this.options.pageIndex = 0;
    this.refresh.next();
  }
  
  onLockColumnsChange() {
    this.lockColumns = !this.lockColumns;
    this._sessionsIndexService.saveLockColumns(this.lockColumns);
  }

  autoRefreshTooltip() {
    return this._autoRefreshService.autoRefreshTooltip(this.intervalValue);
  }

  onCancel(sessionId: string) {
    this._sessionsGrpcService.cancel$(sessionId).subscribe(
      () => this.refresh.next(),
    );
  }

  handleAutoRefreshStart() {
    if (this.intervalValue === 0) {
      this.stopInterval.next();
    } else {
      this.interval.next(this.intervalValue);
    }
  }

  onOptionsChange() {
    this.optionsChange.next();
  }


  addGenericColumn(): void {
    const dialogRef = this.#dialog.open<ManageGenericColumnDialogComponent, GenericColumn[], GenericColumn[]>(ManageGenericColumnDialogComponent, {
      data: this.genericColumns
    });

    dialogRef.afterClosed().subscribe((result) => {
      if(result) {
        this.genericColumns = result;
        this.availableColumns = this.availableColumns.filter(column => !column.startsWith('generic.'));
        this.availableColumns.push(...result);
        this.displayedColumnsKeys = this.displayedColumnsKeys.filter(column => !column.startsWith('generic.'));
        this.displayedColumnsKeys.push(...result);
        this.updateDisplayedColumns();
        this._sessionsIndexService.saveColumns(this.displayedColumnsKeys);
        this._sessionsIndexService.saveGenericColumns(this.genericColumns);
      }
    });
  }

  isDurationDisplayed(): boolean {
    return this.displayedColumnsKeys.includes('duration');
  }

  getTaskData$(sessionId: string, active: 'createdAt' | 'endedAt', direction: SortDirection) {
    return this._tasksGrpcService.list$(
      {
        pageIndex: 0,
        pageSize: 1,
        sort: { active, direction }
      },
      [[{
        field: TaskSummaryEnumField.TASK_SUMMARY_ENUM_FIELD_SESSION_ID,
        for: 'root',
        operator: FilterStringOperator.FILTER_STRING_OPERATOR_EQUAL,
        value: sessionId
      }]]
    ).pipe(map(taskData => {
      return {
        date: active === 'endedAt' ? taskData.tasks?.at(0)?.endedAt : taskData.tasks?.at(0)?.createdAt,
        sessionId: sessionId
      };
    }));
  }

  orderByDuration() {
    this.data.sort((a, b) => {
      if (this.options.sort.direction === 'asc') {
        return Number(a.duration?.seconds) - Number(b.duration?.seconds);
      } else {
        return Number(b.duration?.seconds) - Number(a.duration?.seconds);
      }
    });
  }

  durationSubscription(data: {sessionId: string, date: Timestamp | undefined}, type: 'ended' | 'created') {
    if (type === 'ended') {
      this.sessionEndedDates.push({sessionId: data.sessionId, date: data.date});
    } else {
      this.sessionCreationDates.push({sessionId: data.sessionId, date: data.date});
    }
    this.computeDuration$.next();
  }
}
