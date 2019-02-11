import { Component, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs/Subscription';
import { FormBuilder, FormGroup } from '@angular/forms';
import { COLUMN_LEFT, COLUMN_RIGHT, Field, ISFields, ISHelper } from '../../../../models/infosite';
import { Infosite, Plant, Labor, Country, Currency } from '../../../../models/allEntity';
import { IsComment } from '../../../../models/comment';
import { PlantService } from '../../../../services/api/plant.service';
import { CommentService } from '../../../../services/api/comment.service';
import { CurrencyService } from '../../../../services/api/currency.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LoaderService } from '../../../../services/shared/loader.service';
import { MatSnackBar } from '@angular/material';
import { CurrentUserService } from '../../../../services/state/user-manage.service';
import { User } from '../../../../models/allEntity';
import { LoaderHelper } from '../../../../utils/promise';
import 'rxjs/add/operator/throttleTime';
import { PageScrollService } from '../../../../services/shared/page-scroll.service';
import { isNullOrUndefined } from 'util';
import { InfositeEditService } from '../../../../services/state/infosite-edit.service';
@Component({
  selector: 'app-infosite-view-detail',
  templateUrl: './infosite-view-detail.component.html',
  styleUrls: ['./infosite-view-detail.component.sass']
})
export class InfositeViewDetailComponent implements OnInit {

  public state: number;
  public plantId: string;

  sub: Subscription;

  ready = false;
  showMaps = false;
  visible = false;

  fileGroup: FormGroup;
  file: HTMLInputElement;

  public plant: Plant = new Plant();
  public currencies: Currency[] = [];
  public currencyId: number;
  public social: Object[] = [];


  public get infosite(): Infosite {
    return this._d.CurrentInfosite;
  };
  public columnLeft: ISFields[] = COLUMN_LEFT;
  public columnRight: ISFields[] = COLUMN_RIGHT;
  public isViewPlant = false;

  public get showEditIS(): boolean {
    if (this.user.isSuperUser) return true;
    if (isNullOrUndefined(this.plant)) return false;
    if (isNullOrUndefined(this.plant.infosite)) return false;

    let res = false;
    if (this.user.group.name === 'Supplier') {
      res = true;
    }
    if (isNullOrUndefined(this.plant.infosite.valid)) {
      res = res && true;
    } else {
      if (this.plant.infosite.valid)
        res = false;
      else
        res = res && true;
    }
    return res;
  }



  public get user(): User {
    return this._u.CurrentUser;
  };

  public ecoCommentsVisible: string = '';
  public ecoComments_EMPTY: any[] = [
    {code:"A1",text:""},{code:"A2",text:""},{code:"B1",text:""},{code:"C1",text:""},{code:"C2",text:""},
    {code:"C3",text:""},{code:"D1",text:""},{code:"E1",text:""},{code:"E2",text:""},{code:"E3",text:""},
    {code:"F1",text:""},{code:"F2",text:""},{code:"G1",text:""},{code:"G2",text:""},{code:"G3",text:""},
    {code:"G4",text:""},{code:"G5",text:""},{code:"G6",text:""},{code:"H1",text:""},{code:"H2",text:""},
    {code:"I1",text:""},{code:"I2",text:""},{code:"J1",text:""},{code:"K1",text:""},{code:"K2",text:""}];
  public ecoComments: any[];
  public staffComments: any[];
  public laborComments: any[];

  constructor(
    public _d: InfositeEditService,
    public _u: CurrentUserService,
    private commentService: CommentService,
    private snackBar: MatSnackBar,
    private currencyService: CurrencyService,
    private route: ActivatedRoute,
    public router: Router,
    private loaderService: LoaderService,
    private _formBuilder: FormBuilder,
    private scrollService: PageScrollService,
    private location: Location
  ) {
    this.state = 0;
    this.ecoComments = this.ecoComments_EMPTY;
  }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this._d.loadIS(parseInt(params['id'], 10));
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
  getCommentText(code: string): string {
    return this.ecoComments.filter(item => item.code === code)[0].text;
  }

  showCommentEditor(code: string): void {
    this.ecoCommentsVisible = this.ecoComments.filter(item => item.code === code)[0].code;
  }
  saveEcoComment(code: string, commentText: string): void {
    if (commentText == "") return;
    switch (code) {
      case 'staff':
        if (this.staffComments[0] = commentText) return;
        this.staffComments[0] = commentText;
        break;

      case 'labor':
        if (this.laborComments[0] == commentText) return;
        this.laborComments[0] = commentText;
        break;

      default:
        if (this.ecoComments[this.ecoComments.findIndex(item => item.code == code)].text == commentText) return;
        this.ecoComments[this.ecoComments.findIndex(item => item.code == code)].text = commentText;
        break;
    }
    // save comments to server
    this.commentService.add({
      body: {
        ecoComments: this.ecoComments || [],
        staffComments: this.staffComments || [],
        laborComments: this.laborComments || []
      },
      infositeId: this.infosite.id,
      userId: this.user.id,
    }).subscribe(data => {
      this.ecoCommentsVisible = '';
    });

  }

  public setComments(comments: IsComment) {
    let _body: any = {};
    if (comments && comments.body) {
      _body = JSON.parse(comments.body);
    }

    this.ecoComments = _body.ecoComments || this.ecoComments_EMPTY;
    this.staffComments = _body.staffComments || [];
    this.laborComments = _body.laborComments || [];

  }
  fieldChangeCallback(e) {
    this.ecoComments.forEach(com => {
      if (e.prefix === com.code) {
        com.text = e.comment;
      }
    });
    this.columnLeft.forEach(left => {
      left.fields.forEach(field => {
        if (field.name === e.prefix) {
          field.comment = e.comment;
        }
      });
    });
    this.columnRight.forEach(right => {
      right.fields.forEach(field => {
        if (field.name === e.prefix) {
          field.comment = e.comment;
        }
      });
    });
  }

  fieldChangeStaffsCommentsCallback(e) {
    this.staffComments = e;
  }

  fieldChangeLaborsCommentsCallback(e) {
    this.laborComments = e;
  }

  private setShow(state: boolean) {
    this.visible = state;
  }

  public setCurrencies(currencies: Currency[]) {
    this.currencies = currencies;
  }

  public gotoGlossary() {
    this.router.navigate(['/glossary']);
  }

  public initialize() {
    this.initRoute();
    this.initForms();
    this.loaderService.show();
  }

  public initRoute() {
  }


  public getPostfix(field: string): string {
    return ISHelper.getPostfix(field);
  }

  public set(data) {
    this.clearFields(this.columnLeft);
    this.clearFields(this.columnRight);

    Object.keys(data).forEach(key => {
      this.populate(key);
    });
  }

  public initForms() {
    this.fileGroup = this._formBuilder.group({
      file: [''],
    });
  }

  public initCurrency() {
    this.currencyService
      .getCurrencies()
      .subscribe(
        data => {
          this.currencies = data;
        },
        error => {
        });
  }

  public populate(key: string) {
    ['A', 'B', 'C', 'D', 'E', 'F'].indexOf(key.substr(0, 1)) !== -1 ? this.left(key) : this.right(key);
  }

  clearFields(fields: ISFields[]) {
    fields.forEach(field => {
      if (field.fields.length >= 0) {
        field.fields = [];
      }
    });
  }

  public left(key: string) {
    this.columnLeft.forEach(field => {
      if (key.startsWith(field.prefix)) {
        this.ecoComments.forEach(com => {
          if (key === com.code) {
            field.fields.push(<Field>{ name: key, value: this.infosite[key], comment: com.text });
          }
        });
      }
    });
  }

  public right(key: string) {
    this.columnRight.forEach(field => {
      if (key.startsWith(field.prefix)) {
        this.ecoComments.forEach(com => {
          if (key == com.code) {
            field.fields.push(<Field>{ name: key, value: this.infosite[key], comment: com.text });
          }
        });
      }
    });
  }

  setFile(file: HTMLInputElement) {
    this.file = file;
  }

  public validateIS() {
    this.infosite.valid = true;
    this.saveIS();
  }

  public saveIS() {
    this.infosite.plant = <Plant>{ id: this.plant.id };


  }

  showMessage(msg: string) {
    this.snackBar.open(msg, '', { duration: 2000 });
  }

  addNewLabor() {
  }

  public scroll(): void {

    const x = 0;
    let y = 0;

    if (!this.visible) {
      y = 9999;
    }

    try {
      window.scrollTo({ left: x, top: y, behavior: 'smooth' });
    } catch (e) {
      window.scrollTo(x, y);
    }

  }

  selectChange(event: any) {
    this.state = event.index;
  }

  getSocialData(obj: Object) {
    for (const keyObj in obj) {
      if ((keyObj === 'facebook' || keyObj === 'twitter' || keyObj === 'instagram' || keyObj === 'pinterest' || keyObj === 'linkedin' || keyObj === 'youtube' || keyObj === 'googlePlus') && (obj[keyObj] !== null && obj[keyObj].length)) {
        const newObj: any = {};
        newObj.name = keyObj;
        newObj.value = obj[keyObj];
        this.social.push(newObj);
      }
    }
  }

  public back() {
    this.location.back();
  }

  /// methods
  public filterValidationDate(start: Date, end: Date) {
    if (start && end) {
      const startDate = new Date(start);
      const endDate = new Date(end);

      const timeDiff = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

      if (diffDays < 365) {
        const newDate = startDate.setFullYear(startDate.getFullYear() + 1);
        return newDate;
      }
      return end;
    }
  }

  public closeCommentEditor() {
    setTimeout(() => this.ecoCommentsVisible = '', 50);

  }

}
