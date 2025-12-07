<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        // auth:sanctum úgyis védi, itt engedjük
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'prefix_name'  => $this->nullIfEmpty($this->prefix_name),
            'middle_name'  => $this->nullIfEmpty($this->middle_name),
            'postfix_name' => $this->nullIfEmpty($this->postfix_name),
            'phone'        => $this->nullIfEmpty($this->phone),
            'residence'    => $this->nullIfEmpty($this->residence),
            'postal_code'  => $this->nullIfEmpty($this->postal_code),
            'address'      => $this->nullIfEmpty($this->address),
        ]);
    }

    private function nullIfEmpty($value): ?string
    {
        return isset($value) && $value === '' ? null : $value;
    }

    public function rules(): array
    {
        return [
            
            'id' => ['sometimes','integer','exists:users,id'],

            'prefix_name'  => ['nullable','string','max:20'],
            'first_name'   => ['required','string','max:100'],
            'middle_name'  => ['nullable','string','max:100'],
            'last_name'    => ['required','string','max:100'],
            'postfix_name' => ['nullable','string','max:20'],

            'born'   => ['required','date','before_or_equal:today'],
            'gender' => ['required','in:M,F'],

            'phone'       => ['required','string','max:30'],
            'residence'   => ['required','string','max:100'],
            'postal_code' => ['required','string','max:20'],
            'address'     => ['required','string','max:200'],

            // kép kezelése
            'img'      => ['nullable','string'],  
            'img_type' => ['nullable','string','max:100'], 

            'password' => ['required','string','min:6','max:20'],   
        ];
    }

    public function attributes(): array
    {
        return [
            'first_name'  => 'keresztnév',
            'last_name'   => 'vezetéknév',
            'born'        => 'születési dátum',
            'phone'       => 'telefonszám',
            'residence'   => 'lakóhely',
            'postal_code' => 'irányítószám',
            'address'     => 'cím',
        ];
    }
}
