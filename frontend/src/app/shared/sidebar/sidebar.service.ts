import { Injectable, signal, computed } from '@angular/core';
import { SidebarItem, SidebarMode, SidebarPosition } from './sidebar.model';

interface SidebarState {
  position: SidebarPosition;
  mode: SidebarMode;
  open: boolean;
  canPin: boolean;
  items: SidebarItem[];
}

@Injectable({ providedIn: 'root' })
export class SidebarService {

  private _left = signal<SidebarState>({
    position: 'left',
    mode: 'overlay',
    open: false,
    canPin: true,
    items: [],
  });

  private _right = signal<SidebarState>({
    position: 'right',
    mode: 'overlay',
    open: false,
    canPin: true,
    items: [],
  });

  left  = computed(() => this._left());
  right = computed(() => this._right());

  selectedItemId = signal<string | null>(null);

  setSelectedItem(id: string | null) {
    this.selectedItemId.set(id);
  }
  
  clearSelectedItem() {
    this.selectedItemId.set(null);
  }
  
  getState(position: SidebarPosition) {
    return position === 'left' ? this._left : this._right;
  }
  
  leftIsFixedAndOpen  = computed(
    () => this._left().mode === 'fixed'  && this._left().open
  );
  
  rightIsFixedAndOpen = computed(
    () => this._right().mode === 'fixed' && this._right().open
  );

  setMenu(position: SidebarPosition, items: SidebarItem[], opts?: {
    mode?: SidebarMode;
    open?: boolean;
  }) {
    const normalized = this.normalize(items);
    const state = position === 'left' ? this._left() : this._right();
    const next: SidebarState = {
      ...state,
      items: normalized,
      mode: opts?.mode ?? state.mode,
      open: opts?.open ?? state.open,
    };
    position === 'left' ? this._left.set(next) : this._right.set(next);
  }

  clearMenu(position: SidebarPosition) {
    const state = position === 'left' ? this._left() : this._right();
    const next: SidebarState = { ...state, items: [], open: false };
    position === 'left' ? this._left.set(next) : this._right.set(next);
  }

  toggle(position: SidebarPosition) {
    const state = position === 'left' ? this._left() : this._right();
    const newOpen = !state.open;
    this.setOpen(position, newOpen);
  }

  setOpen(position: SidebarPosition, open: boolean) {
    const targetSignal = position === 'left' ? this._left : this._right;
    const otherSignal  = position === 'left' ? this._right : this._left;

    const currentTarget = targetSignal();
    const nextTarget: SidebarState = { ...currentTarget, open };
    targetSignal.set(nextTarget);

    if (open && otherSignal().mode === 'overlay') {
      const otherState = otherSignal();
      const closed: SidebarState = { ...otherState, open: false };
      otherSignal.set(closed);
    }
  }

  setMode(position: SidebarPosition, mode: SidebarMode) {
    const state = position === 'left' ? this._left() : this._right();
    const next: SidebarState = { ...state, mode };
    position === 'left' ? this._left.set(next) : this._right.set(next);
  }

  updateViewport(width: number) {
    const isMobile = width < 768;

    const patch = (state: SidebarState): SidebarState => {
      if (isMobile) {
        return {
          ...state,
          mode: 'overlay',
          canPin: false,
        };
      }
      return {
        ...state,
        canPin: true,
      };
    };

    this._left.set(patch(this._left()));
    this._right.set(patch(this._right()));
  }

  private closeIfNotFixed(position: SidebarPosition) {
    const signal = position === 'left' ? this._left : this._right;
    const state = signal();

    if (state.mode === 'fixed' || !state.open) return;

    signal.set({ ...state, open: false });
  }

  closeAllNotFixed() {
    this.closeIfNotFixed('left');
    this.closeIfNotFixed('right');
  }

  private normalize(items: SidebarItem[], prefix = ''): SidebarItem[] {

    const result: SidebarItem[] = [];
    let index = 1;

    for (const it of items) {

      let vis = true;
      if (typeof it.visible === 'boolean') vis = it.visible;
      if (typeof it.visible === 'function') vis = !!it.visible();
      if (!vis) continue;

      const id = it.id ?? (prefix ? `${prefix}.${index}` : `${index}`);
      const clone: SidebarItem = { ...it, id };

      if (it.children && it.children.length) {
        clone.children = this.normalize(it.children, id);
      }

      result.push(clone);
      index++;
    }

    return result;
  }
}
