import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ColumnKey } from '@app/types/data';
import { ColumnsModifyDialogComponent } from './columns-modify-dialog.component';

@Component({
  selector: 'app-columns-button',
  template: `
<button mat-stroked-button (click)="openModifyColumnsDialog()">
  <mat-icon aria-hidden="true" fontIcon="view_column"></mat-icon>
  <span i18n="Open a dialog on click">Modify Columns</span>
</button>
  `,
  styles: [`
  `],
  standalone: true,
  imports: [
    ColumnsModifyDialogComponent,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class ColumnsButtonComponent<T extends object> {
  @Input({ required: true }) displayedColumns: ColumnKey<T>[] = [];
  @Input({ required: true }) availableColumns: ColumnKey<T>[];

  @Output() displayedColumnsChange: EventEmitter<ColumnKey<T>[]> = new EventEmitter<ColumnKey<T>[]>();

  constructor(private _dialog: MatDialog) { }

  openModifyColumnsDialog(): void {
    const dialogRef = this._dialog.open(ColumnsModifyDialogComponent, {
      data: {
        currentColumns: this.displayedColumns,
        availableColumns: this.availableColumns
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) {
        return;
      }

      this.displayedColumnsChange.emit(result);
    });
  }
}
