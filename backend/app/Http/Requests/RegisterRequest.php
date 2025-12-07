<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class RegisterRequest extends FormRequest
{
  public function authorize(): bool
  {
    return true;
  }

  protected function prepareForValidation(): void
  {
    $this->merge([
      'email' => $this->email ? mb_strtolower($this->email) : null,
      'prefix_name'  => $this->nullIfEmpty($this->prefix_name),
      'middle_name'  => $this->nullIfEmpty($this->middle_name),
      'postfix_name' => $this->nullIfEmpty($this->postfix_name),
    ]);
  }

  private function nullIfEmpty($value): ?string
  {
    return isset($value) && $value === '' ? null : $value;
  }

  public function rules(): array
  {
    return [
      'prefix_name'  => ['nullable','string','max:20'],
      'first_name'   => ['required','string','max:100'],
      'middle_name'  => ['nullable','string','max:100'],
      'last_name'    => ['required','string','max:100'],
      'postfix_name' => ['nullable','string','max:20'],
      'born'   => ['required','date','before_or_equal:today'],
      'gender' => ['required','in:M,F'],
      'email' => [
        'required',
        'string',
        'email:filter',
        'max:253',
        'unique:users,email', 
      ],
      'password' => ['required','string','min:6','max:20'],
    ];
  }

  public function attributes(): array
  {
    return [
      'first_name' => 'keresztnév',
      'last_name'  => 'vezetéknév',
      'born'       => 'születési dátum',
      'email'      => 'e-mail',
    ];
  }

  public function messages(): array
  {
    return [
      'email.unique' => 'register_email_already_exists',
    ];
  }

  protected function failedValidation(Validator $validator)
  {
    $errors = $validator->errors();

    $messageKey = 'register_failed';

    if ($errors->has('email')) {
      $emailErrors = $errors->get('email');
      if (in_array('register_email_already_exists', $emailErrors, true)) {
        $messageKey = 'register_email_already_exists';
      }
    }

    throw new HttpResponseException(
      response()->json([
        'status'     => 'error',
        'messageKey' => $messageKey,
        'errors'     => $errors,
      ], 422)
    );
  }
}
