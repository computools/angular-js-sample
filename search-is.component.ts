import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { FormControl } from '@angular/forms';
import { SearchQuery, City, Country, Supplier, Plant, SiteActivity, ContractorType } from '../../models/allEntity';
import {Observable} from 'rxjs/Observable';
import {ContractorTypeService} from '../../services/api/contractor-type.service';
import {ActivityService} from '../../services/api/activity.service';
import {PlantService} from '../../services/api/plant.service';
import {CityService} from '../../services/api/city.service';
import {SupplierService} from '../../services/api/supplier.service';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {MatAutocompleteSelectedEvent, MatChipInputEvent, MatSelectChange} from '@angular/material';
import {CountryService} from '../../services/api/country.service';
import 'rxjs/add/operator/concatMap';

@Component({
  selector: 'app-search-is',
  templateUrl: './search-is.component.html',
  styleUrls: ['./search-is.component.sass']
})
export class SearchIsComponent implements OnInit {
  @ViewChild('yearsInput') yearsInput: ElementRef;

  public cityControl: FormControl;
  public activityControl: FormControl;
  public supplierControl: FormControl;
  public contractorControl: FormControl;
  public statusControl: FormControl;
  public yearsControl: FormControl;
  public countryControl: FormControl;
  public lastUpdateFromControl: FormControl;
  public lastUpdateToControl: FormControl;
  public searchControl: FormControl;

  public citySearchResults: Observable<City[]>;
  public activitySearchResults: Observable<SiteActivity[]>;
  public supplierSearchResults: Observable<Supplier[]>;
  public contractorSearchResults: ContractorType[];
  public countrySearchResults: Observable<Country[]>;

  public results: Plant[] = [];

  searchPanelHidden = true;
  activityNotSelected = true;

  constructor(private plantService: PlantService,
              private cityService: CityService,
              private activityService: ActivityService,
              private countryService: CountryService,
              private contractorService: ContractorTypeService,
              private supplierService: SupplierService) {
  }

  public availableStatuses = ['Validated', 'Not validated', 'Without infosite'];

  public availableYears = [2014, 2015, 2016, 2017, 2018];
  public selectedYears = [];

  public separatorKeysCodes = [ENTER, COMMA];

  ngOnInit() {
    this.initControls();
  }

  public displayActivityName(entity?: SiteActivity): string | undefined {
    return entity ? entity.name : undefined;
  }

  public populateContractorType(event: MatSelectChange) {
    if ( event.value !== undefined ) {
      this.activityService
        .getActivity(event.value.id)
        .subscribe(
          data => {
            this.contractorSearchResults = data.contractorType;
            this.activityNotSelected = false;
          },
          error => {
            this.dropSelectedResults();
          });
    } else {
      this.dropSelectedResults();
    }
  }

  private dropSelectedResults() {
    this.activityNotSelected = true;
    this.contractorSearchResults = [];
  }

  public displayName(entity?: City |SiteActivity|Supplier|ContractorType|Country): string | undefined {
    return entity ? entity.name : undefined;
  }


  private getService(type: string, input: string) {
    this[ type + 'SearchResults' ] = this[ type + 'Service' ].search(<City>{name: input});
  }


  private initControlChangeListener(results: string[]) {
    results.forEach( type => {
      this[type + 'Control']
        .valueChanges
        .throttleTime(100)
        .subscribe(
          input => {
            if ( input && input.length >= 2) {
              this.getService(type, input);
            }

            if ( input && input.length < 2 && type === 'activity') {
              this.dropSelectedResults();
            }
          },
          error => {
          });
    });
  }

  private initControls() {
    this.activitySearchResults = this.activityService.getActivities();

    this.clearSearchRequest();
  }

  toggleSearchPanel() {
    this.searchPanelHidden = !this.searchPanelHidden;
  }

  addYear(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    if ((value || '').trim()) {
      this.selectedYears.push( Number(value.trim()) );
      this.filterYears(value);
    }

    if (input) {
      input.value = '';
    }
  }

  private filterYears(value: string) {
    this.availableYears = this.availableYears.filter(item => item !== Number(value));
  }

  removeYear(year: any): void {
    const index = this.selectedYears.indexOf(Number(year));

    if (index >= 0) {
      this.selectedYears.splice(index, 1);
    }

    this.availableYears.push(Number(year));
    this.availableYears = this.availableYears.sort();
  }

  selectedYear(event: MatAutocompleteSelectedEvent): void {
    this.selectedYears.push( Number(event.option.viewValue) );
    this.yearsInput.nativeElement.value = '';
    this.filterYears( event.option.viewValue );
  }

  clearSearchRequest() {
    this.cityControl = new FormControl();
    this.activityControl = new FormControl();
    this.supplierControl = new FormControl();
    this.contractorControl = new FormControl();
    this.statusControl = new FormControl();
    this.yearsControl = new FormControl();
    this.countryControl = new FormControl();
    this.lastUpdateFromControl = new FormControl();
    this.lastUpdateToControl = new FormControl();
    this.searchControl = new FormControl();
    this.selectedYears = [];

    this.initControlChangeListener([
      'city',
      'activity',
      'supplier',
      'country'
    ]);

    this.activityNotSelected = true;
  }

  sendSearchRequest() {
    this.searchPanelHidden = true;

    const query = {
      infosite: this.searchControl.value,
      city: this.cityControl.value,
      country: this.countryControl.value,
      status: this.statusControl.value,
      ecoContext: this.selectedYears,
      lastUpdateFrom: this.lastUpdateFromControl.value,
      lastUpdateTo: this.lastUpdateToControl.value,
      siteActivity: this.activityControl.value,
      contactorType: this.contractorControl.value,
      supplier: this.supplierControl.value,
    } as SearchQuery;

    let isTouched = false;
    let queryCount = 0;
    for (const item in query) {
      if (!query[item]) {
        queryCount++;
      }
      else if (query[item] === '') {
        queryCount++;
      }
      else if (query[item].length === 0) {
        queryCount++;
      }
    }
    if (queryCount === 10) {
      isTouched = true;
    }
    this.plantService
      .findBy(query, true, true, isTouched)
      .subscribe(
        data => {
          this.results = data;
          // this.plantService.setPlants(this.results);
        },
        error => {
          this.results = [];
        }
      );
  }

}
