<?php

namespace App\Repositories\Contracts;

use App\Models\Course;
use Illuminate\Support\Collection;

interface CourseRepositoryInterface
{
    public function findWithStructure(int $courseId): Course;

    public function getAvailableForUser(int $userId): Collection;

    public function getLockedForUser(int $userId): Collection;

    public function getCourseWithTasks(int $courseId): Course;
}
