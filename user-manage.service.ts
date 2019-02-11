import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { AccessRight } from '../../models/access-rights';
import { API_URL } from '../../utils/config';
import { User } from '../../models/allEntity';
import { JsonConverterService } from '../json-converter.service';
import { map } from 'rxjs/operators';

interface IRight {
  [key: string]: AccessRight[];
}

@Injectable()
export class CurrentUserService {

  apiUrl = `${API_URL}/user`;
  private accessRights: IRight = {};
  updated = false;

  public CurrentUser: User;
  private CurrentUser$: BehaviorSubject<User>;

  constructor(private http: HttpClient,
    private _j: JsonConverterService) {
    this.CurrentUser$ = new BehaviorSubject<User>(null);
  }

  public setCurrentUser(User: User) {
    this.updated = true;
    this.CurrentUser = User;
    this.CurrentUser$.next(this.CurrentUser);
    this.setPermissions();
  }

  private setPermissions() {
    this.accessRights = <IRight>this.CurrentUser.role.rights;
  }

  public hasPermission(permission: string): boolean {

    if (!this.updated) {
      return false;
    }

    const [role, right] = permission.split('.');

    if (role === undefined || right === undefined) {
      return false;
    }

    if (this.accessRights === undefined || this.accessRights === null) {
      return false;
    }

    if (Array.from(Object.keys(this.accessRights)).indexOf(role) === -1) {
      return false;
    }

    const result = this.accessRights.hasOwnProperty(role) &&
      this.accessRights[role].hasOwnProperty(right) &&
      this.accessRights[role][right];

    return result;

  }

  public isUpdated(): boolean {
    return this.updated;
  }

  public getCurrentUser(): Observable<User> {
    return this.CurrentUser$;
  }

  public getCurrentUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`,
      { responseType: 'json' })
      .pipe(map(data => {
        let res = this
          ._j
          .jsonConvert
          .deserializeObject(data, User);
        return res;
      }));
      ;
  }



}
