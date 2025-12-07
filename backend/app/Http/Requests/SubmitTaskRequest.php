<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\ChapterTask;

class SubmitTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        // feltételezzük, hogy auth middleware védi
        return true;
    }

    public function rules(): array
    {
        /** @var ChapterTask $task */
        $task = $this->route('task');

        // alap validáció – típusfüggetlen
        $rules = [
            'text_answer'         => ['nullable', 'string'],
            'selected_option_ids' => ['nullable', 'array'],
            'selected_option_ids.*' => ['integer', 'exists:task_options,id'],
        ];

        if (! $task) {
            return $rules;
        }

        switch ($task->type) {
            case 'single_choice':
            case 'true_false':
                $rules['selected_option_ids'] = ['required', 'array', 'size:1'];
                break;

            case 'multiple_choice':
                $rules['selected_option_ids'] = ['required', 'array', 'min:1'];
                break;

            case 'text':
                $rules['text_answer'] = ['required', 'string'];
                break;
        }

        return $rules;
    }
}
