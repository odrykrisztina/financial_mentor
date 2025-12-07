<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Course extends Model
{
    use SoftDeletes;

    protected $guarded = [];

    public function chapters()
    {
        return $this->hasMany(CourseChapter::class);
    }

    public function prerequisites()
    {
        // azok a kurzusok, amiket előtte el kell végezni
        return $this->belongsToMany(
            Course::class,
            'course_prerequisites',
            'course_id',
            'required_course_id'
        );
    }

    public function requiredBy()
    {
        // azok a kurzusok, amelyeknek ez az előfeltétele
        return $this->belongsToMany(
            Course::class,
            'course_prerequisites',
            'required_course_id',
            'course_id'
        );
    }

    public function students()
    {
        return $this->belongsToMany(User::class, 'course_user')
            ->withPivot(['status', 'score', 'completed_at'])
            ->withTimestamps();
    }

    public function tasks()
    {
        return $this->hasManyThrough(
            ChapterTask::class,
            CourseChapter::class,
            'course_id', // foreign key on chapters
            'chapter_id', // foreign key on tasks
            'id',
            'id'
        );
    }
}
