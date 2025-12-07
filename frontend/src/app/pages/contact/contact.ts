import { 
  Component, 
  ElementRef, 
  ViewChild, 
  AfterViewInit, 
  signal,
  inject,
  effect,
  computed 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  NonNullableFormBuilder,
  FormGroup,
  FormControl,
  Validators
} from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faCheck, faXmark, faIdCard, faUser, faStar,
  faFloppyDisk, faCircleXmark, faCalendarDays,
  faVenusMars, faMobileScreenButton, faLocationDot,
  faUpload, faRobot, faArrowsRotate, faCity,
  faEnvelopesBulk, faKey, faEye, faFileSignature,
  faEnvelope, faCommentDots, faChevronDown, 
  faCircleExclamation, faPaperPlane
} from '@fortawesome/free-solid-svg-icons';
import { faHandPointRight } from '@fortawesome/free-regular-svg-icons';
import { LangService, UserName } from '../../core/lang.service';
import { 
  EmailValidators,
  FormUtilsService, 
  phoneValidator, 
  allowedCharsValidator
} from '../../shared/forms';
import { AuthService } from '../../core/auth.service';
import { ModalService } from '../../shared/modal/modal.service';
import { NavigationService } from '../../shared/nav/navigation.service';
import { firstValueFrom } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { env } from '../../core/env';
import { UtilityService } from '../../shared/util/utility.service';
import { Router } from '@angular/router';

type Gender = '' | 'F' | 'M';
type NameKey = 'prefix'|'first'|'middle'|'last'|'postfix';
type ControlName = `${NameKey}_name`;
type NameForm = { [K in ControlName]: FormControl<string>; };

type FormControls = NameForm & {
  user_id:    FormControl<number>;
  gender:     FormControl<Gender>;
  email:      FormControl<string>;
  phone:      FormControl<string>;
  worker_id:  FormControl<number>;
  subject_id: FormControl<string>;
  message:    FormControl<string>;
};

export interface Colleague {
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

export interface Subject {
  subject_id: string;
  name_id: string;
}

type SubjectsResponse = {
  data: Subject[];
};

type MessageResponse = {
  success: boolean;
  data?: {
    id: number;
    status: string;
    created_at: string;
  };
};

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    FontAwesomeModule,
  ],
  host: { class: 'block w-full' },
  templateUrl: './contact.html',
  styleUrl: './contact.css'
})

export class Contact implements AfterViewInit {
  
  private auth  = inject(AuthService);
  readonly isLoggedIn = this.auth.isLoggedIn;
  private modal = inject(ModalService);
  private colleagues = signal<Colleague[]>([]);
  private subjects = signal<Subject[]>([]);
 
  icon = {
    faCheck, faXmark, faIdCard, faUser, faStar,
    faFloppyDisk, faCircleXmark, faCalendarDays,
    faVenusMars, faMobileScreenButton, faLocationDot,
    faUpload, faRobot, faHandPointRight, faArrowsRotate, 
    faCity, faEnvelopesBulk, faKey, faEye, faFileSignature,
    faEnvelope, faCommentDots, faChevronDown, faCircleExclamation,
    faPaperPlane
  };

  @ViewChild('reactiveForm', { static: false })
  formElement!: ElementRef<HTMLFormElement>;
  formGroup!: FormGroup<FormControls>;
  private readonly maxRanking: number = 4;

  mounted = signal(false);
  error = signal<string | null>(null);
  subjectOpen = false;

  constructor(
    private fb: NonNullableFormBuilder,
    public  langSvc: LangService,
    private forms: FormUtilsService,
    private nav: NavigationService,
    private http: HttpClient,
    private util: UtilityService,
    private router: Router
  ) {
    effect(() => {
      const user = this.auth.user();
      if (!user) return;

      this.formGroup.patchValue({
        user_id: user.id ?? 0,
        prefix_name: user.prefix_name ?? '',
        first_name: user.first_name ?? '',
        middle_name: user.middle_name ?? '',
        last_name: user.last_name ?? '',
        postfix_name: user.postfix_name ?? '',
        gender: user.gender?? '',
        email: user.email?? '',
        phone: user.phone?? '',      
      });
    });

    this.formGroup = this.fb.group({
      user_id: this.fb.control<number>(0),
      prefix_name:  this.fb.control<string>({
        value: '', 
        disabled: this.isLoggedIn()
      }, [
        allowedCharsValidator(), 
        Validators.maxLength(20)
      ]),
      first_name: this.fb.control<string>({
        value: '', 
        disabled: this.isLoggedIn()
      }, [ 
        Validators.required,  
        allowedCharsValidator(), 
        Validators.maxLength(100)
      ]),
      middle_name: this.fb.control<string>({
        value: '', 
        disabled: this.isLoggedIn()
      }, [ 
        allowedCharsValidator(), 
        Validators.maxLength(100)
      ]),
      last_name: this.fb.control<string>({
        value: '', 
        disabled: this.isLoggedIn()
      }, [ 
        Validators.required, 
        allowedCharsValidator(), 
        Validators.maxLength(100)
      ]),
      postfix_name: this.fb.control<string>({
        value: '', 
        disabled: this.isLoggedIn()
      }, [ 
        allowedCharsValidator(), 
        Validators.maxLength(20)
      ]),
      gender: this.fb.control<''|'F'|'M'>({
        value: '', 
        disabled: this.isLoggedIn()
      }, [
        Validators.required
      ]),
      email: this.fb.control<string>({
        value: '', 
        disabled: this.isLoggedIn()
      }, [
        ...EmailValidators,
        Validators.required,
        Validators.maxLength(253)
      ]),
      phone: this.fb.control<string>({
        value: '', 
        disabled: this.isLoggedIn()
      }, [ 
        Validators.required, 
        Validators.maxLength(30), 
        phoneValidator
      ]),
      worker_id: this.fb.control<number>(0),
      subject_id: this.fb.control<string>('', [ Validators.required]),
      message: this.fb.control<string>('', [ Validators.required]),
    });
  }

  get lang() { return this.langSvc.state; }
  get f() { return this.formGroup.controls; }
  get nameKeys(): ReadonlyArray<NameKey> { return this.langSvc.getNameOrderRule(); }

  async ngOnInit() {
    
    this.error.set(null);

    const nav = this.router.currentNavigation();
    const state = (nav?.extras.state ?? history.state) as {
      worker?: Colleague;
      subject?: Subject;
    };

    let params = new HttpParams();
    if (this.maxRanking != null) {
      params = params.set('max_ranking', this.maxRanking.toString());
    }

    const workers$ = this.http.get<SimpleColleaguesResponse>(
      `${env.apiBase}/workers/simple`,
      { params }
    );

    const subjects$ = this.http.get<SubjectsResponse>(
      `${env.apiBase}/types/message-subjects`
    );

    try {
      const [workersRes, subjectsRes] = await Promise.all([
        firstValueFrom(workers$),
        firstValueFrom(subjects$),
      ]);

      this.colleagues.set(workersRes?.data ?? []);
      this.subjects.set(subjectsRes?.data ?? []);

      if (state.worker || state.subject) {
        if (state.worker) {
          this.formGroup.patchValue({
            worker_id: state.worker.worker_id
          });
        }
        if (state.subject) {
          this.formGroup.patchValue({
            subject_id: state.subject.subject_id
          });
        }
        this.forms.setFocus(this.formGroup, this.formElement);
      } 
    } catch (e) {
      console.error(e);
      this.error.set('init_load_failed');
      this.colleagues.set([]);
      this.subjects.set([]);
    }
  }

  ngAfterViewInit() {
    queueMicrotask(() => {
      this.forms.setFocus(this.formGroup, this.formElement);
      this.mounted.set(true);
    });
  }

  async onSubmit() {

    if (this.formGroup.invalid) {
      this.forms.setFocus(this.formGroup, this.formElement);
      return;
    }

    const startTime = new Date().getTime();
    this.modal.loading('data_authentication');
    this.error.set(null);

    const raw     = this.formGroup.getRawValue();
    const payload = { ...raw };

    try {
      const res = await firstValueFrom(
        this.http.post<MessageResponse>(`${env.apiBase}/messages`, payload)
      );

      console.log(`Elapsed time: 
        ${this.util.elapsedTimeInSec(startTime)} seconds.`);
      this.modal.close();

      // Sikeres mentés után infó + ürlap alaphelyzetbe
      this.modal.info('message_sent_contact_soon', {
        onOk: () => {
          this.formGroup.patchValue({
            worker_id:  0,
            subject_id: '',
            message:    '',
          });
          this.formGroup.markAsPristine();
          this.formGroup.markAsUntouched();
          this.forms.setFocus(this.formGroup, this.formElement);
        }
      });

    } catch (e) {
      console.error(e);
      this.modal.close();
      console.log(`Elapsed time: 
        ${this.util.elapsedTimeInSec(startTime)} seconds.`);
      this.error.set('message_send_failed');
      this.modal.error('message_send_failed');
    }
  }

  reset() {
    this.error.set(null);
    this.forms.setFocus(this.formGroup, this.formElement);
  }

  confirm() {
    this.modal.confirm('message_send_confirm', { 
      onYes: () => this.onSubmit() 
    });
  }

  onCancel() { this.nav.goBack(); }

  isNameRequired(key: NameKey) { return key === 'first' || key === 'last'; }
  isNameValid(key: NameKey) { return this.ctrl(key).valid; }

  isEmpty(field: NameKey): boolean;
  isEmpty(field: keyof FormControls): boolean;
  isEmpty(field: NameKey | keyof FormControls): boolean {
    const controlName: keyof FormControls & string =
      this.isNameKey(field) ? `${field}_name` as ControlName : (field as any);
    return this.forms.isEmpty(this.formGroup.get(controlName));
  }

  clear(field: NameKey, value?: string): void;
  clear(field: keyof FormControls, value?: string): void;
  clear(field: NameKey | keyof FormControls, value: string = ''): void {
    const controlName: keyof FormControls & string =
      this.isNameKey(field) ? `${field}_name` as ControlName : (field as any);
    this.forms.clearControl(this.formGroup, controlName, this.formElement, value);
  }

  private ctrl(key: NameKey) {
    return this.formGroup.get(`${key}_name` as ControlName) as FormControl<string>;
  }

  private isNameKey(x: unknown): x is NameKey {
    return  x === 'prefix' || x === 'first' || x === 'middle' || 
            x === 'last'   || x === 'postfix';
  }

  getColleagues = computed(() => {

    const _ = this.langSvc.nameOrderVersion();

    const list = [...this.colleagues()];

    return list.sort((a, b) => this.sortByName(a, b));
  });

  getSubjects = computed(() => {
  
    const _ = this.langSvc.nameOrderVersion();

    const dict   = this.langSvc.state.data;
    const langId = this.langSvc.state.id;

    const list = [...this.subjects()];

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

  getDisplayName(c: Colleague): string {
    const name: UserName = {
      prefix_name:  c.prefix_name  ?? undefined,
      first_name:   c.first_name   ?? undefined,
      middle_name:  c.middle_name  ?? undefined,
      last_name:    c.last_name    ?? undefined,
      postfix_name: c.postfix_name ?? undefined,
    };
    return this.langSvc.getName(name);
  }
}
