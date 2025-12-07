<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ChangeEmailRequest extends FormRequest
{
  public function authorize(): bool
  {
      return true;
  }

  protected function prepareForValidation(): void
  {
    $this->merge([
      'email_current' => $this->email_current
        ? mb_strtolower(trim($this->email_current))
        : null,
      'email' => $this->email
        ? mb_strtolower(trim($this->email))
        : null,
    ]);
  }

  public function rules(): array
  {
    return [
        
      'id' => ['sometimes', 'integer', 'exists:users,id'],

      'email_current' => [
        'required',
        'string',
        'email:filter',
        'max:253',
      ],
      'email' => [
        'required',
        'string',
        'email:filter',
        'max:253',
        'different:email_current',
      ],
      'password' => [
        'required',
        'string',
        'min:6',
        'max:20',
      ],
    ];
  }

  public function attributes(): array
  {
    return [
      'email_current' => 'jelenlegi e-mail',
      'email'         => 'új e-mail',
      'password'      => 'jelszó',
    ];
  }
}
