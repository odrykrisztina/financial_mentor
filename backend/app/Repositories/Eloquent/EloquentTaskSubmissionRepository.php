<?php

namespace App\Repositories\Eloquent;

use App\Models\Course;
use App\Models\TaskSubmission;
use App\Repositories\Contracts\TaskSubmissionRepositoryInterface;
use Illuminate\Support\Collection;

class EloquentTaskSubmissionRepository implements TaskSubmissionRepositoryInterface
{
    public function getCorrectTaskIdsForCourseAndUser(Course $course, int $userId): Collection
    {
        return TaskSubmission::query()
            ->where('user_id', $userId)
            ->whereIn('task_id', $course->tasks->pluck('id'))
            ->where('is_correct', true)
            ->distinct('task_id')
            ->pluck('task_id');
    }
}
