import {Component, OnInit, ViewChild} from '@angular/core';
import {EMPTY_PLANT} from '../../../models/plant';
import {PlantService} from '../../../services/api/plant.service';
import {Observable} from 'rxjs/Observable';
import { FormControl, Validators } from '@angular/forms';
import { Supplier, Plant } from '../../../models/allEntity';
import { City, Country, ContractorType, SiteActivity } from '../../../models/allEntity';
import {Location} from '@angular/common';
import {CountryService} from '../../../services/api/country.service';
import {CityService} from '../../../services/api/city.service';
import {ActivityService} from '../../../services/api/activity.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ImageService} from '../../../services/shared/image.service';
import {CurrentUserService} from '../../../services/state/user-manage.service';
import {ContractorTypeService} from '../../../services/api/contractor-type.service';
import {SupplierService} from '../../../services/api/supplier.service';
import {User} from '../../../models/allEntity';
import {MatSelectChange} from '@angular/material';
import {NEW_EMPTY_IS} from '../../../models/infosite';
import {InfositeService} from '../../../services/api/infosite.service';
import {} from '@types/googlemaps';
import LatLng = google.maps.LatLng;
import { isNullOrUndefined } from 'util';

@Component({
  selector: 'app-add-plant',
  templateUrl: './add-plant.component.html',
  styleUrls: ['./add-plant.component.sass']
})
export class AddPlantComponent implements OnInit {
  @ViewChild('agm-map') gmap: any;
  map: google.maps.Map;
  plant: Plant = <Plant> EMPTY_PLANT;
  user: User = new User();
  plantControl: FormControl;
  countryControl: FormControl;
  cityControl: FormControl;
  activityControl: FormControl;
  supplierControl: FormControl;
  contractorControl: FormControl;
  websiteControl: FormControl;
  addressControl: FormControl;
  countrySearchResults: Observable<Country[]>;
  citySearchResults: Observable<City[]>;
  activitySearchResults: Observable<SiteActivity[]>;
  contractorSearchResults: ContractorType[];
  activityNotSelected = true;
  isNewPlant = false;
  geocoder: google.maps.Geocoder;

  fields = [
    'plant',
    'country',
    'activity',
    'supplier',
    'contractor',
    'website',
    'address'
  ];
  supplier: Supplier = new Supplier();
  zoom = 1;
  bounds;
  selectedCountry: Country;
  selectedCity: City;
  isPlantCreating = false;

  constructor(private router: Router,
              private route: ActivatedRoute,
              private countryService: CountryService,
              private cityService: CityService,
              private activityService: ActivityService,
              private contractorService: ContractorTypeService,
              private supplierService: SupplierService,
              private plantService: PlantService,
              private location: Location,
              private imageService: ImageService,
              private infositeService: InfositeService,
              private currentUser: CurrentUserService) {
  }

  // #region SiteActivity
  private _siteActivity: SiteActivity = new SiteActivity();
  public get SiteActivity(): SiteActivity {
    return this._siteActivity;
  }
  public set SiteActivity(value: SiteActivity) {
    this._siteActivity = value;
    this.contractorSearchResults = value.contractorType;
  }
  // #endregion SiteActivity

  // #region ContractorType
  // #endregion ContractorType

  // #region City
  public get City(): City {
    return this.plant.city;
  }
  public set City(value: City) {
    if (!isNullOrUndefined(this.plant.city) && !isNullOrUndefined(value)) {
      if (this.plant.city.id !== value.id) {
        // City Changed

      }
    }
    this.plant.city = value;
  }
  // #endregion City


  /// predicates
  public isNextButtonDisabled(): boolean {
    try {
      if (
        this.plant.name &&
        this.plant.contractorType &&
        this.plant.addr &&
        this.plant.city.id &&/* this.plant.country.id &&*/ this.isPlantCreating === false
      ) {
        return false;
      }
    } catch (e) {
      return false;
    }
    return true;
  }

  public countryChanged(event: any) {
    if (event.value) {
      // this.plant.country = event.value;

    }
  }

  ngOnInit() {
    this.geocoder = new google.maps.Geocoder();
    this.initControls();

    this.route.params.subscribe(params => {
      switch (params['id']) {
        case 'new':
          this.isNewPlant = true;
          this.initControlChange();
          this.getPlantFromService();
          break;
        default:
          this.getPlantFromService();
      }
    });

    this.activitySearchResults = this.activityService.getActivities();
    this.currentUser.getCurrentUser().subscribe(user => {
      this.user = user;

      this.populateSupplier();
    });
  }


  private populateSupplier() {
    if (this.isNewPlant) {
      this.supplier = this.user.supplier;
    }
  }

  navigateToCountry() {
    if (this.countryControl.value) {
      this.countryService
        .getCountry(this.countryControl.value.id)
        .subscribe(country => {
          this.selectedCountry = country;
          this.geocoder.geocode({address: country.name},
            (res, stat) => {
              const firstRes = res[0];
              if (firstRes === null || firstRes === undefined) {
                return;
              }
              const center = firstRes.geometry.location;

              this.setMarkerlatLng(center);
              if (firstRes.geometry.bounds === null || firstRes.geometry.bounds === undefined) {
                return;
              }
              this.bounds = firstRes.geometry.bounds;
            });
        }, error => {

        });
    }
  }

  navigateToCountryCity() {
    if (this.cityControl.value) {
      this.cityService
        .getCity(this.cityControl.value.id)
        .subscribe(city => {
          this.selectedCity = city;
          this.geocoder.geocode({address: (this.selectedCountry != null ? this.selectedCountry.name : '') + ', ' + city.name},
            (res, stat) => {
              const firstRes = res[0];
              if (firstRes === null || firstRes === undefined) {
                return;
              }
              const center = firstRes.geometry.location;

              this.setMarkerlatLng(center);
              if (firstRes.geometry.bounds === null || firstRes.geometry.bounds === undefined) {
                return;
              }
              this.bounds = firstRes.geometry.bounds;
            });
        }, error => {

        });
    }
  }

  private initControls() {
    this.plantControl = new FormControl(null, Validators.required);
    this.countryControl = new FormControl(null, Validators.required);
    this.cityControl = new FormControl(null, Validators.required);
    this.activityControl = new FormControl(null, Validators.required);
    this.supplierControl = new FormControl(null, Validators.required);
    this.contractorControl = new FormControl(null, Validators.required);
    this.websiteControl = new FormControl(null, Validators.required);
    this.addressControl = new FormControl(null, Validators.required);

    this.countrySearchResults = this.countryService.getCountries();
    this.citySearchResults = this.cityService.getCities();

    if (this.isNewPlant) {
      this.initControlChange();
    }
    this.initControlChange();

    // this.fields.forEach(item => {
    //   this[item + 'Control']
    //     .valueChanges
    //     .subscribe(input => {
    //       this.invalidForm = false;
    //     });
    // });
  }

  public initControlChange() {
    this.countryControl
      .valueChanges
      .debounceTime(50)
      .subscribe(input => {
        this.citySearchResults = this.filterByCountry(input);
        this.navigateToCountry();
      });

    this.cityControl
      .valueChanges
      .debounceTime(50)
      .subscribe(input => {
        this.navigateToCountryCity();
      });
  }

  private filterByCountry(country: Country): Observable<City[]> {
    return this.cityService.getCities()
      .map(city => {
        const result = city.filter(x => x.country.id === country.id);
        return result.length === 0 ? [<City>{name: 'no results', country: {}}] : result;
      });
  }

  private initControlChangeListener(results: string[]) {
    results.forEach(type => {
      this[type + 'Control']
        .valueChanges
        .throttleTime(100)
        .subscribe(
          input => {
            if (input.length >= 3) {
              this.getService(type, input);
            }
          },
          error => {
          });
    });
  }

  private getService(type: string, input: string) {
    this[type + 'SearchResults'] = this[type + 'Service'].search(<City>{name: input});
  }

  public displayName(entity: Country | City | SiteActivity | Supplier | ContractorType): string | undefined {
    return entity ? entity.name : undefined;
  }

  public setMarkerlatLng(marker: LatLng) {
    this.setMarker({coords: {lat: marker.lat(), lng: marker.lng()}});
  }

  public setMarker(marker) {
    this.plant.lat = marker.coords.lat;
    this.plant.long = marker.coords.lng;

    this.geocoder.geocode({
      location: new LatLng(marker.coords.lat, marker.coords.lng)
    }, (res, stat) => {

      const country = res[0].address_components.find((a) => {
        if (a.types.indexOf('country') >= 0) {
          return true;
        }
        return false;
      });
      const city = res[0].address_components.find((a) => {
        if (a.types.indexOf('locality') >= 0) {
          return true;
        }
        return false;
      });

      this.plant.addr = res[0].formatted_address;
    });
  }

  compareFn(c1: Country, c2: Country): boolean {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }

  setCurrentLocation(e: any) {
    if (navigator.geolocation) {
      // get current visitor location
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.setMarker({coords: {lat: pos.coords.latitude, lng: pos.coords.longitude}});
          this.zoom = 15;
        },
        (pos) => {
        });
    }
  }

  getPlantFromService() {
    if (!this.isNewPlant) {
      this.plantService.getPlant(this.plantService.getSelectedPlant().id)
        .subscribe(data => {
          this.plant = data;

          if (!!this.plant.siteActivity) {
            const obj = {value: this.plant.siteActivity} as MatSelectChange;
            this.populateContractorType(obj);
            this.contractorControl.setValue(this.plant.contractorType);
          }

          this.countryControl.setValue(this.plant.city.country.id);
          this.cityControl.setValue(this.plant.city.id);
          this.supplier = this.plant.supplier;
          this.zoom = 15;
          this.initControlChange();

        }, error => {
        });
    } else {
      this.plant = new Plant();
    }

  }


  public populateCountry(event: MatSelectChange) {
    if (event.value !== undefined) {
      this.countrySearchResults = this.countryService
        .getCountries();
    } else {
      this.dropSelectedResults();
    }
  }

  public populateContractorType(event: MatSelectChange) {
    if (event.value !== undefined) {
      this.plant.contractorType.id = event.value.id;
      this.plant.contractorType.name = event.value.name;

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

  public searchButton(type: string) {
    const inputValue = this[type + 'Control'].value || '';
    this.getService(type, inputValue);
  }

  createIs() {
//    debugger;
    let chk = 0;
    this.isPlantCreating = true;
    try {
      chk = this.plant.name && this.plant.contractorType && this.plant.addr && this.plant.city.id/* && this.plant.country.id*/;
    } catch (e) {
      chk = 0;
    }
    if (chk) {
      if (this.isNewPlant) {
        this.plant.supplier = this.supplier;
        this.plant.contractorType = this.contractorControl.value;
        this.plant.siteActivity = this.activityControl.value;
        this.plant.city = this.cityControl.value;
        // this.plant.country = this.countryControl.value;

        this.plantService.add(this.plant)
          .subscribe(data => {
            const infosite = NEW_EMPTY_IS;
            infosite.plant = data;
            const is = this.infositeService.add(infosite).subscribe(inf => {
              this.plant = new Plant();
              this.isPlantCreating = false;
              this.router.navigate(
                ['infosite/edit/', inf.id, 'summary']
              );
            });
          });
      } else {
        this.plant.contractorType = this.contractorControl.value;
        this.plant.siteActivity = this.activityControl.value;
        this.plant.city = this.cityControl.value;
        // this.plant.country = this.countryControl.value;

        this.plantService.update(this.plant)
          .subscribe((data: any) => {
            const infosite = NEW_EMPTY_IS;
            infosite.plant = this.plant;
            this.infositeService.add(infosite).subscribe((data2: any) => {
              this.isPlantCreating = false;
              this.router.navigate(
                ['infosite/edit/', data2.id, 'summary']
              );
            });
          });
      }
    }
  }
}
