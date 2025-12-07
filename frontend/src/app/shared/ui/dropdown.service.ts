import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type MenuId = 'user' | 'lang' | 'services' | 'navbar' | 'msg';

type State = Record<MenuId, boolean>;

const DEFAULT_STATE: State = {
  user: false,
  lang: false,
  services: false,
  navbar: false,
  msg: false,
};

@Injectable({ providedIn: 'root' })

export class DropdownService {

  private _state: State = { ...DEFAULT_STATE };
  private _state$ = new BehaviorSubject<State>({ ...this._state });
  readonly state$ = this._state$.asObservable();

  isOpen(id: MenuId): boolean {
    return this._state[id] === true;
  }

  open(id: MenuId): void {
    this._state[id] = true;
    this._emit();
  }

  close(id: MenuId): void {
    this._state[id] = false;
    this._emit();
  }

  toggle(id: MenuId): void {
    this._state[id] = !this._state[id];
    this._emit();
  }

  closeAll(): void {
    (Object.keys(this._state) as MenuId[]).forEach(k => (this._state[k] = false));
    this._emit();
  }

  closeAllExcept(id: MenuId): void {
    (Object.keys(this._state) as MenuId[]).forEach(k => {
      if (k !== id) this._state[k] = false;
    });
    this._emit();
  }

  exclusiveToggle(id: MenuId): void {
    const newValue = !this._state[id];
    this.closeAll();
    this._state[id] = newValue;
    this._emit();
  }

  private _emit() {
    this._state$.next({ ...this._state });
  }
}
