import { 
  Component, 
  HostListener, 
  ElementRef, 
  ViewChild, 
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, RouterModule } from '@angular/router';
import { LangService } from '../../core/lang.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {  faHouse, faCircleInfo, faUser, faRightToBracket,
          faRightFromBracket, faIdCard, faSun,
          faBellConcierge, faPersonCane, faAngleDown, faFileSignature,
          faHeartPulse, faPiggyBank, faSuitcaseMedical, faCarBurst,
          faHouseCrack, faBabyCarriage, faMoneyCheckDollar, faSackDollar, 
          faHandsHoldingChild, faUsersGear, faImages, faUserPlus, 
          faGraduationCap, faHandshake, faListCheck, faGear,
          faCircleQuestion, faEnvelope, faKey, faMessage
} from '@fortawesome/free-solid-svg-icons';
import { faMoon } from '@fortawesome/free-regular-svg-icons';
import { DropdownService, MenuId } from '../../shared/ui/dropdown.service';
import { AuthService } from '../../core/auth.service';
import { ModalService } from '../../shared/modal/modal.service';
import { SidebarService } from '../../shared/sidebar/sidebar.service';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterLink,
    RouterModule, 
    FontAwesomeModule, 
    CommonModule
  ],
  templateUrl: './header.html',
  styleUrl: './header.css',
})

export class HeaderComponent {

  icon = {  faHouse, faCircleInfo, faUser, faRightToBracket,
            faRightFromBracket, faIdCard, faMoon, faSun, faSackDollar,
            faBellConcierge, faPersonCane, faAngleDown, faFileSignature,
            faHeartPulse, faPiggyBank, faSuitcaseMedical, faCarBurst,
            faHouseCrack, faBabyCarriage, faMoneyCheckDollar,
            faHandsHoldingChild, faUsersGear, faImages, faUserPlus, 
            faGraduationCap, faHandshake, faListCheck, faGear,
            faCircleQuestion, faEnvelope, faKey, faMessage
  };

  @ViewChild('userRoot',      { static: false }) userRoot?: ElementRef<HTMLElement>;
  @ViewChild('langRoot',      { static: false }) langRoot?: ElementRef<HTMLElement>;
  @ViewChild('navbarRoot',    { static: false }) navbarRoot?: ElementRef<HTMLElement>;
  @ViewChild('servicesRoot',  { static: false }) servicesRoot?: ElementRef<HTMLElement>;
  @ViewChild('msgRoot',     { static: false }) msgRoot?: ElementRef<HTMLElement>;

  private auth  = inject(AuthService);
  private modal = inject(ModalService);
  readonly isLoggedIn = this.auth.isLoggedIn;
  readonly user       = this.auth.user;

  constructor(
    public langSvc: LangService,
    private dd: DropdownService,
    private router: Router,
    private sidebar: SidebarService,
  ) {
    this.router.events.subscribe(() => this.dd.closeAll());
  }

  get lang() { return this.langSvc.state; }
  get isMultipleLangs(): boolean {
    return (this.lang.available?.filter(x => x.valid) ?? []).length > 1;
  }

  async changeLanguage(id: string) { 
    await this.langSvc.change(id); 
    this.dd.closeAll();
  }

  toggleTheme() {
    const html = document.documentElement;
    const isDark = html.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }
  
  get nameKeys(): ReadonlyArray<'prefix'|'first'|'middle'|'last'|'postfix'> {
    return this.langSvc.getNameOrderRule();
  }

  confirm() {
    this.dd.closeAll();
    this.modal.confirm('logout_confirm', { 
      onYes: () => this.logout() 
    });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }

  isActive(url: string): boolean {
    const current = this.router.url.split('?')[0].split('#')[0];
    const target = url.startsWith('/') ? url : `/${url}`;
    return current === target;
  }

  isOpen(id: MenuId) { return this.dd.isOpen(id); }
  toggle(id: MenuId, ev?: Event, isSubMenu:boolean=false) {
    ev?.stopPropagation();
    if (isSubMenu && this.isOpen('navbar'))
          this.dd.toggle(id);
    else  this.dd.exclusiveToggle(id);
    
    this.sidebar.closeAllNotFixed();
  }

  @HostListener('document:click', ['$event'])
  onDocClick(ev: MouseEvent) {

    const t = ev.target as HTMLElement | null;
    if (!t) return;

    const inUser      = this.userRoot?.nativeElement.contains(t);
    const inLang      = this.langRoot?.nativeElement.contains(t);
    const inNavbar    = this.navbarRoot?.nativeElement.contains(t);
    const inServices  = this.servicesRoot?.nativeElement.contains(t);
    const inMsg       = this.msgRoot?.nativeElement.contains(t);

    if (inUser || inLang || inNavbar || inServices || inMsg) return;
    this.dd.closeAll();
  }

  @HostListener('document:keydown.escape')
  onEsc() { this.dd.closeAll(); }

  @HostListener('window:resize')
  onResize() { this.dd.closeAll(); }
}
