import { Injectable } from '@angular/core';
import { Observable, takeUntil } from 'rxjs';
import { GrpcParams } from '../../types/grpc-params.type';
import {
  CancelTasksRequest,
  CancelTasksResponse,
  GetTaskRequest,
  GetTaskResponse,
  ListTasksRequest,
  ListTasksResponse,
} from '../../types/proto/tasks-common.pb';
import { TasksClient } from '../../types/proto/tasks-service.pbsc';
import { BaseGrpcService } from './base-grpc.service';

@Injectable()
export class GrpcTasksService extends BaseGrpcService {
  constructor(private _tasksClient: TasksClient) {
    super();
  }

  public list$(
    params: GrpcParams<
      ListTasksRequest.OrderByField,
      ListTasksRequest.OrderDirection
    >
  ): Observable<ListTasksResponse> {
    const options = new ListTasksRequest({
      page: params.page || 0,
      pageSize: params.pageSize || 10,
      sort: {
        field:
          params.orderBy ||
          ListTasksRequest.OrderByField.ORDER_BY_FIELD_CREATED_AT,
        direction:
          params.order || ListTasksRequest.OrderDirection.ORDER_DIRECTION_DESC,
      },
      filter: {},
    });

    return this._tasksClient.listTasks(options).pipe(takeUntil(this._timeout$));
  }

  public get$(taskId: string): Observable<GetTaskResponse> {
    const options = new GetTaskRequest({
      taskId,
    });

    return this._tasksClient.getTask(options).pipe(takeUntil(this._timeout$));
  }

  public cancel$(taskIds: string[]): Observable<CancelTasksResponse> {
    const options = new CancelTasksRequest({
      taskIds,
    });

    return this._tasksClient
      .cancelTasks(options)
      .pipe(takeUntil(this._timeout$));
  }
}