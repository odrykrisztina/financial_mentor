<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ChangeMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id'                    => ['required', 'integer', 'exists:messages,id'],
            'worker_id'             => ['required', 'integer', 'exists:workers,id'],
            'status_id'             => ['required', 'string', 'max:20'],
            'user_id'               => ['required', 'integer'],
            'worker_id_modified'    => ['required', 'integer'],
        ];
    }
}
