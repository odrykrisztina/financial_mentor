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
          faEnvelopeCircleCheck, faLock, faUnlockKeyhole,
          faCircleQuestion, faSpinner, faTriangleExclamation, 
          faCircleInfo
} from '@fortawesome/free-solid-svg-icons';
import { faHandPointRight } from '@fortawesome/free-regular-svg-icons';
import {
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
  password_current: FormControl<string>;
  password: FormControl<string>;
  password_confirm: FormControl<string>;
  showPassword: FormControl<boolean>;
  code: FormControl<string>;
};

interface PasswordUpdateResponse {
  status: 'ok' | 'error';
  messageKey: string;
}

@Component({
  selector: 'app-password-change',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    FontAwesomeModule
],
  host: { class: 'block w-full' },
  templateUrl: './password-change.html',
  styleUrl: './password-change.css'
})

export class PasswordChange  implements AfterViewInit {

  private modal = inject(ModalService);
  private auth = inject(AuthService);
  private http  = inject(HttpClient);
  readonly user = this.auth.user;
  
  icon = {  faEnvelope, faStar, faXmark, faCheck, faKey, faEye,
            faHandPointRight, faRobot, faArrowsRotate, faLock,
            faFloppyDisk, faCircleXmark, faEnvelopeCircleCheck,
            faUnlockKeyhole, faCircleQuestion, faSpinner, 
            faTriangleExclamation, faCircleInfo };

  @ViewChild('reactiveForm', { static: false }) 
  formElement!: ElementRef<HTMLFormElement>;
  formGroup!: FormGroup<FormControls>;
  
  testCode: string = '';
  mounted = signal(false);
  error = signal<string | null>(null);

  constructor(
    private fb: NonNullableFormBuilder, 
    public langSvc: LangService,
    private forms: FormUtilsService,
    private nav: NavigationService,
    private util: UtilityService
  ) {

    this.formGroup = this.fb.group<FormControls>({
      password_current: this.fb.control<string>('', [...PasswordValidators,
                                                        Validators.required,
                                                        Validators.maxLength(20)]),
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
        fieldsCompareValidator('password_current', 'password', 'passwordMatchCurrent', false),
        fieldsCompareValidator('password', 'password_confirm', 'passwordMismatchConfirmed')
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
    const { showPassword, password_confirm, code, ...data } = raw;
    const payload = { ...data, id: currentUser.id };

    try {
      const response = await firstValueFrom(
        this.http.post<PasswordUpdateResponse>(
          `${env.apiBase}/auth/password-change`,
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

        const msgKey = response.body?.messageKey || 'password_change_success';
        this.modal.info(msgKey, { onOk: () => {
          this.auth.logout();
          this.nav.goTo('login'); 
        }});
        return;
      }
      
      // Hiba
      const msgKey = response.body?.messageKey || 'password_change_failed';
      this.error.set(msgKey);
      this.modal.error(msgKey, { onOk: () => this.reset() });

    } catch (err: any) {
      
      // Hiba
      console.log(`Elapsed time: 
          ${this.util.elapsedTimeInSec(startTime)} seconds.`);
      this.modal.close();
      const msgKey = err?.error?.messageKey || 'password_change_failed';
      this.error.set(msgKey);
      this.modal.error(msgKey, { onOk: () => this.reset() });
    };
  }

  confirm() {
    this.modal.confirm('password_change_confirm', {
      messageSuffix: '', 
      onYes: () => this.onSubmit() 
    });
  }

  reset() {
    this.error.set(null);
    this.getTestCode();
    this.clear('password_current');
    this.f.password_current.updateValueAndValidity({ emitEvent: false });
    this.clear('password');
    this.f.password.updateValueAndValidity({ emitEvent: false });
    this.clear('password_confirm');
    this.f.password_confirm.updateValueAndValidity({ emitEvent: false });
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
