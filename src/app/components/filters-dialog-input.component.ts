import { NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepickerInputEvent, MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { LuxonDateAdapter, MAT_LUXON_DATE_ADAPTER_OPTIONS, MAT_LUXON_DATE_FORMATS  } from '@angular/material-luxon-adapter';
import { DateTime } from 'luxon';
import { DateType, FilterEvent, TypeField } from '@app/types/data';



@Component({
  selector: 'app-filters-dialog-input',
  template: `
<mat-form-field appearance="outline" subscriptSizing="dynamic" *ngIf="typeField === 'text'">
  <mat-label>Value</mat-label>
  <input matInput [type]="getInputType()" placeholder="Value" [value]="value ?? null" (change)="onTextChange($event)">
</mat-form-field>
<mat-form-field appearance="outline" subscriptSizing="dynamic" *ngIf="typeField === 'date'">
  <mat-label>Enter a date range</mat-label>
  <mat-date-range-input [rangePicker]="picker">
    <input matStartDate placeholder="Start date" [value]="value.start" (dateChange)="onDateChange('start', $event)">
    <input matEndDate placeholder="End date" [value]="value.end" (dateChange)="onDateChange('end', $event)">
  </mat-date-range-input>
  <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
  <mat-date-range-picker #picker></mat-date-range-picker>
</mat-form-field>
  `,
  styles: [`
mat-form-field {
  width: 100%;
}
  `],
  standalone: true,
  providers: [
    // Not working with the module import. (https://stackblitz.com/edit/components-issue-j5ktcc?file=src/app/not-working-datepicker.component.ts)
    {provide: MAT_DATE_FORMATS, useValue: MAT_LUXON_DATE_FORMATS},
    {
      provide: DateAdapter,
      useClass: LuxonDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_LUXON_DATE_ADAPTER_OPTIONS],
    },
  ],
  imports: [
    NgIf,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
  ],
})
export class FiltersDialogInputComponent {
  @Input({ required: true }) typeField: TypeField = 'text';
  // Type of value is defined by type field. (replace any by the correct type)
  @Input({ required: true }) value: any = null;

  // Maybe we will need to emit the type of value in order to be able to correctly handle the value.
  // Créer des types en fonction du type de champ
  @Output() valueChange: EventEmitter<FilterEvent> = new EventEmitter<FilterEvent>();

  onTextChange(event: Event): void {
    this.valueChange.emit({
      type: 'text',
      value: (event.target as HTMLInputElement).value,
    });
  }

  onDateChange(dateType: DateType, event: MatDatepickerInputEvent<DateTime>): void {
    this.valueChange.emit({
      type: `date-${dateType}`,
      value: event.value,
    });
  }

  getInputType(): string {
    switch (this.typeField) {
    case 'text':
      return 'text';
    case 'number':
      return 'number';
    case 'boolean':
      return 'checkbox';
    default:
      return 'text';
    }
  }
}
