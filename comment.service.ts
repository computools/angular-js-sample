import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { IsComment } from '../../models/comment';
import { API_URL } from '../../utils/config';

@Injectable()
export class CommentService {

  private comments: IsComment[] = [];

  apiUrl = `${API_URL}/isComment`;

  constructor(private http: HttpClient) {
  }

  public setIsComments(comments: IsComment[]) {
    if (comments != null) {
      this.comments = comments;
    }
  }
  public getIsComments(): Observable<IsComment[]> {
    return Observable.of(this.comments);
  }

  public getComments(): Observable<IsComment[]> {
    return this.http.get<IsComment[]>(this.apiUrl);
  }

  public add(comment: any): Observable<IsComment> {
    let _comment: IsComment = <IsComment>{
      infositeId: comment.infositeId,
      body: JSON.stringify(comment.body),
      userId: comment.userId
    };

    return this.http.post<IsComment>(this.apiUrl, _comment);
  }

  public update(comment: IsComment): Observable<IsComment> {
    return this.http.put<IsComment>(this.apiUrl, comment);
  }

  public remove(comment: IsComment): Observable<IsComment> {
    return this.http.delete<IsComment>(`${this.apiUrl}/${comment.id}`, {});
  }

  public getComment(id: number): Observable<IsComment> {
    return this.http.get<IsComment>(`${this.apiUrl}/${id}`, {});
  }
}
