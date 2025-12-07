import { 
  Component,
  ElementRef,
  ViewChild,  
  inject, 
  signal, 
  OnDestroy, 
  effect,
  HostListener,
  computed
} from '@angular/core';
import { CommonModule } from '@angular/common';              
import { LangService, UserName } from '../../core/lang.service';
import { NavigationService } from '../../shared/nav/navigation.service'; 
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faMessage, faCircleXmark, faEye, 
  faAngleDown, faAnglesDown, faArrowsDownToLine,
  faPenToSquare, faCirclePlus, faCircleMinus,
  faAngleUp, faAnglesUp, faArrowsUpToLine,
  faCheck, faXmark, faIdCard, faUser, faStar,
  faFloppyDisk, faCalendarDays,
  faVenusMars, faMobileScreenButton, faLocationDot,
  faUpload, faRobot, faArrowsRotate, faCity,
  faEnvelopesBulk, faKey, faFileSignature,
  faEnvelope, faCommentDots, faChevronDown, 
  faCircleExclamation, faPaperPlane, faFlag,
  IconDefinition
} from '@fortawesome/free-solid-svg-icons';
import {
  ReactiveFormsModule,
  NonNullableFormBuilder,
  FormGroup,
  FormControl,
  Validators
} from '@angular/forms';
import { 
  FormUtilsService
} from '../../shared/forms';
import { AuthService } from '../../core/auth.service';
import { env } from '../../core/env';
import { ModalService } from '../../shared/modal/modal.service';
import { firstValueFrom } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { UtilityService } from '../../shared/util/utility.service';

type MessagesDto = {
  id              : number  | null;
  status_id       : string  | null;
  status_name_id  : string  | null;
  prefix_name     : string  | null;
  first_name      : string  | null;
  middle_name     : string  | null;
  last_name       : string  | null;
  postfix_name    : string  | null;
  gender          : 'M'|'F' | null;
  email           : string  | null;
  phone           : string  | null;
  img             : string  | null;
  worker_id       : number  | null;
  subject_name_id : string  | null;
  message         : string  | null;
  created_at      : string  | null;
};

type Command = {
  id        : string;
  icon?     : IconDefinition,
  deanger?  : boolean;
  event?    : string;
}

type NameKey    = 'prefix'|'first'|'middle'|'last'|'postfix';
type ColumnKey  = 'name' | 'status_name_id' | 'subject_name_id' | 
                  'message' | 'created_at';
type Column = {
  key: ColumnKey;
  labelKey: string;
};

interface Colleague {
  worker_id: number;
  prefix_name: string | null;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  postfix_name: string | null;
}
type SimpleColleaguesResponse = {
  data: Colleague[];
};

interface Status {
  status_id: string;
  name_id: string;
}
type StatusesResponse = {
  data: Status[];
};

type FormControls = {
  worker_id:  FormControl<number>;
  status_id: FormControl<string>;
};

type MessageResponse = {
  success: boolean;
  messageKey: string;
};

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [
    FontAwesomeModule, 
    CommonModule,
    ReactiveFormsModule, 
  ],
  templateUrl: './messages.html',
  styleUrl: './messages.css',
})
export class Messages implements OnDestroy {

  private auth  = inject(AuthService);
  private modal = inject(ModalService);

  mounted     = signal(false);
  isWorker    = signal<boolean>(false);
  messages    = signal<MessagesDto[]>([]);
  rowPointer  = signal<number>(-1);
  isPageMode  = signal<boolean>(false);
  isEditMode  = signal<boolean>(false);
  error       = signal<string | null>(null);
  private colleagues = signal<Colleague[]>([]);
  private statuses = signal<Status[]>([]);

  @ViewChild('reactiveForm', { static: false })
  formElement!: ElementRef<HTMLFormElement>;
  formGroup!: FormGroup<FormControls>;
  private readonly maxRanking: number = 4;

  readonly icon = { faMessage, faCircleXmark, faEye,
                    faAngleDown, faAnglesDown, faArrowsDownToLine,
                    faPenToSquare, faCirclePlus, faCircleMinus, 
                    faAngleUp, faAnglesUp, faArrowsUpToLine,
                    faCheck, faXmark, faIdCard, faUser, faStar,
                    faFloppyDisk, faCalendarDays,
                    faVenusMars, faMobileScreenButton, faLocationDot,
                    faUpload, faRobot, faArrowsRotate, faCity,
                    faEnvelopesBulk, faKey, faFileSignature,
                    faEnvelope, faCommentDots, faChevronDown, 
                    faCircleExclamation, faPaperPlane, faFlag };

  readonly columns: Column[] = [
    { key: 'name',            labelKey: 'name' },
    { key: 'status_name_id',  labelKey: 'status' },
    { key: 'subject_name_id', labelKey: 'subject' },
    { key: 'message',         labelKey: 'message' },
    { key: 'created_at',      labelKey: 'arrived' },
  ];

  readonly colSpan = this.columns.length;

  private readonly REFRESH_INTERVAL = 30_000;
  private messagesTimerId: any = null;
  private isChangedView: boolean = false;

  selectedRow = computed<MessagesDto | null>(() => {
    const idx  = this.rowPointer();
    const rows = this.messages();
    return idx >= 0 && idx < rows.length ? rows[idx] : null;
  });

  constructor(
    private fb: NonNullableFormBuilder,
    private forms: FormUtilsService,
    public langSvc: LangService,
    private http: HttpClient,
    private nav: NavigationService,
    private router: Router,
    private util: UtilityService,
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

    this.formGroup = this.fb.group({
      worker_id: this.fb.control<number>({ value: 0, disabled: true }),
      status_id: this.fb.control<string>({ value: '', disabled: true }, {
        validators: [Validators.required],
      }),
    });
  }
    
  get lang() { return this.langSvc.state; }
  get f() { return this.formGroup.controls; }
  get nameKeys(): ReadonlyArray<NameKey> { return this.langSvc.getNameOrderRule(); }
  isLoggedIn  = this.auth.isLoggedIn;

  async ngOnInit() {

    this.error.set(null);
    
    let params = new HttpParams();
    if (this.maxRanking != null) {
      params = params.set('max_ranking', this.maxRanking.toString());
    }

    const workers$ = this.http.get<SimpleColleaguesResponse>(
      `${env.apiBase}/workers/simple`,
      { params }
    );

    const statuses$ = this.http.get<StatusesResponse>(
      `${env.apiBase}/types/message-statuses`
    );

    try {
      const [workersRes, statusesRes] = await Promise.all([
        firstValueFrom(workers$),
        firstValueFrom(statuses$),
      ]);

      this.colleagues.set(workersRes?.data ?? []);
      this.statuses.set(statusesRes?.data ?? []);

    } catch (e) {
      console.error(e);
      this.error.set('init_load_failed');
      this.colleagues.set([]);
      this.statuses.set([]);
    }
  }

  ngOnDestroy(): void {
    this.stopMessagesPolling();
  }

  async onSubmit() {

    if (this.formGroup.invalid) {
      this.forms.setFocus(this.formGroup, this.formElement);
      return;
    }
    
    const currentUser = this.auth.getUser();
    if (!currentUser || !currentUser.id) {
      this.error.set('user_not_authenticated');
      this.modal.error('user_not_authenticated', { 
        onOk: () => this.toggleIsEditMode() 
      });
      return;
    }

    const startTime = new Date().getTime();
    this.modal.loading('data_authentication');
    this.error.set(null);

    const msg_id  = this.messages()[this.rowPointer()].id;
    const raw     = this.formGroup.getRawValue();
    const payload = { ...raw, 
                      user_id: currentUser.id,
                      worker_id_modified: currentUser.worker_id,
                      id: msg_id
                    };

    try {
      const res = await firstValueFrom(
        this.http.post<MessageResponse>(`${env.apiBase}/messages/change`, payload)
      );
      console.log(`Elapsed time: 
        ${this.util.elapsedTimeInSec(startTime)} seconds.`);
      this.modal.close();
      
      this.modal.info('data_saved_success', { 
        onOk: () => this.toggleIsEditMode() 
      });
      
      this.fetchMessages(false);
      
    } catch (e) {
      console.error(e);
      this.modal.close();
      console.log(`Elapsed time: 
        ${this.util.elapsedTimeInSec(startTime)} seconds.`);
      this.error.set('data_saved_failed');
      this.modal.error('data_saved_failed', { 
        onOk: () => this.toggleIsEditMode() 
      });
    }
  }

  confirm() {
    this.modal.confirm('data_saves_changes', { 
      onYes: () => this.onSubmit() 
    });
  }

  clear(field: keyof FormControls, value: string = ''): void {
    const controlName: keyof FormControls & string = (field as any);
    this.forms.clearControl(this.formGroup, controlName, this.formElement, value);
  }

  getColleagues = computed(() => {

    const _ = this.langSvc.nameOrderVersion();

    const list = [...this.colleagues()];

    return list.sort((a, b) => this.sortByName(a, b));
  });

  getStatuses = computed(() => {
  
    const _ = this.langSvc.nameOrderVersion();

    const dict   = this.langSvc.state.data;
    const langId = this.langSvc.state.id;

    const list = [...this.statuses()];

    return list.sort((a, b) => {
      const aLabel = dict[a.name_id] ?? a.name_id;
      const bLabel = dict[b.name_id] ?? b.name_id;

      return aLabel.localeCompare(bLabel, langId);
    });
  });

  private sortByName(a: Colleague, b: Colleague): number {
    const langId = this.langSvc.state.id;
    return  this.getDisplayName(a)
                .localeCompare(this.getDisplayName(b), langId);
  }

  private startMessagesPolling(): void {
    
    if (!this.mounted()) 
      this.modal.loading('data_request');
    
    this.stopMessagesPolling();
    this.fetchMessages(false);

    this.messagesTimerId = setInterval(() => {
      this.fetchMessages(false);
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
      if (this.modal.isOpened()) this.modal.close();
      return;
    }
    
    this.http.get<{ data: MessagesDto[] }>(
      `${env.apiBase}/messages`,
      { params: { new: String(onlyNew) } }
    ).subscribe({
      next: res => {
        if (!this.mounted()) {
          this.modal.close();
          this.mounted.set(true);
        }
        this.messages.set(res.data ?? []);
        if (this.rowPointer() === -1 ||
            this.rowPointer() >= this.messages().length) {
          this.rowPointer.set(this.messages().length ? 0 : -1);
        } 
      },
      error: err => {
        if (!this.mounted()) {
          this.modal.close();
          this.mounted.set(true);
        }
        console.error('Messages load failed', err);
        if (err.status === 401 || err.status === 403) {
          this.stopMessagesPolling();
          this.messages.set([]);
        }
      }
    });
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

  getCell(row: MessagesDto | null, key: ColumnKey): string {

    if (!row) return '';

    switch (key) {
      case 'name':
        return this.getDisplayName(row);

      case 'status_name_id': {
        const id = row.status_name_id;
        return id ? (this.lang.data[id] || id) : '';
      }

      case 'subject_name_id': {
        const id = row.subject_name_id;
        return id ? (this.lang.data[id] || id) : '';
      }

      case 'message':
        return row.message ?? '';

      case 'created_at':
        return row.created_at ?? '';
    }
  }
  
  getAvatarSrc(row: MessagesDto): string {
    if (row.img) return row.img;
    const gender = row.gender ?? 'M';
    return gender === 'F'
      ? 'assets/media/image/blank/female-blank.webp'
      : 'assets/media/image/blank/male-blank.webp';
  }

  setRowPointer(pointer: number) {

    this.rowPointer.set(pointer);

    const row = this.messages()[pointer];
    if (!row) return;
    if (this.isEditMode()) {
      this.formGroup.patchValue({
        worker_id: row.worker_id ?? 0,
        status_id: row.status_id ?? '',
      });
    }
  }

  isActive(): boolean {
    return true;
  }

  toggleIsEditMode(isCheckChangedView: boolean = true) {
    
    const isNowEdit = !this.isEditMode();
    this.isEditMode.set(isNowEdit);

    if (isNowEdit) {
      this.formGroup.enable();
    } else {
      this.formGroup.disable();
    }

    if (isCheckChangedView && this.isChangedView) {
      this.isChangedView = false;
      this.toggleOfView();
    }
  }

  changePosition(direction: string) {
    if (this.isEditMode()) return;
    const rowPointer = this.rowPointer();
    if (rowPointer < 0) return;

    const rowCount = this.messages().length - 1;
    switch (direction) {
      case 'end':
        if (rowPointer < rowCount)
          this.setRowPointer(rowCount);
        break;
      case 'jump-forward':
        if (rowPointer < rowCount) {
          const step = Math.min(rowPointer + 10, rowCount);
          this.setRowPointer(step);
        }
        break;
      case 'next':
        if (rowPointer < rowCount)
          this.setRowPointer(rowPointer + 1);
        break;
      case 'back':
        if (rowPointer > 0)
          this.setRowPointer(rowPointer - 1);
        break;
      case 'jump-backward':
        if (rowPointer > 0) {
          const step = Math.max(rowPointer - 10, 0);
          this.setRowPointer(step);
        }
        break;
      case 'first':
        if (rowPointer > 0)
          this.setRowPointer(0);
        break;
    }
  }

  changeData(event: string) {
    switch (event) {
      case 'modify':
        if (!this.isEditMode()) {
          this.toggleIsEditMode(false);

          const row = this.messages()[this.rowPointer()];
          if (row) {
            this.formGroup.patchValue({
              worker_id: row.worker_id ?? 0,
              status_id: row.status_id ?? '',
            });
          }
        }
        if (!this.isPageMode()) {
          this.isChangedView = true;
          this.toggleOfView();
        }
        break;
      case 'new':
        this.modal.info('under_development');
        break;
      case 'delete':
        this.modal.confirm('delete_confirm', { 
          onYes: () => this.modal.info('under_development') 
        })
        break;
      case 'save':
        this.modal.confirm('data_saves_changes', { 
          onYes: () => this.modal.info('under_development') 
        })
        break;
      case 'cancel':
        this.modal.confirm('discard_data_changes', { 
          onYes: () => this.toggleIsEditMode() 
        })
        break;
    }
  }

  headerEvents(event: string): void {
    switch (event) {
      case 'view':
        this.toggleOfView();
        break;
      case 'exit':
        this.modal.confirm('exit_confirm', { 
          onYes: () => this.nav.goBack() 
        });
        break;
    }
  }

  toggleOfView() {
    this.isPageMode.set(!this.isPageMode());
  }

  getCommands(type: string): Command[] {
    switch(type) {
      case 'header':
        return [
          {id: 'view', icon: this.icon.faEye },
          {id: 'exit', icon: this.icon.faCircleXmark, deanger: true }
        ];
      case 'pos':
        return [
          {id: 'end', icon: this.icon.faArrowsDownToLine }, 
          {id: 'jump-forward', icon: this.icon.faAnglesDown },
          {id: 'next', icon: this.icon.faAngleDown },
          {id: 'back', icon: this.icon.faAngleUp },
          {id: 'jump-backward', icon: this.icon.faAnglesUp },
          {id: 'first', icon: this.icon.faArrowsUpToLine }
        ];
      case 'data':
        return [
          {id: 'modify', icon: this.icon.faPenToSquare }, 
          // {id: 'new', icon: this.icon.faCirclePlus },
          // {id: 'delete', icon: this.icon.faCircleMinus, deanger: true },
        ];
      default:
        return [];
    }
  }

  isCmdEnabled(event: string): boolean {
    switch(event) {
      case 'end':
      case 'jump-forward':
      case 'next':
        return  this.rowPointer() === 
                this.messages().length - 1 ||
                this.isEditMode()
      case 'back':
      case 'jump-backward':
      case 'first':
        return  this.rowPointer() <= 0 || 
                this.isEditMode();
      case 'modify':
      case 'delete':
        return  this.rowPointer() < 0 || 
                this.isEditMode();
      case 'new':
      case 'view':
      case 'exit':
        return this.isEditMode();
      default:
        return false;
    }
  }

  @HostListener('document:keyup', ['$event'])
  handleKeyUp(event: KeyboardEvent) {
    if (this.isEditMode()) return;
    let eventCode = event.code;
    if (event.altKey) eventCode = 'Alt' + eventCode;
    switch (eventCode) {
      case 'AltPageDown':
        this.changePosition('end');
        break;
      case 'PageDown':
        this.changePosition('jump-forward');
        break;
      case 'ArrowDown':
        this.changePosition('next');
        break;
      case 'ArrowUp':
        this.changePosition('back');
        break;
      case 'PageUp':
        this.changePosition('jump-backward');
        break;
      case 'AltPageUp':
        this.changePosition('first');
        break;
    }
  }
}
