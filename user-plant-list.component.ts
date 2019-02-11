import {AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {PlantService} from '../../../services/api/plant.service';
import { Plant, SearchQuery} from '../../../models/allEntity';
import {CurrentUserService} from '../../../services/state/user-manage.service';
import {User} from '../../../models/allEntity';

@Component({
  selector: 'app-user-plant-list',
  templateUrl: './user-plant-list.component.html',
  styleUrls: ['./user-plant-list.component.sass']
})
export class UserPlantListComponent implements OnInit, OnChanges, AfterViewInit {

  @Input('limit') limit: number;
  @Input('inline') inline: boolean;
  @Input('mainPage') mainPage: boolean;
  @Input('pagination') pagination: boolean;
  @Input('sort') sort: boolean;
  @Input('inputData') inputData: Plant[];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sorting: MatSort;

  public displayedColumnsList = ['id', 'valid', 'supplier', 'activity', 'contractor', 'validTill', 'lastUpdateDate', 'lastUpdateUser'];
  public showMy: boolean = false;
  public showNotMy: boolean = false;

  public data: MatTableDataSource<Plant>;
  public name: string;
  public dataLength: number;

  public dataChanged: boolean;
  private user: User = new User();

  constructor(public plantService: PlantService,
              public router: Router,
              private userService: CurrentUserService
  ) {
    this.dataChanged = false;
    this.data = new MatTableDataSource([]);
    this.setFeatures();
  }
  showMyInfosites() {
    this.showNotMy = false;
    if(!this.showMy) {
      const obj = {
        city: null,
        contactorType: null,
        country: null,
        ecoContext: [],
        infosite: null,
        lastUpdateFrom: null,
        lastUpdateTo: null,
        siteActivity: null,
        status: null,
        supplier: null
      } as SearchQuery;

      this.plantService
        .findBy(obj, this.mainPage).subscribe(data => {
        this.dataLength = data.length;
        if (this.limit) {
          data = data.slice(0, this.limit);
        }
        this.plantService.setPlants(data);
        this.data = new MatTableDataSource(data);
        this.setFeatures();
      }, error => {
      });
    }
  }
  showNotMyInfosites() {
    this.showMy = false;
    if(!this.showMy) {
      const obj = {
        city: null,
        contactorType: null,
        country: null,
        ecoContext: [],
        infosite: null,
        lastUpdateFrom: null,
        lastUpdateTo: null,
        siteActivity: null,
        status: null,
        supplier: null
      } as SearchQuery;

      this.plantService
        .findBy(obj, this.mainPage).subscribe(data => {
        this.dataLength = data.length;
        if (this.limit) {
          data = data.slice(0, this.limit);
        }
        this.plantService.setPlants(data);
        this.data = new MatTableDataSource(data);
        this.setFeatures();
      }, error => {
      });
    }
  }
  ngOnInit() {
    this.populate();
    this.setFeatures();

    this.userService
      .getCurrentUser()
      .subscribe(user => {
        this.user = user;
      }, error => {
      });

  }

  private setFeatures() {
    if (this.pagination) {
      this.data.paginator = this.paginator;
    }

    this.data.sortingDataAccessor = (item: Plant, property) => {
      switch (property) {
        case 'activity':
          return item.contractorType.siteActivity.name;
        case 'valid':
          if (item.infosite && item.infosite.valid) {
            return item.infosite.valid;
          }
          break;
        case 'supplier':
          return item.supplier.name;
        case 'contractor':
          if (item.contractorType) {
            return item.contractorType.name;
          }
          break;
        case 'validTill':
          if (item.infosite && item.infosite.periodEnd) {
            return item.infosite.periodEnd;
          }
          break;
        case 'lastUpdateDate':
          if (item.infosite && item.infosite.updatedDate) {
            return item.infosite.updatedDate;
          }
          break;
        default:
          return item[property];
      }
    };

    this.data.sort = this.sorting;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.inputData && changes['inputData'].currentValue.length > 0) {
      this.dataChanged = true;
      this.data = new MatTableDataSource(changes['inputData'].currentValue.filter(i => i.infosite));
      this.setFeatures();
    }
  }


  delete(element) {
    this.remove(element);
  }

  add(element) {
    this.router.navigate(['admin/plant', 'new']);
  }

  edit(element) {
    this.router.navigate(['admin/plant', element.id]);
  }

  public populate() {
    const obj = {
      city: null,
      contactorType: null,
      country: null,
      ecoContext: [],
      infosite: null,
      lastUpdateFrom: null,
      lastUpdateTo: null,
      siteActivity: null,
      status: null,
      supplier: null
    } as SearchQuery;

    this.plantService
      .findBy(obj, this.mainPage).subscribe(data => {
      this.dataLength = data.length;
      if (this.limit) {
        data = data.slice(0, this.limit);
      }
      this.plantService.setPlants(data);
      this.data = new MatTableDataSource(data.filter(i => i.infosite));
      this.setFeatures();
    }, error => {
    });
  }

  public remove(element) {
    this.plantService.remove(element)
      .subscribe(data => {
        this.data = new MatTableDataSource<Plant>(this.data.data.filter(item => item !== element));
        this.setFeatures();
      }, error => {
      });
  }

  public showInfosite(row: any) {
    this.router.navigate(['plant', row.id]);
  }

  changeArrowStyle() {
    const els = document.getElementsByClassName('mat-header-cell') as HTMLCollectionOf<HTMLElement>;

    for (let i = 0; i < els.length; i++) {
      els[i].addEventListener('click', () => {
        const arrow = els[i].getElementsByClassName('mat-sort-header-arrow')[0]  as HTMLElement;

        if (arrow.style.transform === 'rotate(180deg)') {
          arrow.style.transform = '';
        } else {
          arrow.style.transform = 'rotate(180deg)';
        }

      });
    }
  }

  ngAfterViewInit() {
    this.changeArrowStyle();
  }

}
