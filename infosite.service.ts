import { Injectable } from '@angular/core';
import {Observable} from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
import { Infosite, SearchQuery, Plant } from '../../models/allEntity';
import {API_URL} from '../../utils/config';
import { JsonConverterService } from '../json-converter.service';
import { map } from 'rxjs/operators';

@Injectable()
export class InfositeService {

  apiUrl = `${API_URL}/infosite`;

  constructor(
    private http: HttpClient,
    private _j: JsonConverterService
  ) {

  }

  apiUrlDraft = `${API_URL}/infosite/draft`;
  apiUrlSubmit = `${API_URL}/infosite/submit`;
  apiUrlUpload = `${API_URL}/decoder`;

  public upload(form: FormData): Observable<Infosite> {
    return this.http.post<Infosite>(this.apiUrlUpload, form)
      .pipe(map(data => {
        let res: Infosite = this
          ._j
          .jsonConvert
          .deserializeObject(data, Infosite);

        res.labors = res.labors.sort((a, b) => a.infositeIndex - b.infositeIndex);

        return res;
      }));
  }

  public draft(infosite: Infosite): Observable<Infosite> {
    return this.http.post<Infosite>(this.apiUrlDraft, infosite);
  }
  public submit(infosite: Infosite): Observable<Infosite> {
    return this.http.post<Infosite>(this.apiUrlSubmit, infosite);
  }

  public getInfosites(): Observable<Infosite[]> {
    return this.http.get<Infosite[]>(this.apiUrl,
      { responseType: 'json' })
      .pipe(map(data => {
      let res: Infosite[] = this
        ._j
        .jsonConvert
          .deserializeArray(data, Infosite);

        res.forEach((i) => {
          i.plant = this._j.jsonConvert.deserializeObject(i.plant, Plant);
        });

      return res;
    }));
  }

  public add(infosite: Infosite): Observable<Infosite> {
    return this.http.post<Infosite>(this.apiUrl, infosite);
  }

  public update(infosite: Infosite): Observable<Infosite> {
    return this.http.put<Infosite>(this.apiUrl, infosite);
  }

  public remove(infosite: Infosite): Observable<Infosite> {
    return this.http.delete<Infosite>(`${this.apiUrl}/${infosite.id}`, {});
  }

  public getInfosite(id: number): Observable<Infosite> {
    return this.http.get<Infosite>(`${this.apiUrl}/${id}`,
      { responseType: 'json' })
      .pipe(map(data => {
        let res: Infosite = this
          ._j
          .jsonConvert
          .deserializeObject(data, Infosite);

        res.plant = this._j.jsonConvert.deserializeObject(data.plant, Plant);

        res.labors = res.labors.sort((a, b) => a.infositeIndex - b.infositeIndex);

        return res;
      }));
  }

  public findBy(query: SearchQuery): Observable<Infosite[]> {
    return this.http.post<Infosite[]>(`${this.apiUrl}/findBy`, query,
      { responseType: 'json' })
      .pipe(map(data => {
        let res = this
          ._j
          .jsonConvert
          .deserializeArray(data, Infosite);
        return res;
      }));
  }
}
