<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChapterTask extends Model
{
    protected $guarded = [];

    public function chapter()
    {
        return $this->belongsTo(CourseChapter::class, 'chapter_id');
    }

    public function options()
    {
        return $this->hasMany(TaskOption::class, 'task_id');
    }

    public function submissions()
    {
        return $this->hasMany(TaskSubmission::class, 'task_id');
    }
}
