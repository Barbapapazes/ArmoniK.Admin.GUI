import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilterDefinition } from '@app/sessions/services/sessions-filters.service';
import { DATA_FILTERS_SERVICE } from '@app/tokens/filters.token';
import { Filter } from '@app/types/filters';
import { FiltersService } from '@services/filters.service';
import { UtilsService } from '@services/utils.service';
import { FiltersChipsComponent } from './filters-chips.component';

describe('FiltersChipsComponent', () => {
  let component: FiltersChipsComponent<number, number | null>;
  let fixture: ComponentFixture<FiltersChipsComponent<number, number | null>>;
  const mockDataFilterService = {
    retrieveFiltersDefinitions: jest.fn(() => {
      return filterDefinitions;
    }),
    retrieveLabel: jest.fn()
  };
  const filterDefinitions: FilterDefinition<number, number>[] = [
    {
      field: 4,
      type: 'number',
      for: 'root'
    },
    {
      field: 1,
      type: 'status',
      for: 'root',
      statuses: [
        {key: 'status1', value: 'dispatched'},
        {key: 'status2', value: 'completed'}
      ]
    },
    {
      field: 2,
      type: 'string',
      for: 'options'
    },
    {
      field: 3,
      type: 'array',
      for: 'root'
    },
    ({
      field: 5,
      type: 'unknownType',
      for: 'root'
    } as unknown as FilterDefinition<number, number>)
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        FiltersChipsComponent,
        FiltersService,
        UtilsService,
        { provide: DATA_FILTERS_SERVICE, useValue: mockDataFilterService }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FiltersChipsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    mockDataFilterService.retrieveLabel.mockImplementation((for_: string, field: number) => {
      if (for_ === 'root' && field === 4) return 'number';
      else if (for_ === 'root' && field === 1) return 'status';
      else return 'other';
    });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create the content of the component', () => {
    const filter: Filter<number, number> = {
      field: 4,
      for: 'root',
      operator: 1,
      value: 2
    };
    expect(component.content(filter)).toEqual('number Not Equal 2');
  });

  it('should create the content of the component with statuses', () => {
    const filter: Filter<number, number> = {
      field: 1,
      for: 'root',
      operator: 0,
      value: 'status1'
    };
    expect(component.content(filter)).toEqual('status Equal dispatched');
  });

  it('should create the content of the component even with no for', () => {
    const filter: Filter<number, number> = {
      field: 1,
      for: null,
      operator: 0,
      value: 'status1'
    };
    expect(component.content(filter)).toEqual('status Equal dispatched');
  });

  it('should not create the content if there is no values', () => {
    const filter: Filter<number, number> = {
      field: 2,
      for: 'options',
      operator: 1,
      value: null
    };
    expect(component.content(filter)).toEqual('other has no value');
  });

  it('should track by filter', () => {
    const filter: Filter<number, number> = {
      field: 4,
      for: 'root',
      operator: 1,
      value: 2
    };
    expect(component.trackByFilter(0, filter)).toEqual('4');
  });

  it('should track by filter event with null field', () => {
    const filter: Filter<number, number> = {
      field: null,
      for: 'root',
      operator: 1,
      value: 2
    };
    
    expect(component.trackByFilter(0, filter)).toEqual('');
  });
});