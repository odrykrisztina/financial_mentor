<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ChangePasswordRequest extends FormRequest
{
  public function authorize(): bool
  {
      return true;
  }

  public function rules(): array
  {
    return [
        
      'id' => ['sometimes', 'integer', 'exists:users,id'],

      'password_current' => [
        'required',
        'string',
        'min:6',
        'max:20',
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
      'password_current' => 'jelenlegi jelszó',
      'password'         => 'új jelszó',
    ];
  }
}
