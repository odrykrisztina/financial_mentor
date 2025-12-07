import { 
  Component, 
  ElementRef, 
  ViewChild, 
  AfterViewInit, 
  HostListener,
  signal,
  inject
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
    faCheck, faXmark, faUser, faStar,
    faCircleXmark, faCalendarDays,
    faVenusMars, faUserPlus, faEye,
    faRobot, faArrowsRotate, faUnlockKeyhole, 
    faEnvelope, faEnvelopeCircleCheck, faKey
} from '@fortawesome/free-solid-svg-icons';
import { faHandPointRight } from '@fortawesome/free-regular-svg-icons';
import { LangService, UserName } from '../../../core/lang.service';
import { ModalService } from '../../../shared/modal/modal.service';
import { 
  FormUtilsService,
  allowedCharsValidator,
  EmailValidators,
  PasswordValidators, 
  codeEquals,
  fieldsCompareValidator
} from '../../../shared/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { env } from '../../../core/env';
import { NavigationService } from '../../../shared/nav/navigation.service';
import { UtilityService } from '../../../shared/util/utility.service';

type Gender = '' | 'F' | 'M';
type NameKey = 'prefix'|'first'|'middle'|'last'|'postfix';
type ControlName = `${NameKey}_name`;
type NameForm = { [K in ControlName]: FormControl<string>; };

type FormControls = NameForm & {
  born:             FormControl<string>;
  gender:           FormControl<Gender>;
  email:            FormControl<string>;
  email_confirm:    FormControl<string>; 
  password:         FormControl<string>;
  password_confirm: FormControl<string>;
  showPassword:     FormControl<boolean>;
  code:             FormControl<string>;
};

interface RegisterResponse {
  status: 'ok' | 'error';
  messageKey: string;
  user?: UserName & {
    id: number;
    email: string;
  };
}

@Component({
  selector: 'app-register',
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    FontAwesomeModule,
  ],
  host: { class: 'block w-full' },
  templateUrl: './register.html',
  styleUrl: './register.css'
})

export class Register implements AfterViewInit {

  private modal = inject(ModalService);

  icon = {
    faCheck, faXmark, faUser, faStar,
    faCircleXmark, faCalendarDays,
    faVenusMars, faUserPlus, faEye,
    faRobot, faArrowsRotate, faUnlockKeyhole, 
    faEnvelope, faEnvelopeCircleCheck, faKey, faHandPointRight
  };

  @ViewChild('reactiveForm', { static: false })
  formElement!: ElementRef<HTMLFormElement>;
  formGroup!: FormGroup<FormControls>;
  
  testCode: string = '';
  error = signal<string | null>(null);
  mounted = signal(false);

  constructor(
    private fb: NonNullableFormBuilder,
    public  langSvc: LangService,
    private forms: FormUtilsService,
    private http: HttpClient,
    private router: Router,
    private nav: NavigationService,
    private util: UtilityService
  ) {
    this.formGroup = this.fb.group({
      prefix_name: this.fb.control<string>('', [ allowedCharsValidator(), 
                                                 Validators.maxLength(20)]),
      first_name: this.fb.control<string>('', [ Validators.required, 
                                                allowedCharsValidator(), 
                                                Validators.maxLength(100)]),
      middle_name: this.fb.control<string>('', [ allowedCharsValidator(), 
                                                 Validators.maxLength(100)]),
      last_name: this.fb.control<string>('', [ Validators.required, 
                                               allowedCharsValidator(), 
                                               Validators.maxLength(100)]),
      postfix_name: this.fb.control<string>('', [ allowedCharsValidator(), 
                                                  Validators.maxLength(20)]),
      born: this.fb.control<string>('', [ Validators.required]),
      gender: this.fb.control<''|'F'|'M'>('', [Validators.required]),
      email: this.fb.control<string>('', [ ...EmailValidators,
                                              Validators.required,
                                              Validators.maxLength(253)]),
      email_confirm: this.fb.control<string>('', [ ...EmailValidators,
                                                      Validators.required,
                                                      Validators.maxLength(253)]),
      password: this.fb.control<string>('', [...PasswordValidators,
                                                Validators.required,
                                                Validators.maxLength(20)]),
      password_confirm: this.fb.control<string>('', [...PasswordValidators,
                                                        Validators.required,
                                                        Validators.maxLength(20)]),
      showPassword: this.fb.control<boolean>(false),
      code: this.fb.control<string>('', [ Validators.required, 
                                          Validators.maxLength(6),
                                          codeEquals(() => this.testCode)
                                        ])
    },
    {
      validators: [
        fieldsCompareValidator('email', 'email_confirm', 'emailMismatchConfirmed'),
        fieldsCompareValidator('password', 'password_confirm', 'passwordMismatchConfirmed')
      ]
    });
  }

  get lang() { return this.langSvc.state; }
  get f() { return this.formGroup.controls; }
  get nameKeys(): ReadonlyArray<NameKey> { return this.langSvc.getNameOrderRule(); }

  ngOnInit() {
    this.getTestCode(true); 
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
    this.modal.loading('data_verification');
    this.error.set(null);

    const raw = this.formGroup.getRawValue();
    const { email_confirm, 
            password_confirm, 
            showPassword, 
            code, ...rest } = raw as any;
    const data = { ...rest };

    try {

      // Http request
      const response = await firstValueFrom(
        this.http.post<RegisterResponse>(
          `${env.apiBase}/auth/register`,
          data,
          { observe: 'response' }
        )
      );

      console.log(`Elapsed time: 
        ${this.util.elapsedTimeInSec(startTime)} seconds.`);
      this.modal.close();

      // Sikeres regisztráció
      if (response.status === 201 && 
          response.body?.status === 'ok') {

        const title = `${this.util.capitalize(this.lang.data['register_success'])}`;
        const greeting =  `${this.util.capitalize(this.lang.data['welcome'])} ` +
                          `${this.langSvc.getName(response.body.user)}!`;
        const msg = `${this.util.capitalize(this.lang.data['login_please_in'])}!`;
            
        this.modal.info(greeting + "\n" + msg, {
          title: title,
          titleSuffix: '!',
          translate: false,
          onOk: () => {
            this.forms.saveLastEmail(response.body?.user?.email);
            this.router.navigateByUrl('/login');
          },
        });
        return;
      }

      // Ha valami furcsa, de nem dobott hibát
      this.modal.error('register_failed', { onOk: () => this.reset() });

    } catch (err: any) {

      this.modal.close();
      this.modal.error(err.error?.messageKey, { onOk: () => this.reset() });
    }
    return;
  }

  reset() {
    this.error.set(null);
    this.getTestCode();
    this.clear('email');
    this.f.email.updateValueAndValidity({ emitEvent: false });
    this.clear('email_confirm');
    this.f.email_confirm.updateValueAndValidity({ emitEvent: false });
    this.clear('password');
    this.f.password.updateValueAndValidity({ emitEvent: false });
    this.clear('password_confirm');
    this.f.password_confirm.updateValueAndValidity({ emitEvent: false });
    this.forms.setFocus(this.formGroup, this.formElement);
  }

  confirm() {
    this.modal.confirm('register_is_starting', { 
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

  private get gender(): Gender {
    return (this.formGroup.get('gender')?.value ?? '') as Gender;
  }

  getDate(yearDiff: number = 0): string {
    return this.forms.getDate(yearDiff);
  }

  getTestCode(isInit: boolean = false): void {
    this.testCode = this.forms.getTestCode();
    if (!isInit) this.clear('code');
    this.f.code.updateValueAndValidity({ emitEvent: false });
  }
    
  @HostListener('document:keyup', ['$event'])
  handleKeyUp(event: KeyboardEvent) {
    if (event.shiftKey && event.altKey && event.code === 'KeyC') {
      event.preventDefault();
      const ctrl = this.formGroup.get('code');
      if (!ctrl) return;
      ctrl.setValue(this.testCode);
      ctrl.markAsDirty();
      ctrl.markAsTouched();
    }
  }
}
