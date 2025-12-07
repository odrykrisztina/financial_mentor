import { 
  Component, 
  ElementRef, 
  ViewChild, 
  AfterViewInit,
  HostListener,
  inject,
  signal
} from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  ReactiveFormsModule,
  NonNullableFormBuilder,
  FormGroup,
  FormControl,
  Validators
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faRightToBracket, faEye, faEnvelope,
  faKey, faCircleXmark, faCheck, faXmark, 
  faStar, faArrowsRotate, faRobot, faSpinner,
  faTriangleExclamation, faCircleQuestion,
  faLocationDot
} from '@fortawesome/free-solid-svg-icons';
import { faHandPointRight } from '@fortawesome/free-regular-svg-icons';
import { LangService } from '../../../core/lang.service';
import {
  EmailValidators,
  PasswordValidators,
  FormUtilsService,
  codeEquals
} from '../../../shared/forms';
import { AuthService } from '../../../core/auth.service';
import { ModalService } from '../../../shared/modal/modal.service';
import { NavigationService } from '../../../shared/nav/navigation.service';
import { UtilityService } from '../../../shared/util/utility.service';

type FormControls = {
  email: FormControl<string>;
  password: FormControl<string>;
  showPassword: FormControl<boolean>;
  stayLoggedIn: FormControl<boolean>;
  code: FormControl<string>;
};

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule, 
    ReactiveFormsModule, 
    FontAwesomeModule
  ],
  host: { class: 'block w-full' },
  templateUrl: './login.html',
  styleUrl: './login.css'
})

export class Login implements AfterViewInit {

  private auth = inject(AuthService);
  private modal = inject(ModalService);

  icon = {  faRightToBracket, faEye, faEnvelope, 
            faKey, faCircleXmark, faCheck, faXmark, faStar,
            faArrowsRotate, faRobot, faHandPointRight, faSpinner,
            faTriangleExclamation, faCircleQuestion, faLocationDot };

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
      email:        this.fb.control<string>('', [...EmailValidators,
                                                    Validators.required,
                                                    Validators.maxLength(253)]),
      password:     this.fb.control<string>('', [...PasswordValidators,
                                                    Validators.required,
                                                    Validators.maxLength(20)]),
      showPassword: this.fb.control<boolean>(false),
      stayLoggedIn: this.fb.control<boolean>(false),
      code:         this.fb.control<string>('', [ Validators.required, 
                                                  Validators.maxLength(6),
                                                  codeEquals(() => this.testCode)
                                                ])
    });
  }

  get lang() { return this.langSvc.state; }
  get f() { return this.formGroup.controls; }

  ngOnInit() {
    const lastEmail = this.forms.loadLastEmail();
    if (lastEmail) this.formGroup.patchValue({ email: lastEmail });
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
    this.modal.loading('data_authentication');
    this.error.set(null);

    const raw = this.formGroup.getRawValue();
    const email = (raw.email ?? '').trim();
    const { showPassword, stayLoggedIn, code, ...data } = raw;

    this.auth.setStayLoggedIn(!!stayLoggedIn);

    this.auth.login(data).subscribe({
      next: () => {
        console.log(`Elapsed time: 
          ${this.util.elapsedTimeInSec(startTime)} seconds.`);
        this.forms.saveLastEmail(email);
        this.modal.close();
        this.onCancel();
      },
      error: (err) => {
        console.log(`Elapsed time: 
          ${this.util.elapsedTimeInSec(startTime)} seconds.`);
        const message = err?.error?.message ?? 'user_login_failed';
        this.error.set(message);
        this.modal.close();
        this.modal.error(message, { onOk: () => this.reset() });
      }
    });
  }

  reset() {
    this.error.set(null);
    this.getTestCode();
    this.clear('password');
    this.f.password.updateValueAndValidity({ emitEvent: false });
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
