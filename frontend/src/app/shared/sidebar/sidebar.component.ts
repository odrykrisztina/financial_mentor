import { 
  Component, Input, signal, computed, 
  ElementRef, HostListener, OnInit 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SidebarService } from './sidebar.service';
import { SidebarItem, SidebarPosition } from './sidebar.model';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faCaretRight, faThumbtack, faThumbtackSlash, 
  faCircleXmark, faAngleDown 
} from '@fortawesome/free-solid-svg-icons';
import { LangService } from '../../core/lang.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule
  ],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent implements OnInit {

  icon = {  faCaretRight, faThumbtack, faThumbtackSlash, 
            faCircleXmark, faAngleDown };

  @Input() position: SidebarPosition = 'left';
  @Input() title = '';
  @Input() topOffset = 0;
  
  expandedIds = signal<Set<string>>(new Set());
  anyExpanded = computed(() => this.expandedIds().size > 0);

  constructor(
    private sidebar: SidebarService,
    public  langSvc: LangService,
    private el: ElementRef<HTMLElement>,
    private router: Router,
  ) {}

  get lang() { return this.langSvc.state; }

  ngOnInit(): void {
    this.updateViewport();
  }

  trackById(index: number, item: SidebarItem) {
    return item.id;
  }
  
  private updateViewport() {
    this.sidebar.updateViewport(window.innerWidth);
  }

  get state() {
    return this.sidebar.getState(this.position)();
  }

  get selectedItemId() {
    return this.sidebar.selectedItemId;
  }

  isSelected(item?: SidebarItem | null): boolean {

    if (!item) return false;

    const selectedId = this.sidebar.selectedItemId();

    if (!selectedId && item.isReset) {
      return true;
    }

    if (!item.id) return false;
    return selectedId === item.id;
  }

  closeAndUnpin() {
    if (this.isFixed) {
      this.sidebar.setMode(this.position, 'overlay');
    }
    this.sidebar.setOpen(this.position, false);
  }

  toggle() {
    if (this.isFixed && this.state.open) {
      return;
    }
    this.sidebar.toggle(this.position);
  }

  get isOverlay() {
    return this.state.mode === 'overlay';
  }

  get isFixed() {
    return this.state.mode === 'fixed';
  }

  get items(): SidebarItem[] {
    return this.state.items;
  }

  pinToggle() {
    if (!this.state.canPin) return;
    const newMode = this.state.mode === 'fixed' ? 'overlay' : 'fixed';
    this.sidebar.setMode(this.position, newMode);
  }

  isExpanded(id: string | undefined) {
    if (!id) return false;
    return this.expandedIds().has(id);
  }

  toggleExpand(id: string | undefined) {
    if (!id) return;
    const set = new Set(this.expandedIds());
    if (set.has(id)) set.delete(id); else set.add(id);
    this.expandedIds.set(set);
  }

  toggleExpandAll() {

    const current = this.expandedIds();
    if (current.size > 0) {
      this.expandedIds.set(new Set());
      return;
    }

    const all = new Set<string>();
    this.collectExpandableIds(this.items, all);
    this.expandedIds.set(all);
  }

  private collectExpandableIds(items: SidebarItem[], acc: Set<string>) {
    for (const it of items) {
      if (it.children && it.children.length && it.id) {
        acc.add(it.id);
        this.collectExpandableIds(it.children, acc);
      }
    }
  }

  onItemClick(item: SidebarItem) {

    const isDisabled = !!item.disabled || this.isSelected(item);
    if (isDisabled) return;

    const hasChildren    = !!(item.children && item.children.length);
    const hasAttachments = !!(item.attachments && item.attachments.length);
    const hasTasks       = !!(item.tasks && item.tasks.length);
    const isSetItem      = !hasChildren && (hasAttachments || hasTasks);
    const isRouteOutlet  = item.isRouteOutlet;

    // When children exist Open/Close children
    if (hasChildren) {
      this.toggleExpand(item.id);
      return;
    }

    // Callback
    if (item.callback) {
      item.callback();
    }
    // Route
    else if (item.routeNavigate) {
      this.router.navigate(item.routeNavigate);
    }

    // Check to set selected item
    if (item.id && (isSetItem || isRouteOutlet)) {
      this.sidebar.setSelectedItem(item.id);
    }

    // Close sidebar when is not pinned
    if (this.isOverlay) {
      this.sidebar.setOpen(this.position, false);
    }
  }

  @HostListener('window:resize')
  onResize() {
    this.updateViewport();
    if (!this.isFixed && this.state.open) {
      this.sidebar.setOpen(this.position, false);
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(ev: MouseEvent) {
    // Ha nincs nyitva, vagy fixed módban van, semmit ne csináljon
    if (!this.state.open || this.isFixed) return;

    const target = ev.target as HTMLElement | null;
    if (!target) return;

    // Ha a kattintás a sidebar (panel + gomb) területén belül van, ne csukjuk
    if (this.el.nativeElement.contains(target)) return;

    // Egyébként overlay mód: csukjuk
    this.sidebar.setOpen(this.position, false);
  }

  @HostListener('document:keydown.escape')
  onEsc() {
    if (!this.state.open || this.isFixed) return;
    this.sidebar.setOpen(this.position, false);
  }
}
