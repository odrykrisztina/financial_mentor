import { 
  Component, 
  ElementRef, 
  ViewChild, 
  AfterViewInit,
  HostListener,
  signal,
  inject
} from '@angular/core';
import {
  ReactiveFormsModule,
  NonNullableFormBuilder,
  FormGroup,
  FormControl,
  Validators
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import {  LangService } from '../../../core/lang.service';
import {  FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {  faEnvelope, faStar, faXmark, faCheck, faKey, faEye, 
          faRobot, faArrowsRotate, faFloppyDisk, faCircleXmark,
          faEnvelopeCircleCheck, faCircleQuestion
} from '@fortawesome/free-solid-svg-icons';
import { faHandPointRight } from '@fortawesome/free-regular-svg-icons';
import {
  EmailValidators,
  PasswordValidators,
  FormUtilsService,
  codeEquals,
  fieldsCompareValidator
} from '../../../shared/forms';
import { AuthService, AuthUser } from '../../../core/auth.service';
import { ModalService } from '../../../shared/modal/modal.service';
import { NavigationService } from '../../../shared/nav/navigation.service';
import { UtilityService } from '../../../shared/util/utility.service';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { env } from '../../../core/env';

type FormControls = {
  email_current: FormControl<string>;
  email: FormControl<string>;
  email_confirm: FormControl<string>;
  password: FormControl<string>;
  showPassword: FormControl<boolean>;
  code: FormControl<string>;
};

interface EmailUpdateResponse {
  status: 'ok' | 'error';
  messageKey: string;
  user?: AuthUser;
}

@Component({
  selector: 'app-email-change',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    FontAwesomeModule
],
  host: { class: 'block w-full' },
  templateUrl: './email-change.html',
  styleUrl: './email-change.css'
})

export class EmailChange implements AfterViewInit {

  private modal = inject(ModalService);
  private auth  = inject(AuthService);
  private http  = inject(HttpClient);
  readonly user = this.auth.user;
  
  icon = {  faEnvelope, faStar, faXmark, faCheck, faKey, faEye,
            faHandPointRight, faRobot, faArrowsRotate, 
            faFloppyDisk, faCircleXmark, faEnvelopeCircleCheck,
            faCircleQuestion };

  @ViewChild('reactiveForm', { static: false }) 
  formElement!: ElementRef<HTMLFormElement>;
  formGroup!: FormGroup<FormControls>;

  testCode: string = '';
  error = signal<string | null>(null);
  mounted = signal(false);

  constructor(
    private fb: NonNullableFormBuilder, 
    public langSvc: LangService,
    private forms: FormUtilsService,
    private nav: NavigationService,
    private util: UtilityService
  ) {

    this.formGroup = this.fb.group<FormControls>({
      email_current:  this.fb.control<string>({ value: this.auth.getUser()?.email ?? '', 
                                                disabled:true }),
      email:  this.fb.control<string>('', [...EmailValidators,
                                              Validators.required,
                                              Validators.maxLength(253)]),
      email_confirm:  this.fb.control<string>('', [...EmailValidators,
                                                      Validators.required,
                                                      Validators.maxLength(253)]),
      password: this.fb.control<string>('', [...PasswordValidators,
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
        fieldsCompareValidator('email_current', 'email', 'emailMatchCurrent', false),
        fieldsCompareValidator('email', 'email_confirm', 'emailMismatchConfirmed')
      ]
    });
  }

  get lang() { return this.langSvc.state; }
  get f() { return this.formGroup.controls; }
  
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

    const currentUser = this.auth.getUser();
    if (!currentUser || !currentUser.id) {
      this.error.set('user_not_authenticated');
      this.modal.error('user_not_authenticated', { 
        onOk: () => this.reset()
      });
      return;
    }

    const startTime = new Date().getTime();
    this.modal.loading('data_verification');
    this.error.set(null);

    const raw = this.formGroup.getRawValue();
    const email = (raw.email ?? '').trim();
    const { showPassword, email_confirm, code, ...data } = raw;
    const payload = { ...data, id: currentUser.id };

    try {
      const response = await firstValueFrom(
        this.http.post<EmailUpdateResponse>(
          `${env.apiBase}/auth/email-change`,
          payload,
          { observe: 'response' }
        )
      );

      console.log(`Elapsed time: 
          ${this.util.elapsedTimeInSec(startTime)} seconds.`);
      this.modal.close();

      // Sikeres mentés
      if (response.status === 200 && 
          response.body?.status === 'ok') {
        
        // Frissítés
        if (response.body.user)
              this.auth.setUser(response.body.user);
        else  this.auth.refreshMe();
        
        this.modal.info('email_change_success', { 
          onOk: () => {
            this.forms.saveLastEmail(email);
            this.nav.goBack();
          } 
        });
        return;
      }
      
      // Hiba
      const msgKey = response.body?.messageKey || 'email_change_failed';
      this.error.set(msgKey);
      this.modal.error(msgKey, { 
        onOk: () => this.reset()
      });

    } catch (err: any) {
      
      // Hiba
      console.log(`Elapsed time: 
          ${this.util.elapsedTimeInSec(startTime)} seconds.`);
      this.modal.close();
      const msgKey = err?.error?.messageKey || 'email_change_failed';
      this.error.set(msgKey);
      this.modal.error(msgKey, { 
        onOk: () => this.reset()
      });
    };
  }

  confirm() {
    this.modal.confirm('email_change_confirm', { 
      onYes: () => this.onSubmit() 
    });
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
    this.forms.setFocus(this.formGroup, this.formElement);
  }

  onCancel() { this.nav.goBack(); }

  clear(field: keyof FormControls, value: string = ''): void {
    const controlName: keyof FormControls & string = (field as any);
    this.forms.clearControl(this.formGroup, controlName, this.formElement, value);
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