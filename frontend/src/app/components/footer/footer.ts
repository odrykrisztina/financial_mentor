import { 
  Component, 
  inject,
  signal,
  OnInit,
  OnDestroy,
  effect
} from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LangService, UserName } from '../../core/lang.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {  faFacebook, faSquareXTwitter, faGithub, faDribbble,
          faSquareLinkedin, faSquareInstagram, faSquareYoutube
} from '@fortawesome/free-brands-svg-icons';
import { faBell, faAngleUp, faEye } from '@fortawesome/free-solid-svg-icons';
import { DropdownService, MenuId } from '../../shared/ui/dropdown.service';
import { AuthService } from '../../core/auth.service';
import { SidebarService } from '../../shared/sidebar/sidebar.service';
import { HttpClient } from '@angular/common/http';
import { env } from '../../core/env';
import { ModalService } from '../../shared/modal/modal.service';


export type MessagesDto = {
  id              : number  | null;
  status_name_id  : string  | null;
  prefix_name     : string  | null;
  first_name      : string  | null;
  middle_name     : string  | null;
  last_name       : string  | null;
  postfix_name    : string  | null;
  gender          : 'M'|'F' | null;
  img             : string  | null;
  subject_name_id : string  | null;
  message         : string  | null;
  created_at      : string  | null;
};

type User = UserName & {
  gender: 'M' | 'F' | null;
  img: string | null;
}

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    FontAwesomeModule, 
    CommonModule,
  ],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})

export class FooterComponent implements OnInit, OnDestroy {

  private auth  = inject(AuthService);
  private modal = inject(ModalService);

  isWorker  = signal<boolean>(false);
  messages  = signal<MessagesDto[]>([]);
  author    = signal<User | null>(null);

  private readonly authorId: number = 24;

  private readonly REFRESH_INTERVAL = 30_000;
  private messagesTimerId: any = null;
  
  constructor(
    public langSvc: LangService,
    private dd: DropdownService,
    private sidebar: SidebarService,
    private http: HttpClient,
    private router: Router,
  ) {
    effect(() => {

      const user = this.auth.user();
      const loggedIn = !!user;
      const worker   = !!user && user.type === 'W';

      this.isWorker.set(worker);

      if (loggedIn && worker) {
        this.startMessagesPolling();
      } else {
        this.stopMessagesPolling();
        this.messages.set([]);
      }
    });
  }

  get lang() { return this.langSvc.state; }

  socialMediaIcons = {  faFacebook, faSquareXTwitter, faGithub, faDribbble,
                        faSquareLinkedin, faSquareInstagram, faSquareYoutube };
  icon = {  faBell, faAngleUp, faEye };

  currentYear = new Date().getFullYear();
  isLoggedIn  = this.auth.isLoggedIn;

  async ngOnInit() {

    this.http.get<{ data: User }>(`${env.apiBase}/users/${this.authorId}`)
    .subscribe({
      next: res => this.author.set(res.data),
      error: err => {
        this.author.set(null);
        console.error('messages error', err);
      }
    });
  }

  ngOnDestroy(): void {
    this.stopMessagesPolling();
  }

  private startMessagesPolling(): void {
    
    this.stopMessagesPolling();
    this.fetchMessages(true);

    this.messagesTimerId = setInterval(() => {
      this.fetchMessages(true);
    }, this.REFRESH_INTERVAL);
  }

  private stopMessagesPolling(): void {

    if (this.messagesTimerId) {
      clearInterval(this.messagesTimerId);
      this.messagesTimerId = null;
    }
  }

  private fetchMessages(onlyNew: boolean): void {

    if (!this.isLoggedIn() || !this.isWorker()) {
      this.stopMessagesPolling();
      this.messages.set([]);
      return;
    }

    this.http.get<{ data: MessagesDto[] }>(
      `${env.apiBase}/messages`,
      { params: { new: String(onlyNew) } }
    ).subscribe({
      next: res => {
        this.messages.set(res.data ?? []);
      },
      error: err => {
        console.error('Messages load failed', err);
        if (err.status === 401 || err.status === 403) {
          this.stopMessagesPolling();
          this.messages.set([]);
        }
      }
    });
  }

  isOpen(id: MenuId) { return this.dd.isOpen(id); }
  toggle(id: MenuId, ev?: Event, isSubMenu:boolean=false) {
    ev?.stopPropagation();
    if (isSubMenu && this.isOpen('navbar'))
          this.dd.toggle(id);
    else  this.dd.exclusiveToggle(id);
    this.sidebar.closeAllNotFixed();
  }

  getDisplayName(a: any): string {
    if (!a) return '';
    const name: UserName = {
      prefix_name:  a.prefix_name  ?? undefined,
      first_name:   a.first_name   ?? undefined,
      middle_name:  a.middle_name  ?? undefined,
      last_name:    a.last_name    ?? undefined,
      postfix_name: a.postfix_name ?? undefined,
    };
    return this.langSvc.getName(name);
  }

  isActive(url: string): boolean {
    const current = this.router.url.split('?')[0].split('#')[0];
    const target = url.startsWith('/') ? url : `/${url}`;
    return current === target;
  }

  confirmRouteToMessages() {
    this.modal.confirm('messages_show_all_confirm', { 
      onYes: () => this.router.navigate(['/messages']) 
    });
  }
}
