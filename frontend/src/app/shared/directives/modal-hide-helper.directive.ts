import { Directive, ElementRef, Input, OnChanges, Renderer2, SimpleChanges, OnDestroy } from '@angular/core';

@Directive({
  selector: '[appModalHideHelper]',
  standalone: true
})
export class ModalHideHelperDirective implements OnChanges, OnDestroy {

  @Input('appModalHideHelper') hidden = false;
  private prevFocusedElement: HTMLElement | null = null;

  constructor(
    private el: ElementRef<HTMLElement>, 
    private renderer: Renderer2
  ) {}

  ngOnChanges(changes: SimpleChanges) {

    if (!changes['hidden']) return;
    const isHidden = !!this.hidden;

    if (isHidden) {
      const active = document.activeElement as HTMLElement | null;
      if (active && this.el.nativeElement.contains(active)) {
        this.prevFocusedElement = active;
        try { active.blur(); } catch {}
      }
      this.renderer.setAttribute(this.el.nativeElement, 'inert', '');
      this.renderer.setAttribute(this.el.nativeElement, 'aria-hidden', 'true');
    } else {
      if (this.el.nativeElement.hasAttribute('inert')) {
        this.renderer.removeAttribute(this.el.nativeElement, 'inert');
      }
      if (this.el.nativeElement.hasAttribute('aria-hidden')) {
        this.renderer.removeAttribute(this.el.nativeElement, 'aria-hidden');
      }
      if (this.prevFocusedElement && document.contains(this.prevFocusedElement)) {
        try { this.prevFocusedElement.focus(); } catch {}
      }
      this.prevFocusedElement = null;
    }
  }

  ngOnDestroy() {
    if (this.el.nativeElement.hasAttribute('inert')) {
      this.renderer.removeAttribute(this.el.nativeElement, 'inert');
    }
  }
}