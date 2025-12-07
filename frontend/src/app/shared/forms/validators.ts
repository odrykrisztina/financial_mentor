import { 
  AbstractControl, 
  ValidationErrors, 
  Validators, 
  ValidatorFn,
  FormGroup
} from '@angular/forms';

const EMAIL_RE = /^[^\s@]+@(?:[^\s@]+\.)+[A-Za-z]{2,63}$/;
const PASSWORD_RE = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;
const PHONE_RE = /^[+()\-\s0-9]+$/;
const POSTAL_CODE_RE = /^[A-Za-z0-9\- ]{3,10}$/;
const ESCAPE_RE = /[-\\^$*+?.()|[\]{}]/g;
const DIGITS_RE = /\D+/g;

export const EmailValidators = [
  Validators.required,
  Validators.pattern(EMAIL_RE),
  Validators.maxLength(253),
];

export const PasswordValidators = [
  Validators.required,
  Validators.pattern(PASSWORD_RE),
  Validators.maxLength(20),
];

export function allowedCharsValidator(allowedExtra = " .,'-"): ValidatorFn {
  const re = new RegExp(`^[\\p{L}\\p{M}0-9${escapeForClass(allowedExtra)}]+$`, 'u');
  return (c: AbstractControl): ValidationErrors | null => {
    const v = (c.value ?? '').toString().trim();
    if (!v) return null;
    return re.test(v) ? null : { allowedChars: true };
  };
}

export const residenceValidator = allowedCharsValidator(" .'-");

export function postalCodeValidator(): ValidatorFn {
  return (c) => {
    const v = (c.value ?? '').toString().trim();
    if (!v) return null;
    return POSTAL_CODE_RE.test(v) ? null : { postalCode: true };
  };
}

export function phoneValidator(c: AbstractControl): ValidationErrors | null {
  const v = (c.value ?? '').toString().trim();
  if (!v) return null;
  if (!PHONE_RE.test(v)) return { phoneChars: true };
  const digits = v.replace(DIGITS_RE, '');
  if (digits.length < 9 || digits.length > 14) return { phoneLength: true };
  return null;
}

function escapeForClass(s: string): string {
  return s.replace(ESCAPE_RE, '\\$&');
}

export function codeEquals(getCode: () => string, {} = {}): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const raw = (control.value ?? '').toString().trim();
    const want = (getCode() ?? '').toString().trim();

    if (!raw) return { required: true };
    if (!want) return null;
    return raw === want ? null : { codeMismatch: true };
  };
}

export function fieldsCompareValidator(
  field1  : string,
  field2  : string,
  errorKey: string = 'fieldsCompare',
  isEqual : boolean = true
): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {

    const ctrl1 = group.get(field1);
    const ctrl2 = group.get(field2);
    if (!ctrl1 || !ctrl2) return null;

    const val1 = ctrl1.value;
    const val2 = ctrl2.value;

    if (val1 == null || val2 == null || 
        val1 === ''  || val2 === '') {
      return deletePreviousError(ctrl2);
    }

    const same = val1 === val2;
    const hasError = isEqual ? !same : same;

    if (hasError) {
            ctrl2.setErrors({ ...(ctrl2.errors || {}), [errorKey]: true });
            return { [errorKey]: true };
    } else  return deletePreviousError(ctrl2);

    function deletePreviousError(ctrl2: AbstractControl) {
      if (ctrl2.hasError(errorKey)) {
        const newErrors = { ...(ctrl2.errors || {}) };
        delete newErrors[errorKey];
        ctrl2.setErrors(Object.keys(newErrors).length ? newErrors : null);
      }
      return null;
    }
  };
}

export function fieldsValueChangedValidator<T extends object>(
  getInitial: () => T,
  fields?: (keyof T)[],
  extraChanged?: () => boolean
): ValidatorFn {

  return (control: AbstractControl): ValidationErrors | null => {
    if (!(control instanceof FormGroup)) {
      return null;
    }

    const current = control.getRawValue() as T;
    const initial = getInitial();
    if (!initial) return null;

    const keys: (keyof T)[] =
      fields && fields.length ? fields : (Object.keys(initial) as (keyof T)[]);

    const changedFields = keys.some((key) => current[key] !== initial[key]);
    const changedExtra  = extraChanged ? extraChanged() : false;

    return (changedFields || changedExtra) ? null : { noChanges: true };
  };
}