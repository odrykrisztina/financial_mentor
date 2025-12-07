import { ElementRef, Injectable } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';

export type FocusReason = 'invalid' | 'empty' | 'first';

@Injectable({ providedIn: 'root' })

export class FormUtilsService {

  setFocus<T extends Record<string, any>>(
    fg: FormGroup<T>,
    formEl?: ElementRef<HTMLElement>
  ): void {

    queueMicrotask(() => {

      const root = formEl?.nativeElement;
      if (!root) return;
      
      const focusables = Array.from(root.querySelectorAll<HTMLElement>(
        `input, select, textarea, button, [tabindex]:not([tabindex="-1"])`
      )).filter(el =>
        !el.hasAttribute('disabled') &&
        getComputedStyle(el).display !== 'none' &&
        getComputedStyle(el).visibility !== 'hidden'
      );

      const getCtrlName = (el: HTMLElement): string | null => {
        const tryAttrs = ['formcontrolname', 'data-fc', 'id', 'name'];
        for (const attr of tryAttrs) {
          const val = el.getAttribute(attr);
          if (val && fg.get(val)) return val;
        }
        return null;
      };

      for (const el of focusables) {
        const name = getCtrlName(el);
        if (!name) continue;
        const c = fg.get(name);
        if (c?.invalid) {
          el.focus();
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }
      }

      for (const el of focusables) {
        const name = getCtrlName(el);
        if (!name) continue;
        const c = fg.get(name);
        const v = c?.value;
        if (v === '' || v == null) {
          el.focus();
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }
      }

      const first = focusables[0];
      if (first) {
        first.focus();
        first.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }

  clearControl<T extends Record<string, any>>(
    fg: FormGroup<T>,
    controlName: keyof T & string,
    formEl?: ElementRef<HTMLElement>,
    value: any = ''
  ): void {
    const c = fg.get(controlName) as AbstractControl | null;
    if (!c) return;
    c.setValue(value);
    c.markAsPristine();
    c.markAsUntouched();

    this.focusByFormControlName(formEl, controlName);
  }

  focusByFormControlName(formEl: ElementRef<HTMLElement> | undefined, name: string) {
    queueMicrotask(() => {
      let el = formEl?.nativeElement
                      .querySelector<HTMLElement>(`[formcontrolname="${name}"]`);
      if (!el) el = formEl?.nativeElement
                           .querySelector<HTMLElement>(`[id="${name}"]`);
      if (el) el?.focus();
    });
  }

  readAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = () => reject(new Error('readAsDataURL failed'));
      r.readAsDataURL(file);
    });
  }

  sliceBase64(dataURL: string): { mime: string; b64: string } {
    const m = /^data:([^;]+);base64,(.*)$/i.exec(dataURL);
    return {
      mime: m?.[1] ?? 'application/octet-stream',
      b64:  m?.[2] ?? ''
    };
  }

  getTestCode(length = 6): string {
    
    const upper = 'ABCDEFGHJKMNPQRSTUVWXYZ';
    const lower = 'abcdefghjkmnpqrstuvwxyz';
    const nums  = '23456789';
    const pools = [upper, lower, nums];

    const pick = (s: string) => s[Math.floor(Math.random() * s.length)];
    const used = new Set<string>();
    const out: string[] = [];

    for (let i = 0; i < length; i++) {
      const bag = pools[i % pools.length];
      let ch = pick(bag);
      let guard = 50;
      while (used.has(ch) && guard--) ch = pick(bag);
      used.add(ch);
      out.push(ch);
    }
    
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out.join('');
  }

  getDate(yearDiff = 0): string {
    const d = new Date();
    d.setFullYear(d.getFullYear() + yearDiff);
    const pad = (n: number) => `${n}`.padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  markAllTouched(form: FormGroup) {
    Object.values(form.controls)
          .forEach(c => { c.markAsDirty(); c.markAsTouched(); });
  }

  saveLastEmail(email: string | null | undefined) { 
    localStorage.setItem('lastEmail', (email ?? '').trim()); 
  }

  loadLastEmail(): string { 
    return (localStorage.getItem('lastEmail') ?? '').trim(); 
  }

  isEmpty(c?: AbstractControl<any, any> | null) {
    const v = c?.value;
    return v === '' || v === null || v === undefined;
  }

  splitDataUrl(dataUrl: string): { mime: string | null; base64: string | null } {
    const m = /^data:([^;]+);base64,(.+)$/.exec(dataUrl);
    return {
      mime: m ? m[1] : null,
      base64: m ? m[2] : null
    };
  }

  fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = () => reject(new Error('File read error'));
      r.readAsDataURL(file);
    });
  }
}
