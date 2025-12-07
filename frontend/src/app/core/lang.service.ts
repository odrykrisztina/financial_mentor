import { Inject, Injectable, signal, computed } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

const PROJECT_TITLE_KEY = "project_title";

type NameKey   = 'prefix' | 'first' | 'middle' | 'last' | 'postfix';
type NameOrder = 'west'   | 'east';
type Dir       = 'ltr'    | 'rtl';

export interface UserName {
  prefix_name?: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  postfix_name?: string;
}

export interface LangOption {
  id: string;
  dir: Dir;                
  type: NameOrder;         
  name: string;
  local: string;
  img: string;
  valid: boolean;
}

export interface NameOrderRules {
  west: Array<string>;
  east: Array<string>;
  [key: string]: Array<string>;
}

export interface LangState {
  id: string;
  index: number;
  available: LangOption[];
  data: Record<string, string>;
}

@Injectable({ providedIn: 'root' })

export class LangService {

  state: LangState = {
    id: 'en',
    index: 0,
    available: [],
    data: {}
  };

  private readonly nameOrderRules: Record<NameOrder, readonly NameKey[]> = {
    west: ['prefix', 'first', 'middle', 'last', 'postfix'],
    east: ['prefix', 'last', 'first', 'middle', 'postfix'],
  } as const;

  private _nameOrderVersion = signal(0);
  readonly nameOrderVersion = computed(() => this._nameOrderVersion());
  
  constructor(
    private http: HttpClient,
    @Inject(DOCUMENT) private document: Document,
    private titleService: Title,
  ) {}

  private get current(): LangOption {
    return this.state.available[this.state.index] ?? {
      id: this.state.id, dir: 'ltr', type: 'west',
      name: 'English', local: 'English', img: '', valid: true
    };
  }

  get langType(): NameOrder {
    return this.current.type;
  }

  get langDirection(): Dir {
    return this.current.dir;
  }

  getNameOrderRule(): ReadonlyArray<NameKey> {
    return this.nameOrderRules[this.langType];
  }

  getName(name: UserName | null | undefined): string {

    if (!name) return '';

    const record = name as Record<string, string | undefined>;
    const parts: string[] = [];

    for (const k of this.nameOrderRules[this.langType]) {
      const prop = `${k}_name`;
      const value = record[prop];
      if (value && value.trim().length) {
        parts.push(value.trim());
      }
    }

    return parts.join(' ');
  }
  
  async init(): Promise<void> {
    const available = await firstValueFrom(
      this.http.get<LangOption[]>('assets/i18n/available.json', {
        headers: { 'Cache-Control': 'no-cache' }
      })
    );
    this.state.available = available;

    const saved = localStorage.getItem('lang');
    const nav   = (navigator.language || 'en').slice(0, 2);
    const candidate = saved ?? nav;

    const idxExact = available.findIndex(a => a.id === candidate && a.valid);
    const idxFirstValid = available.findIndex(a => a.valid);
    const index = idxExact >= 0 ? idxExact : (idxFirstValid >= 0 ? idxFirstValid : 0);

    this.state.id = available[index]?.id ?? 'en';
    this.state.index = Math.max(index, 0);

    await this.loadLang(this.state.id);
  }

  async loadLang(id: string): Promise<void> {
    const data = await firstValueFrom(
      this.http.get<Record<string, string>>(`assets/i18n/${id}.json`, {
        headers: { 'Cache-Control': 'no-cache' }
      })
    );

    const idx = this.state.available.findIndex(a => a.id === id && a.valid);
    this.state.id = id;
    this.state.index = idx >= 0 ? idx : this.state.index;

    this.state.data = { ...data };

    this.setDocumentLocale();
    localStorage.setItem('lang', id);

    this._nameOrderVersion.update(v => v + 1);
  }

  async change(id: string) {
    if (id === this.state.id) return;
    const opt = this.state.available.find(a => a.id === id);
    if (!opt || !opt.valid) return;
    await this.loadLang(id);
  }

  private setDocumentLocale() {
    const el = this.document.documentElement; 
    el.lang = this.state.id;
    el.dir  = this.langDirection;

    let title = this.state.data[PROJECT_TITLE_KEY] || 'document';
    title = title.charAt(0).toUpperCase() + title.slice(1);
    this.titleService.setTitle(title);
  }
}
