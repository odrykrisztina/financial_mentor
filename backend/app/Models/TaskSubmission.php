<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TaskSubmission extends Model
{
    protected $guarded = [];

    protected $casts = [
        'selected_option_ids' => 'array',
        'submitted_at' => 'datetime',
    ];

    public function task()
    {
        return $this->belongsTo(ChapterTask::class, 'task_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
