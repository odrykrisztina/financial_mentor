import { 
  Component,
  ElementRef,
  ViewChild,  
  inject, 
  signal, 
  effect,
  HostListener,
  computed,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';              
import { LangService, UserName } from '../../core/lang.service';
import { NavigationService } from '../../shared/nav/navigation.service'; 
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faCircleXmark, faEye, faHandshake,
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
  IconDefinition, faPaperclip
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
import { UtilityService } from '../../shared/util/utility.service';

type Table = {
  name: string;
  nameKey: string;
  icon?: IconDefinition;
};

type ContractDto = {
  id              : number  | null;
  contract_no     : string  | null;
  type            : string  | null;
                                      // join types ON
                                      // contracts.type = types.id AND                                       
                                      // types.type = 'CONTRACT'

  type_name_id    : string  | null;   // types.name_id

  award           : number  | null;
  currency        : string  | null;
  start_at        : string  | null; 
  description     : string  | null;
  created_at      : string  | null;
  updated_at      : string  | null;

  user_id         : string  | null;
                                      // join users ON   
                                      // contracts.user_id = users.id
                                      
  prefix_name     : string  | null;   // users.prefix_name
  first_name      : string  | null;   // users.first_name
  middle_name     : string  | null;   // users.middle_name
  last_name       : string  | null;   // users.last_name
  postfix_name    : string  | null;   // users.postfix_name
  gender          : 'M'|'F' | null;   // users.gender
  img             : string  | null;   // users.img
                                 
  worker_id       : string  | null;   
                                      // join workers, join users as users2 ON
                                      // contracts.worker_id = workers.id AND
                                      // workers.user_id = users2.id

  w_prefix_name   : string  | null;   // users2.prefix_name
  w_first_name    : string  | null;   // users2.first_name
  w_middle_name   : string  | null;   // users2.middle_name
  w_last_name     : string  | null;   // users2.last_name
  w_postfix_name  : string  | null;   // users2.postfix_name
  w_gender        : 'M'|'F' | null;   // users2.gender
  w_img           : string  | null;   // users2.img

  f_i_id          : number  | null;   
                                      // join financial_institutions ON
                                      // contracts.financial_institutions.id = 
                                      // financial_institutions.id

  f_i_name        : string  | null;   // financial_institutions.name
  f_i_img         : string  | null;   // financial_institutions.img  
};

type ContractAttachmentDto = {
  id              : number  | null;
  contract_id     : number  | null;
  type            : string  | null;
                                      // join types ON
                                      // contract_attachments.type = types.id AND                                       
                                      // types.type = 'ATTACHMENT'

  type_name_id    : string  | null;   // types.name_id

  file_name       : string  | null;
  file_path       : string  | null;
  file_url        : string  | null;
  file            : string  | null;
  file_type       : string  | null;
  description     : string  | null;
  created_at      : string  | null;
  updated_at      : string  | null;  
};

type Command = {
  id        : string;
  icon?     : IconDefinition,
  deanger?  : boolean;
  event?    : string;
}

type NameKey    = 'prefix'|'first'|'middle'|'last'|'postfix';


type ColumnContractKey  = 'contract_no' | 'name'  | 'type_name_id' |
                          'f_i_name' | 'f_i_img'  | 'award' | 
                          'currency' | 'start_at' | 'description';
type ColumnContract = {
  key: ColumnContractKey;
  labelKey: string;
};


type ColumnContractAttachmentKey  = 'type_name_id' | 'file_name' | 
                                    'file_type' | 'description';
type ColumnContractAttachment = {
  key: ColumnContractAttachmentKey;
  labelKey: string;
};

interface User {
  user_id: number;
  prefix_name: string | null;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  postfix_name: string | null;
}
type SimpleUsersResponse = {
  data: User[];
};

interface ContractType {
  id      : string;
  name_id : string;
}
type ContractTypesResponse = {
  data: ContractType[];
};

interface FinancialInstitution {
  id  : number;
  name: string | null;
  img : string | null;
}
type FinancialInstitutionsResponse = {
  data: FinancialInstitution[];
};

type ContractResponse = {
  success: boolean;
  messageKey: string;
  data: ContractDto[];
};

type ContractAttachmentResponse = {
  success: boolean;
  messageKey: string;
  data: ContractAttachmentDto[];
};

type FormControls = {
  id: FormControl<number>;
};

@Component({
  selector: 'app-contracts',
  standalone: true,
  imports: [
    FontAwesomeModule, 
    CommonModule,
    ReactiveFormsModule, 
  ],
  templateUrl: './contracts.html',
  styleUrl: './contracts.css',
})
export class Contracts implements OnInit {

  private auth  = inject(AuthService);
  private modal = inject(ModalService);

  tables = signal<Table[]>([
    { name: 'contracts',    nameKey: 'contracts', icon: faHandshake },
    { name: 'attachments',  nameKey: 'attachments', icon: faPaperclip }
  ]); 
  mounted       = signal(false);
  isWorker      = signal<boolean>(false);
  contracts     = signal<ContractDto[]>([]);
  attachments   = signal<ContractAttachmentDto[]>([]);
  isPageMode    = signal<boolean>(false);
  isEditMode    = signal<boolean>(false);
  error         = signal<string | null>(null);
  private users = signal<User[]>([]);
  private types = signal<ContractType[]>([]);
  private financialInstitutions = signal<FinancialInstitution[]>([]);

  @ViewChild('reactiveForm', { static: false })
  formElement!: ElementRef<HTMLFormElement>;
  formGroup!: FormGroup<FormControls>;

  readonly icon = { faCircleXmark, faEye, faHandshake,
                    faAngleDown, faAnglesDown, faArrowsDownToLine,
                    faPenToSquare, faCirclePlus, faCircleMinus, 
                    faAngleUp, faAnglesUp, faArrowsUpToLine,
                    faCheck, faXmark, faIdCard, faUser, faStar,
                    faFloppyDisk, faCalendarDays, faPaperclip,
                    faVenusMars, faMobileScreenButton, faLocationDot,
                    faUpload, faRobot, faArrowsRotate, faCity,
                    faEnvelopesBulk, faKey, faFileSignature,
                    faEnvelope, faCommentDots, faChevronDown, 
                    faCircleExclamation, faPaperPlane, faFlag };

  readonly contractColumns: ColumnContract[] = [
    { key: 'contract_no', labelKey: 'contract_no' },      
    { key: 'name' , labelKey: 'name' }, 
    { key: 'type_name_id', labelKey: 'type_name_id'},  
    { key: 'f_i_name', labelKey: 'f_i_name'},  
    { key: 'f_i_img', labelKey: 'f_i_img'},  
    { key: 'award' , labelKey: 'award' }, 
    { key: 'currency' , labelKey: 'currency' }, 
    { key: 'start_at', labelKey: 'start_at'}, 
    { key: 'description', labelKey: 'description'},
  ];

  readonly contractColSpan = this.contractColumns.length;

  readonly contractAttachmentColumns: ColumnContractAttachment[] = [
    { key: 'type_name_id', labelKey: 'type_name_id' },      
    { key: 'file_name' , labelKey: 'file_name' }, 
    { key: 'file_type', labelKey: 'file_type'},  
    { key: 'description', labelKey: 'description'},
  ];

  readonly contractAttachmentColSpan = this.contractAttachmentColumns.length;

  private isChangedView: boolean = false;

  contractRowPointer = signal<number>(-1);
  contractSelectedRow = computed<ContractDto | null>(() => {
    const idx  = this.contractRowPointer();
    const rows = this.contracts();
    return idx >= 0 && idx < rows.length ? rows[idx] : null;
  });

  contractAttachmentRowPointer = signal<number>(-1);
  contractAttachmentSelectedRow = computed<ContractAttachmentDto | null>(() => {
    const idx  = this.contractAttachmentRowPointer();
    const rows = this.attachments();
    return idx >= 0 && idx < rows.length ? rows[idx] : null;
  });

  constructor(
    private fb: NonNullableFormBuilder,
    private forms: FormUtilsService,
    public langSvc: LangService,
    private http: HttpClient,
    private nav: NavigationService,
    private util: UtilityService,
  ) {

    this.modal.loading('loading_data');

    effect(() => {

      const user      = this.auth.user();
      const isUser    = !!user && user.type !== 'G';
      const isWorker  = !!user && user.type === 'W';

      this.isWorker.set(isWorker);

      if (isUser || isWorker) {
        this.fetchContracts();
      }
    });

    effect(() => {
      const selected = this.contractSelectedRow();
      if (!selected || !selected.id) {
        this.attachments.set([]);
        this.contractAttachmentRowPointer.set(-1);
        return;
      }
      this.fetchContractAttachments(selected.id);
    });

    this.formGroup = this.fb.group({
      id: this.fb.control<number>({ value: 0, disabled: true }),
    });
  }
    
  get lang() { return this.langSvc.state; }
  get f() { return this.formGroup.controls; }
  get nameKeys(): ReadonlyArray<NameKey> { return this.langSvc.getNameOrderRule(); }
  isLoggedIn  = this.auth.isLoggedIn;

  async ngOnInit() {

    // this.error.set(null);
    
    // const users$ = this.http.get<SimpleUsersResponse>(
    //   `${env.apiBase}/users/simple`
    // );

    // const types$ = this.http.get<ContractTypesResponse>(
    //   `${env.apiBase}/types/contract-types`
    // );

    // const financialInstitutions$ = this.http.get<FinancialInstitutionsResponse>(
    //   `${env.apiBase}/financial_institutions`
    // );

    // try {
    //   const [usersRes, typesRes, financialInstitutionsRes] = await Promise.all([
    //     firstValueFrom(users$),
    //     firstValueFrom(types$),
    //     firstValueFrom(financialInstitutions$),
    //   ]);

    //   this.users.set(usersRes?.data ?? []);
    //   this.types.set(typesRes?.data ?? []);
    //   console.log(this.types());
    //   this.financialInstitutions.set(financialInstitutionsRes?.data ?? []);

    // } catch (e) {
    //   console.error(e);
    //   this.error.set('init_load_failed');
    //   this.users.set([]);
    //   this.types.set([]);
    //   this.financialInstitutions.set([]);
    // }
  }

  async onSubmit() {

    const startTime = new Date().getTime();
    this.modal.loading('data_authentication');
    this.error.set(null);

    // User ellenőrzése
    const currentUser = this.auth.getUser();
    if (!currentUser || !currentUser.id) {
      this.error.set('user_not_authenticated');
      this.modal.error('user_not_authenticated');
      return;
    }

    this.modal.loading('data_authentication');
    this.error.set(null);

    setTimeout(() => {
      this.modal.close();
      this.modal.info('under_development');
    }, 1000);
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

  getUsers = computed(() => {

    const _ = this.langSvc.nameOrderVersion();

    const list = [...this.users()];

    return list.sort((a, b) => this.sortByName(a, b));
  });

  getTypes = computed(() => {
  
    const _ = this.langSvc.nameOrderVersion();

    const dict   = this.langSvc.state.data;
    const langId = this.langSvc.state.id;

    const list = [...this.types()];

    return list.sort((a, b) => {
      const aLabel = dict[a.name_id] ?? a.name_id;
      const bLabel = dict[b.name_id] ?? b.name_id;

      return aLabel.localeCompare(bLabel, langId);
    });
  });

  private sortByName(a: User, b: User): number {
    const langId = this.langSvc.state.id;
    return  this.getDisplayName(a)
                .localeCompare(this.getDisplayName(b), langId);
  }

  private fetchContracts(): void {

    this.http.get<{ data: ContractDto[] }>(
      `${env.apiBase}/contracts`
    ).subscribe({
      next: res => {
        if (!this.mounted()) {
          this.modal.close();
          this.mounted.set(true);
        }
        this.contracts.set(res.data ?? []);
        if (this.contractRowPointer() === -1 ||
            this.contractRowPointer() >= this.contracts().length) {
          this.contractRowPointer.set(this.contracts().length ? 0 : -1);
        } 
      },
      error: err => {
        if (!this.mounted()) {
          this.modal.close();
          this.mounted.set(true);
        }
        console.error('Contracts load failed', err);
        if (err.status === 401 || err.status === 403) {
          this.contracts.set([]);
        }
      }
    });
  }

  private fetchContractAttachments(contractId: number): void {

    this.http.get<{ data: ContractAttachmentDto[] }>(
      `${env.apiBase}/contracts/${contractId}/attachments`
    ).subscribe({
      next: res => {
        if (!this.mounted()) {
          this.modal.close();
          this.mounted.set(true);
        }
        this.attachments.set(res.data ?? []);
        if (this.contractAttachmentRowPointer() === -1 ||
            this.contractAttachmentRowPointer() >= this.attachments().length) {
          this.contractAttachmentRowPointer.set(this.attachments().length ? 0 : -1);
        } 
      },
      error: err => {
        if (!this.mounted()) {
          this.modal.close();
          this.mounted.set(true);
        }
        console.error('Contract attachments load failed', err);
        if (err.status === 401 || err.status === 403) {
          this.attachments.set([]);
          this.contractAttachmentRowPointer.set(-1);
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

  getContractCell(
    row: ContractDto | null, 
    key: ColumnContractKey): string {

    if (!row) return '';

    switch (key) {
      case 'name':
        return this.getDisplayName(row);
      case 'type_name_id': {
        const id = row.type_name_id;
        return id ? (this.lang.data[id] || id) : '';
      }
      case 'contract_no':     
        return row.contract_no ?? '';
      case 'f_i_name':
        return row.f_i_name ?? '';
      case 'f_i_img':
        return row.f_i_img ?? '';
      case 'award':
        return row.award?.toString() ?? '0';
      case 'currency':
        return row.currency ?? '';
      case 'start_at':
        return row.start_at ?? '';
      case 'description':
        return row.description ?? '';
      default:
        return '';
    }
  }

  getContractAttachmentCell(
    row: ContractAttachmentDto | null, 
    key: ColumnContractAttachmentKey): string {

    if (!row) return '';
    switch (key) {
      case 'type_name_id': {
        const id = row.type_name_id;
        return id ? (this.lang.data[id] || id) : '';
      }
      case 'file_name':     
        return row.file_name ?? '';
      case 'file_type':
        return row.file_type ?? '';
      case 'description':
        return row.description ?? '';
      default:
        return '';
    }
  }
  
  getAvatarSrc(row: ContractDto): string {
    if (row.img) return row.img;
    const gender = row.gender ?? 'M';
    return gender === 'F'
      ? 'assets/media/image/blank/female-blank.webp'
      : 'assets/media/image/blank/male-blank.webp';
  }

  setContractRowPointer(pointer: number) {

    this.contractRowPointer.set(pointer);

    const row = this.contracts()[pointer];
    if (!row) return;
    if (this.isEditMode()) {
      this.formGroup.patchValue({
        id: row.id ?? 0,
      });
    }
  }

  setContractAttachmentRowPointer(pointer: number) {

    this.contractAttachmentRowPointer.set(pointer);
    const row = this.attachments()[pointer];
    if (!row) return;
    if (this.isEditMode()) {
      this.formGroup.patchValue({
        id: row.id ?? 0,
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

  changeContractPosition(direction: string) {

    if (this.isEditMode()) return;
    const rowPointer = this.contractRowPointer();
    if (rowPointer < 0) return;

    const rowCount = this.contracts().length - 1;
    switch (direction) {
      case 'end':
        if (rowPointer < rowCount)
          this.setContractRowPointer(rowCount);
        break;
      case 'jump-forward':
        if (rowPointer < rowCount) {
          const step = Math.min(rowPointer + 10, rowCount);
          this.setContractRowPointer(step);
        }
        break;
      case 'next':
        if (rowPointer < rowCount)
          this.setContractRowPointer(rowPointer + 1);
        break;
      case 'back':
        if (rowPointer > 0)
          this.setContractRowPointer(rowPointer - 1);
        break;
      case 'jump-backward':
        if (rowPointer > 0) {
          const step = Math.max(rowPointer - 10, 0);
          this.setContractRowPointer(step);
        }
        break;
      case 'first':
        if (rowPointer > 0)
          this.setContractRowPointer(0);
        break;
    }
  }

  changeContractAttachmentPosition(direction: string) {
    
    if (this.isEditMode()) return;
    const rowPointer = this.contractAttachmentRowPointer();
    if (rowPointer < 0) return;

    const rowCount = this.attachments().length - 1;
    switch (direction) {
      case 'end':
        if (rowPointer < rowCount)
          this.setContractAttachmentRowPointer(rowCount);
        break;
      case 'jump-forward':
        if (rowPointer < rowCount) {
          const step = Math.min(rowPointer + 10, rowCount);
          this.setContractAttachmentRowPointer(step);
        }
        break;
      case 'next':
        if (rowPointer < rowCount)
          this.setContractAttachmentRowPointer(rowPointer + 1);
        break;
      case 'back':
        if (rowPointer > 0)
          this.setContractAttachmentRowPointer(rowPointer - 1);
        break;
      case 'jump-backward':
        if (rowPointer > 0) {
          const step = Math.max(rowPointer - 10, 0);
          this.setContractAttachmentRowPointer(step);
        }
        break;
      case 'first':
        if (rowPointer > 0)
          this.setContractAttachmentRowPointer(0);
        break;
    }
  }

  changeData(event: string) {
    switch (event) {
      case 'modify':
        this.modal.info('under_development');
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
          {id: 'new', icon: this.icon.faCirclePlus },
          {id: 'delete', icon: this.icon.faCircleMinus, deanger: true },
        ];
      default:
        return [];
    }
  }

  isContractCmdEnabled(event: string): boolean {
    switch(event) {
      case 'end':
      case 'jump-forward':
      case 'next':
        return  this.contractRowPointer() === 
                this.contracts().length - 1 ||
                this.isEditMode()
      case 'back':
      case 'jump-backward':
      case 'first':
        return  this.contractRowPointer() <= 0 || 
                this.isEditMode();
      case 'modify':
      case 'delete':
        return  this.contractRowPointer() < 0 || 
                this.isEditMode();
      case 'new':
      case 'view':
      case 'exit':
        return this.isEditMode();
      default:
        return false;
    }
  }

  isContractAttachmentCmdEnabled(event: string): boolean {
    switch(event) {
      case 'end':
      case 'jump-forward':
      case 'next':
        return  this.contractAttachmentRowPointer() === 
                this.attachments().length - 1 ||
                this.isEditMode()
      case 'back':
      case 'jump-backward':
      case 'first':
        return  this.contractAttachmentRowPointer() <= 0 || 
                this.isEditMode();
      case 'modify':
      case 'delete':
        return  this.contractAttachmentRowPointer() < 0 || 
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
        this.changeContractPosition('end');
        break;
      case 'PageDown':
        this.changeContractPosition('jump-forward');
        break;
      case 'ArrowDown':
        this.changeContractPosition('next');
        break;
      case 'ArrowUp':
        this.changeContractPosition('back');
        break;
      case 'PageUp':
        this.changeContractPosition('jump-backward');
        break;
      case 'AltPageUp':
        this.changeContractPosition('first');
        break;
    }
  }
}
