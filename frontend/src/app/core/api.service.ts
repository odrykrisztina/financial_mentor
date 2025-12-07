import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { env } from './env';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private base = env.apiBase;

  get<T>(url: string, params?: any): Observable<T> {
    return this.http.get<T>(`${this.base}${url}`, { params }).pipe(catchError(this.handle));
  }
  post<T>(url: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.base}${url}`, body).pipe(catchError(this.handle));
  }
  put<T>(url: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.base}${url}`, body).pipe(catchError(this.handle));
  }
  delete<T>(url: string): Observable<T> {
    return this.http.delete<T>(`${this.base}${url}`).pipe(catchError(this.handle));
  }

  private handle(err: HttpErrorResponse) {
    return throwError(() => err);
  }
}
