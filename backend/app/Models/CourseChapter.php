<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CourseChapter extends Model
{
    protected $guarded = [];

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function attachments()
    {
        return $this->hasMany(ChapterAttachment::class, 'chapter_id');
    }

    public function tasks()
    {
        return $this->hasMany(ChapterTask::class, 'chapter_id');
    }
}
