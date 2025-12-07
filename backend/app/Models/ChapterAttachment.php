<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChapterAttachment extends Model
{
    protected $guarded = [];

    public function chapter()
    {
        return $this->belongsTo(CourseChapter::class, 'chapter_id');
    }
}
