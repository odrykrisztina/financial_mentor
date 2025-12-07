import { 
  Component, 
  ElementRef, 
  ViewChild, 
  AfterViewInit, 
  HostListener,
  signal,
  inject,
  effect 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  NonNullableFormBuilder,
  FormGroup,
  FormControl,
  Validators
} from '@angular/forms';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faCheck, faXmark, faIdCard, faUser, faStar,
  faFloppyDisk, faCircleXmark, faCalendarDays,
  faVenusMars, faMobileScreenButton, faLocationDot,
  faUpload, faRobot, faArrowsRotate, faCity,
  faEnvelopesBulk, faKey, faEye
} from '@fortawesome/free-solid-svg-icons';
import { faHandPointRight } from '@fortawesome/free-regular-svg-icons';
import { LangService } from '../../../core/lang.service';
import { 
  FormUtilsService, 
  phoneValidator, 
  codeEquals,
  allowedCharsValidator,
  residenceValidator,
  postalCodeValidator,
  fieldsValueChangedValidator,
  PasswordValidators 
} from '../../../shared/forms';
import { AuthService, AuthUser } from '../../../core/auth.service';
import { ModalService } from '../../../shared/modal/modal.service';
import { NavigationService } from '../../../shared/nav/navigation.service';
import { UtilityService } from '../../../shared/util/utility.service';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { env } from '../../../core/env';

type Gender = '' | 'F' | 'M';
type NameKey = 'prefix'|'first'|'middle'|'last'|'postfix';
type ControlName = `${NameKey}_name`;
type NameForm = { [K in ControlName]: FormControl<string>; };

type FormControls = NameForm & {
  id:           FormControl<number>;
  born:         FormControl<string>;
  gender:       FormControl<Gender>;
  phone:        FormControl<string>;
  residence:    FormControl<string>; 
  postal_code:  FormControl<string>;
  address:      FormControl<string>;
  image:        FormControl<File|null>;
  password:     FormControl<string>;        
  showPassword: FormControl<boolean>;
  code:         FormControl<string>;
};

type ProfileInitial = {
  id: number;
  prefix_name: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  postfix_name: string;
  born: string;
  gender: string;
  phone: string;    
  residence: string;
  postal_code: string;
  address: string;
};

const MAX_IMAGE_KB = 256;
const ERROR_DISPLAY_SEC = 5;

interface ProfileUpdateResponse {
  status: 'ok' | 'error';
  messageKey: string;
  user?: AuthUser;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    FontAwesomeModule,
  ],
  host: { class: 'block w-full' },
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})

export class Profile implements AfterViewInit {
  
  private auth  = inject(AuthService);
  private http  = inject(HttpClient);
  private modal = inject(ModalService);
 
  icon = {
    faCheck, faXmark, faIdCard, faUser, faStar,
    faFloppyDisk, faCircleXmark, faCalendarDays,
    faVenusMars, faMobileScreenButton, faLocationDot,
    faUpload, faRobot, faHandPointRight, faArrowsRotate, 
    faCity, faEnvelopesBulk, faKey, faEye
  };

  @ViewChild('reactiveForm', { static: false })
  formElement!: ElementRef<HTMLFormElement>;
  formGroup!: FormGroup<FormControls>;
  private initialProfile!: ProfileInitial;

  hasCustomImage: boolean = false;
  imageStyle!: SafeStyle;
  imageError: string = '';
  testCode: string = '';
  mounted = signal(false);
  error = signal<string | null>(null);

  private currentImageUrl: string | null = null;
  private initialImageUrl: string | null = null;
  private isInitialImgSet: boolean = false;
  private imageDeleted = false;

  constructor(
    private fb: NonNullableFormBuilder,
    public  langSvc: LangService,
    private forms: FormUtilsService,
    private sanitizer: DomSanitizer,
    private nav: NavigationService,
    private util: UtilityService
  ) {
    effect(() => {
      const user = this.auth.user();
      if (!user) return;

      let url: string;
      if (user.img) {
        url = user.img;
        this.hasCustomImage = true;
      } else {
        url = `assets/media/image/blank/${user.gender==='F'?'fe':''}male-blank.webp`;
        this.hasCustomImage = false;
      }

      this.currentImageUrl = url;
      if (!this.isInitialImgSet) {
        this.isInitialImgSet = true;
        this.initialImageUrl = url;
      }

      this.imageStyle = this.sanitizer.bypassSecurityTrustStyle(`url("${url}")`);

      this.formGroup.patchValue({
        id: user.id ?? 0,
        prefix_name: user.prefix_name ?? '',
        first_name: user.first_name ?? '',
        middle_name: user.middle_name ?? '',
        last_name: user.last_name ?? '',
        postfix_name: user.postfix_name ?? '',
        born: user.born?? '',
        gender: user.gender?? '',
        phone: user.phone?? '',     
        residence: user.residence?? '',  
        postal_code: user.postal_code?? '',
        address: user.address?? ''   
      });

      this.initialProfile = {
        id: user.id ?? 0,
        prefix_name: user.prefix_name ?? '',
        first_name: user.first_name ?? '',
        middle_name: user.middle_name ?? '',
        last_name: user.last_name ?? '',
        postfix_name: user.postfix_name ?? '',
        born: user.born?? '',
        gender: user.gender?? '',
        phone: user.phone?? '',     
        residence: user.residence?? '',  
        postal_code: user.postal_code?? '',
        address: user.address?? ''
      };
    });

    this.formGroup = this.fb.group({
      id:           this.fb.control<number>(0),
      prefix_name:  this.fb.control<string>('', [ allowedCharsValidator() , 
                                                  Validators.maxLength(20)]),
      first_name:   this.fb.control<string>('', [ Validators.required, 
                                                  allowedCharsValidator(), 
                                                  Validators.maxLength(100)]),
      middle_name:  this.fb.control<string>('', [ allowedCharsValidator(), 
                                                  Validators.maxLength(100)]),
      last_name:    this.fb.control<string>('', [ Validators.required, 
                                                  allowedCharsValidator(), 
                                                  Validators.maxLength(100)]),
      postfix_name: this.fb.control<string>('', [ allowedCharsValidator(), 
                                                  Validators.maxLength(20)]),
      born:         this.fb.control<string>('', [ Validators.required]),
      gender:       this.fb.control<''|'F'|'M'>('', [Validators.required]),
      image:        new FormControl<File|null>(null),
      phone:        this.fb.control<string>('', [ Validators.required, 
                                                  Validators.maxLength(30), 
                                                  phoneValidator]),
      residence:    this.fb.control<string>('', [ Validators.required, 
                                                  Validators.maxLength(100), 
                                                  residenceValidator]),
      postal_code:  this.fb.control<string>('', [ Validators.required, 
                                                  Validators.maxLength(20), 
                                                  postalCodeValidator()]),
      address:      this.fb.control<string>('', [ Validators.required, 
                                                  Validators.maxLength(200)]),
      password:     this.fb.control<string>('', [ ...PasswordValidators,
                                                  Validators.required, 
                                                  Validators.maxLength(20) ]),
      showPassword: this.fb.control<boolean>(false),
      code:         this.fb.control<string>('', [ Validators.required, 
                                                  Validators.maxLength(6),
                                                  codeEquals(() => this.testCode)
                                                ])
    }, {
      validators: [
        fieldsValueChangedValidator<ProfileInitial>(
          () => this.initialProfile,
          [ 'id',
            'prefix_name',
            'first_name',
            'middle_name',
            'last_name',
            'postfix_name',
            'born',
            'gender',
            'phone',    
            'residence',
            'postal_code',
            'address'
          ],
          () => this.currentImageUrl !== this.initialImageUrl
        )
      ]
    });
  }

  get lang() { return this.langSvc.state; }
  get f() { return this.formGroup.controls; }
  get nameKeys(): ReadonlyArray<NameKey> { return this.langSvc.getNameOrderRule(); }

  ngOnInit() { 
    this.getTestCode(true);
    this.applyGenderBackground(); 
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

    const raw  = this.formGroup.getRawValue();
    const file = raw.image ?? null;

    const { image, code, showPassword, ...rest } = raw as any;
    const data: any = { ...rest };

    if (file) {
      const dataUrl = await this.forms.readAsDataURL(file);
      const [header, base64] = dataUrl.split(',');
      const mimeMatch = header.match(/data:(.*);base64/);

      data.img      = base64 ?? null;
      data.img_type = mimeMatch?.[1] || file.type || null;

    } else if (this.imageDeleted) {
      data.img      = null;
      data.img_type = null;
    }

    try {
      const response = await firstValueFrom(
        this.http.put<ProfileUpdateResponse>(
          `${env.apiBase}/auth/profile`,
          data,
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

        this.imageDeleted = false;

        this.modal.info('data_saved_success', {
          onOk: () => this.reset()
        });
        return;
      }

      // Hiba
      const msgKey = response.body?.messageKey || 'data_saved_failed';
      this.modal.error(msgKey, { 
        onOk: () => this.restoreProfileFromInitial()
       });

    } catch (err: any) {

      // Hiba
      this.modal.close();
      const msgKey = err?.error?.messageKey || 'data_saved_failed';
      this.modal.error(msgKey, { 
        onOk: () => this.restoreProfileFromInitial() 
      });
    };
  }

  private restoreProfileFromInitial() {

    if (!this.initialProfile) return;

    const p = this.initialProfile;

    // Űrlap mezők visszaállítása
    this.formGroup.patchValue({
      id:           p.id,
      prefix_name:  p.prefix_name,
      first_name:   p.first_name,
      middle_name:  p.middle_name,
      last_name:    p.last_name,
      postfix_name: p.postfix_name,
      born:         p.born,
      gender:       p.gender as Gender,
      phone:        p.phone,
      residence:    p.residence,
      postal_code:  p.postal_code,
      address:      p.address,
      image:        null,
      code:         '',
      password:     '',
    });

    // Képes rész visszaállítása
    if (this.initialImageUrl) {
      this.currentImageUrl = this.initialImageUrl;
      this.hasCustomImage = !!this.auth.user()?.img;
      this.imageStyle = this.sanitizer
                            .bypassSecurityTrustStyle(`url("${this.initialImageUrl}")`);
    } else {
      this.currentImageUrl = null;
      this.hasCustomImage = false;
      this.applyGenderBackground();
    }

    // állapot jelzők
    const imageCtrl = this.formGroup.get('image');
    if (imageCtrl) imageCtrl.setValue(null, { emitEvent: false });

    this.formGroup.markAsPristine();
    this.formGroup.markAsUntouched();
    this.forms.setFocus(this.formGroup, this.formElement);
  }

  reset() {
    this.error.set(null);
    this.getTestCode();
    this.clear('password');
    this.forms.setFocus(this.formGroup, this.formElement);
  }

  confirm() {
    this.modal.confirm('data_saves_changes', { 
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

  onGenderChanged() {
    this.setImageError();
    if (!this.hasCustomImage) this.applyGenderBackground();
  }

  private applyGenderBackground() {
    if (!this.gender) {
      this.imageStyle = this.sanitizer.bypassSecurityTrustStyle('none');
      this.currentImageUrl = null;
      return;
    }
    const url = `assets/media/image/blank/${this.gender==='F'?'fe':''}male-blank.webp`;
    this.imageStyle = this.sanitizer.bypassSecurityTrustStyle(`url("${url}")`);
    this.currentImageUrl = url;
  }

  async onImageChanged(ev: Event) {

    this.setImageError();
    const input = ev.target as HTMLInputElement;
    const file  = input.files?.[0] ?? null;
    const imageCtrl = this.formGroup.get('image') as FormControl<File|null>;

    if (!file) {
      if (this.hasCustomImage) {
        this.imageDeleted = true;
      }
      imageCtrl.setValue(null);
      this.hasCustomImage = false;
      this.applyGenderBackground();
      this.formGroup.updateValueAndValidity({ emitEvent: false });
      return;
    }

    this.imageDeleted = false;

    if (!file.type.startsWith('image/')) {
      this.setImageError(this.lang.data['image_error_only_image']);
      this.clearImage(input);
      return;
    }

    if (file.size > MAX_IMAGE_KB * 1024) {
      this.setImageError(
        this.lang.data['image_error_too_big']
            .replace('%MAX_IMAGE_KB%', MAX_IMAGE_KB.toString())
      );
      this.clearImage(input);
      return;
    }

    try {
      const dataUrl = await this.forms.readAsDataURL(file);
      this.hasCustomImage = true;
      this.currentImageUrl = dataUrl;
      this.imageDeleted = false;
      this.imageStyle = this.sanitizer
        .bypassSecurityTrustStyle(`url("${dataUrl}")`);

      imageCtrl.setValue(file);
      this.formGroup.updateValueAndValidity({ emitEvent: false });

    } catch {
      this.setImageError(this.lang.data['image_error_scan_failed']);
      this.clearImage(input);
    }
  }

  clearImage(fileInput: HTMLInputElement) {
    const imageCtrl = this.formGroup.get('image') as FormControl<File|null>;
    imageCtrl.setValue(null);
    this.hasCustomImage = false;
    this.imageDeleted = true;
    this.applyGenderBackground();
    this.formGroup.updateValueAndValidity({ emitEvent: false });
    fileInput.value = '';
  }

  setImageError(msg: string = '') {
    this.imageError = msg;
    if (msg) {
      const timeoutId = setTimeout(() => {
        clearTimeout(timeoutId);
        this.setImageError();
      }, ERROR_DISPLAY_SEC * 1000);
    };
  }

  getImgMaxSize() { return MAX_IMAGE_KB; }

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
