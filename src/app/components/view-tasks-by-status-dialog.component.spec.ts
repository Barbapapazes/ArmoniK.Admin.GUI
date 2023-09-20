import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
import { TasksStatusesService } from '@app/tasks/services/tasks-status.service';
import { IconsService } from '@services/icons.service';
import { ViewTasksByStatusDialogComponent } from './view-tasks-by-status-dialog.component';

describe('viewTasksByStatusDialog', () => {

  let component: ViewTasksByStatusDialogComponent;
  let dialogSubject: BehaviorSubject<number | undefined>;

  beforeEach(() => {
    component = TestBed.configureTestingModule({
      providers: [
        ViewTasksByStatusDialogComponent,
        { provide: MatDialogModule, useValue: {} },
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} }, 
        { provide: MatDialog, useValue: 
            {
              open: () => {
                return {
                  close: () => {
                    return dialogSubject;
                  }
                };
              }
            } },
        
        { provide: IconsService, useValue: {} },
       
        IconsService,
        TasksStatusesService,
      ]
    }).inject(ViewTasksByStatusDialogComponent);
  });

  it('Should run', () => {
    expect(component).toBeTruthy();
  });

});