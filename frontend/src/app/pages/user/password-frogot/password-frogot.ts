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
  faRightToBracket, faEnvelope, faCloudArrowUp,
  faCircleXmark, faCheck, faXmark, faStar,
  faArrowsRotate, faRobot, faSpinner,
  faTriangleExclamation, faCircleQuestion, faLocationDot
} from '@fortawesome/free-solid-svg-icons';
import { faHandPointRight } from '@fortawesome/free-regular-svg-icons';
import { AuthService, AuthUser } from '../../../core/auth.service';
import { LangService } from '../../../core/lang.service';
import { NavigationService } from '../../../shared/nav/navigation.service';
import { UtilityService } from '../../../shared/util/utility.service';
import {
  EmailValidators,
  FormUtilsService,
  codeEquals
} from '../../../shared/forms';
import { ModalService } from '../../../shared/modal/modal.service';

type FormControls = {
  email: FormControl<string>;
  code: FormControl<string>;
};

@Component({
  selector: 'app-password-frogot',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule, 
    ReactiveFormsModule, 
    FontAwesomeModule
  ],
  host: { class: 'block w-full' },
  templateUrl: './password-frogot.html',
  styleUrl: './password-frogot.css'
})

export class PasswordFrogot implements AfterViewInit {

  private modal = inject(ModalService);
  private auth  = inject(AuthService);

  icon = {  faRightToBracket, faEnvelope, faCloudArrowUp,
            faCircleXmark, faCheck, faXmark, faStar,
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
      email:  this.fb.control<string>('', [...EmailValidators,
                                              Validators.required,
                                              Validators.maxLength(253)]),
      code: this.fb.control<string>('', [ Validators.required, 
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

    // const startTime = new Date().getTime();
    // this.modal.loading('data_verification');
    this.error.set(null);

    const currentUser = this.auth.getUser();
    if (!currentUser || !currentUser.id) {
      this.modal.close();
      this.error.set('user_not_authenticated');
      this.modal.error('user_not_authenticated');
      return;
    }

    const raw = this.formGroup.getRawValue();
    const { code, ...data } = raw;
    const payload = { ...data, id: currentUser.id };

    // TODO: API hívás
    console.log('DEBUG: ', payload);

    //setTimeout(() => {

      // console.log(`Elapsed time: 
      //   ${this.util.elapsedTimeInSec(startTime)} seconds.`);
      // this.modal.close();
      
      //if (Math.floor(Math.random() * 2))
            this.modal.info('password_send_success', {
              messageSuffix: '',
              title: 'under_development', 
              onOk: () => this.nav.goHome() 
            });
      //else  this.modal.error('password_send_failed', { onOk: () => this.reset() });
    //}, 3000);
    return;
  }

  confirm() {
    this.modal.confirm('password_frogot_confirm', { 
      onYes: () => this.onSubmit() 
    });
  }

  reset() {
    this.error.set(null);
    this.getTestCode();
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
