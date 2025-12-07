<?php

namespace App\Repositories\Contracts;

use App\Models\Course;
use Illuminate\Support\Collection;

interface TaskSubmissionRepositoryInterface
{
    /**
     * Az adott user helyes megoldásai egy kurzus feladataira.
     * Visszaadja a task_id-k halmazát (distinct).
     */
    public function getCorrectTaskIdsForCourseAndUser(Course $course, int $userId): Collection;
}
