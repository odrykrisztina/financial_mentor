<?php

namespace App\Services;

use App\Models\Course;
use App\Repositories\Contracts\TaskSubmissionRepositoryInterface;

class CourseProgressService
{
    public function __construct(
        protected TaskSubmissionRepositoryInterface $taskSubmissions,
    ) {}

    /**
     * Visszaadja:
     * - totalTasks
     * - completedTasks
     * - progressPercent
     */
    public function calculateProgress(Course $course, int $userId): array
    {
        $totalTasks = $course->tasks->count();

        if ($totalTasks === 0) {
            return [
                'totalTasks'      => 0,
                'completedTasks'  => 0,
                'progressPercent' => 0,
            ];
        }

        $completedTaskIds = $this->taskSubmissions
            ->getCorrectTaskIdsForCourseAndUser($course, $userId);

        $completedTasks = $completedTaskIds->count();

        $progressPercent = (int) round($completedTasks / $totalTasks * 100);

        return [
            'totalTasks'      => $totalTasks,
            'completedTasks'  => $completedTasks,
            'progressPercent' => $progressPercent,
        ];
    }
}
