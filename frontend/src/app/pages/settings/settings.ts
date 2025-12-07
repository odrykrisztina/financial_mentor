import { Component, AfterViewInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationService } from '../../shared/nav/navigation.service';            
import { LangService } from '../../core/lang.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faGraduationCap, faArrowsToEye, faDatabase, faDoorOpen,
  faUsers, faGear, faGears, faArrowUpRightFromSquare
} from '@fortawesome/free-solid-svg-icons';
import { SidebarService } from '../../shared/sidebar/sidebar.service';
import { SidebarItem, SidebarPosition } from '../../shared/sidebar/sidebar.model';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { ModalService } from '../../shared/modal/modal.service';

@Component({
  selector: 'app-settings',
  standalone: true,                                          
  imports: [
    CommonModule,                                            
    FontAwesomeModule,
    SidebarComponent
  ],
  host: { class: 'block w-full' },
  templateUrl: './settings.html',
  styleUrl: './settings.css'
})
export class Settings implements AfterViewInit {

  icon = {  faGraduationCap, faArrowsToEye, 
            faDatabase, faUsers, faGear, faGears,
            faArrowUpRightFromSquare, faDoorOpen };

  headerHeight = 68;

  private modal   = inject(ModalService);
  private sidebar = inject(SidebarService);
  mounted = signal(false);

  selectedItem = signal<SidebarItem | null>(null);
  
  constructor(
    public langSvc: LangService,
    private nav: NavigationService,
  ) {}
    
  get lang() { return this.langSvc.state; }

  ngOnInit() {
    
    const settingsMenu = this.attachItemCallbacks(
      this.getTemporarySettings(),
      'settings'
    );
    this.sidebar.setMenu('left', settingsMenu, {
      mode: 'overlay',
      open: false,
    });
  }

  ngAfterViewInit() {
    queueMicrotask(() => {
      setTimeout(() => this.mounted.set(true), 100);
    });
  }

  toggle(position: SidebarPosition) {
    this.sidebar.toggle(position);
  }

  openItem(
    source: 'settings',
    item: SidebarItem
  ) {
    console.log('Open Item', source, item.id, item.title);
    this.selectedItem.set(item);
  }

  private attachItemCallbacks(
    items: SidebarItem[],
    source: 'settings'
  ): SidebarItem[] {
    return items.map((item) => {

      const clone: SidebarItem = { ...item };

      if (clone.children && clone.children.length) {
        clone.children = this.attachItemCallbacks(clone.children, source);
      }

      const hasChildren    = !!clone.children && clone.children.length > 0;
      const hasAttachments = !!clone.attachments && clone.attachments.length > 0;
      const hasTasks       = !!clone.tasks && clone.tasks.length > 0;
      const isSetItem      = !hasChildren && (hasAttachments || hasTasks);
      const isRouteOutlet  = clone.isRouteOutlet;

      if (isSetItem || isRouteOutlet) {
        if (!clone.id) {
          clone.id = crypto.randomUUID();
        }
        clone.callback = () => this.openItem(source, clone);
      }
      return clone;
    });
  }

  getTemporarySettings(): SidebarItem[] {

    const courses: SidebarItem[] = [
      { title: "Reset",
        labelKey: "reset", 
        icon: this.icon.faArrowUpRightFromSquare,
        isReset: true,
        callback: () => {
          if (this.selectedItem()) {
            this.modal.confirm('reset_confirm', { 
              onYes: () => {
                this.selectedItem.set(null);
                this.sidebar.clearSelectedItem();
              } 
            });
          }
        }
      },
      { title: "Adatbázis",
        icon: this.icon.faDatabase,
        children: [
          { title: "Base",
            icon: this.icon.faGears,  
            children: [
              { title: "types", isRouteOutlet: true },
              { title: "types_group", isRouteOutlet: true },
            ]
          },
          { title: "users",
            icon: this.icon.faUsers,
            children: [
              { title: "users", isRouteOutlet: true },
              { title: "workers", isRouteOutlet: true },
              { title: "messages", isRouteOutlet: true },
              { title: "contracts", isRouteOutlet: true },
              { title: "tasks", isRouteOutlet: true },
            ]
          },
          { title: "courses",
            icon: this.icon.faGraduationCap, 
            children: [
              { title: "courses", isRouteOutlet: true },
              { title: "course_prerequisites", isRouteOutlet: true },
              { title: "course_user", isRouteOutlet: true },
              { title: "course_chapters", isRouteOutlet: true },
              { title: "chapter_attachments", isRouteOutlet: true },
              { title: "chapter_tasks", isRouteOutlet: true },
              { title: "task_options", isRouteOutlet: true },
              { title: "task_submissions", isRouteOutlet: true },
            ] 
          }
        ]
      },
      { title: "Beállítások",
        separatorBefore: true,
        icon: this.icon.faGear, 
        disabled: true 
      },
      { title: "Exit",
        labelKey: "exit", 
        icon: this.icon.faDoorOpen,
        separatorBefore: true,
        callback: () => { 
          this.modal.confirm('exit_confirm', { 
            onYes: () => this.nav.goBack() 
          });
        }
      }
    ];
    return courses;
  }
}
