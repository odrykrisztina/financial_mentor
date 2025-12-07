import { 
  Injectable, 
  signal, 
  computed, 
  inject,
  effect
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { env } from './env';
import { tap, map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export type LoginDto = { email: string; password: string };
export type AuthUser = {
  id            : number  | null;
  type          : string  | null;
  email         : string  | null;
  prefix_name   : string  | null;
  first_name    : string  | null;
  middle_name   : string  | null;
  last_name     : string  | null;
  postfix_name  : string  | null;
  gender        : 'M'|'F' | null;
  born          : string  | null;
  phone         : string  | null;
  residence     : string  | null;
  postal_code   : string  | null;
  address       : string  | null;
  img           : string  | null;
  img_type      : string  | null;
  email_verified: boolean | null;
  worker_id     : number  | null;
  rank          : string  | null;
};

export type LoginResponse = { token: string; data: AuthUser };

@Injectable({ providedIn: 'root' })
export class AuthService {

  private http = inject(HttpClient);

  private stayLoggedIn = localStorage.getItem(env.stayKey) === '1';

  private _token = signal<string | null>(
    this.stayLoggedIn ? localStorage.getItem(env.tokenKey) : null
  );

  private _user  = signal<AuthUser | null>(null);

  token = computed(() => this._token());
  readonly user = computed(() => this._user());
  readonly isLoggedIn = computed(() => !!this._token());

  constructor() {
    effect(() => {
      
      const t = this._token();
      if (!t) {
        localStorage.removeItem(env.tokenKey);
        localStorage.removeItem(env.stayKey);
        return;
      }

      if (this.stayLoggedIn) {
        localStorage.setItem(env.tokenKey, t);
        localStorage.setItem(env.stayKey, '1');
      } else {
        localStorage.removeItem(env.tokenKey);
        localStorage.removeItem(env.stayKey);
      }
    });
  }

  setStayLoggedIn(value: boolean) { this.stayLoggedIn = value; }
  getUser(): AuthUser | null { return this.user(); }
  isLogged(): boolean { return this.isLoggedIn(); }

  setUser(user: AuthUser | null) {
    this._user.set(user);
  }
  
  login(dto: LoginDto) {
    return this.http.post<LoginResponse>(`${env.apiBase}/auth/login`, dto).pipe(
      tap(res => {
        this._token.set(res.token);
        this._user.set(res.data);
      })
    );
  }

  me() {
    return this.http.get<{ data: AuthUser }>(`${env.apiBase}/auth/me`).pipe(
      map(res => res.data),
      tap(user => this._user.set(user))
    );
  }

  refreshMe() {
    this.http.get<{ data: AuthUser }>(`${env.apiBase}/auth/me`)
      .pipe(map(res => res.data))
      .subscribe({
        next: user => this._user.set(user),
        error: () => this._hardLogout()
      });
  }

  logout() {
    this.http.post(`${env.apiBase}/auth/logout`, {})
    .pipe(
      catchError(() => of(null))
    )
    .subscribe({
      next: () => this._hardLogout(),
      error: () => this._hardLogout()
    });
  }

  private _hardLogout() {
    localStorage.removeItem(env.tokenKey);
    sessionStorage.removeItem(env.tokenKey);
    this._token.set(null);
    this._user.set(null);
  }

  ensureSession() {
    if (this._user()) return of(true);

    const t = this._token();
    if (!t) return of(false);

    return this.http.get<{ data: AuthUser }>(`${env.apiBase}/auth/me`).pipe(
      map(res => res.data),
      tap(user => this._user.set(user)),
      map(() => true),
      catchError(() => {
        this._hardLogout();
        return of(false);
      })
    );
  }
}
