<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TaskOption extends Model
{
    protected $guarded = [];

    public function task()
    {
        return $this->belongsTo(ChapterTask::class, 'task_id');
    }
}
