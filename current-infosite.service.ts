import { Injectable } from '@angular/core';
import { Infosite } from '../models/allEntity';
import { Staff } from '../models/allEntity';
import { Labor } from '../models/allEntity';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from 'rxjs/Observable';
import { isNullOrUndefined } from 'util';

@Injectable()
export class CurrentInfositeService {
    getCurrencyChoiceForCountry(): any {
        ;
    }

  infosite: Infosite = Infosite.blankIs();
  private topic: BehaviorSubject<Infosite>;
  public compSummary: number = 0;
  public compSummaryNumber: number = 0;
  public compEco: number = 0;
  public compEcoNumber: number = 0;
  public compStaff: number = 0;
  public compStaffNumber: number = 0;
  public compLabor: number = 0;
  public compLaborNumber: number = 0;
  public compTotal: number = 0;
  public compTotalNumber: number = 0;
  private completedSummary: BehaviorSubject<number>;
  private completedSummaryNumber: BehaviorSubject<number>;
  private completedEco: BehaviorSubject<number>;
  private completedEcoNumber: BehaviorSubject<number>;
  private completedStaff: BehaviorSubject<number>;
  private completedStaffNumber: BehaviorSubject<number>;
  private completedLabor: BehaviorSubject<number>;
  private completedLaborNumber: BehaviorSubject<number>;
  private completedTotal: BehaviorSubject<number>;
  private completedTotalNumber: BehaviorSubject<number>;
  private totalCalculation: BehaviorSubject<boolean>;

  constructor() {
    this.topic = new BehaviorSubject<Infosite>(this.infosite);
    this.completedSummary = new BehaviorSubject<number>(this.compSummary);
    this.completedSummaryNumber = new BehaviorSubject<number>(this.compSummaryNumber);
    this.completedEco = new BehaviorSubject<number>(this.compEco);
    this.completedEcoNumber = new BehaviorSubject<number>(this.compEcoNumber);
    this.completedStaff = new BehaviorSubject<number>(this.compStaff);
    this.completedStaffNumber = new BehaviorSubject<number>(this.compStaffNumber);
    this.completedLabor = new BehaviorSubject<number>(this.compLabor);
    this.completedLaborNumber = new BehaviorSubject<number>(this.compLaborNumber);
    this.completedTotal = new BehaviorSubject<number>(this.compTotal);
    this.completedTotalNumber = new BehaviorSubject<number>(this.compTotalNumber);
    this.totalCalculation = new BehaviorSubject<boolean>(false);
  }

  //Completed Summary
  public getCompletedSummary(): Observable<number> {
    return this.completedSummary;
  }
  public setCompletedSummary(total: number) {
    this.compSummary = total;
    this.completedSummary.next(this.compSummary);
  }
  public getCompletedSummaryNumber(): Observable<number> {
    return this.completedSummaryNumber;
  }
  public setCompletedSummaryNumber(total: number) {
    this.compSummaryNumber = total;
    this.completedSummaryNumber.next(this.compSummaryNumber);
  }

  //Completed Eco
  public getCompletedEco(): Observable<number> {
    return this.completedEco;
  }
  public setCompletedEco(total: number) {
    this.compEco = total;
    this.completedEco.next(this.compEco);
  }
  public getCompletedEcoNumber(): Observable<number> {
    return this.completedEcoNumber;
  }
  public setCompletedEcoNumber(total: number) {
    this.compEcoNumber = total;
    this.completedEcoNumber.next(this.compEcoNumber);
  }

  //Completed Staffs
  public getCompletedStaff(): Observable<number> {
    return this.completedStaff;
  }
  public setCompletedStaff(total: number) {
    this.compStaff = total;
    this.completedStaff.next(this.compStaff);
  }
  public getCompletedStaffNumber(): Observable<number> {
    return this.completedStaffNumber;
  }
  public setCompletedStaffNumber(total: number) {
    this.compStaffNumber = total;
    this.completedStaffNumber.next(this.compStaffNumber);
  }

  //Completed Labor
  public getCompletedLabor(): Observable<number> {
    return this.completedLabor;
  }
  public setCompletedLabor(total: number) {
    this.compLabor = total;
    this.completedLabor.next(this.compLabor);
  }
  public getCompletedLaborNumber(): Observable<number> {
    return this.completedLaborNumber;
  }
  public setCompletedLaborNumber(total: number) {
    this.compLaborNumber = total;
    this.completedLaborNumber.next(this.compLaborNumber);
  }

  //Completed Total
  public getCompletedTotal(): Observable<number> {
    return this.completedTotal;
  }
  public setCompletedTotal(total: number) {
    this.compTotal = total;
    this.completedTotal.next(this.compTotal);
  }
  public getCompletedTotalNumber(): Observable<number> {
    return this.completedTotalNumber;
  }
  public setCompletedTotalNumber(total: number) {
    this.compTotalNumber = total;
    this.completedTotalNumber.next(this.compTotalNumber);
  }

  public getCurrentIS(): Observable<Infosite> {
    return this.topic;
  }

  public getTotalSubscription(): Observable<boolean> {
    return this.totalCalculation;
  }

  public setInfosite(infosite: Infosite) {
    this.infosite = infosite;
    this.infosite.staffs = infosite.staffs.sort((a: Staff, b: Staff) => {
      return a.type.sortBy - b.type.sortBy;
    });
    this.topic.next(this.infosite);
  }

  public getStaffs(): Staff[] {
    return this.infosite.staffs;
  }

  public getStaff(id: number) {
    if (isNullOrUndefined(this.infosite.staffs)) return null;
    return this.infosite.staffs.filter(x => x.id === id);
  }
  public getStaffByType(id: number) {
    return this.infosite.staffs.filter(x => x.type.id === id);
  }

  public getLabor(id: number) {
    return this.infosite.labors.filter(x => x.id === id);
  }

  public getLabors(): Labor[] {
    return this.infosite.labors;
  }

  public calculateTotal() {
    this.totalCalculation.next(true);
  }
}
