<?php

namespace App\Repositories\Eloquent;

use App\Models\Course;
use App\Repositories\Contracts\CourseRepositoryInterface;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class EloquentCourseRepository implements CourseRepositoryInterface
{
    public function findWithStructure(int $courseId): Course
    {
        return Course::with([
                'chapters' => function ($q) {
                    $q->where('is_published', true)
                        ->orderBy('sort_order');
                },
                'chapters.attachments' => function ($q) {
                    $q->orderBy('sort_order');
                },
                'chapters.tasks' => function ($q) {
                    $q->orderBy('sort_order');
                },
                'chapters.tasks.options' => function ($q) {
                    $q->orderBy('sort_order');
                },
            ])
            ->where('status', 'published')
            ->findOrFail($courseId);
    }

    /**
     * Elérhető kurzusok adott usernek.
     * Logika:
     *  - lekérdezzük, mely kurzusokat FEJEZTE BE (course_user.status = completed)
     *  - betöltünk minden PUBLISHED kurzust + az előfeltételeiket
     *  - PHP-ban kiszűrjük azokat, amelyeknek MINDEN előfeltétele benne van a completed listában
     */
    public function getAvailableForUser(int $userId): Collection
    {
        // 1) mely kurzusokat fejezte be?
        $completedCourseIds = DB::table('course_user')
            ->where('user_id', $userId)
            ->where('status', 'completed')
            ->pluck('course_id')
            ->toArray();

        // 2) published kurzusok + előfeltételek
        $courses = Course::with('prerequisites')
            ->where('status', 'published')
            ->orderBy('sort_order')
            ->get();

        // 3) szűrés: ha nincs előfeltétel -> elérhető
        //    ha van, akkor minden előfeltételnek completed-nek kell lennie
        $available = $courses->filter(function (Course $course) use ($completedCourseIds) {
            if ($course->prerequisites->isEmpty()) {
                return true;
            }

            foreach ($course->prerequisites as $prereq) {
                if (! in_array($prereq->id, $completedCourseIds, true)) {
                    return false;
                }
            }

            return true;
        });

        // újraindexelt collection
        return $available->values();
    }

    /**
     * Zárolt kurzusok:
     * published, de NEM elérhető (azaz hiányzik előfeltétel)
     */
    public function getLockedForUser(int $userId): Collection
    {
        $availableIds = $this->getAvailableForUser($userId)->pluck('id');

        return Course::where('status', 'published')
            ->when($availableIds->isNotEmpty(), function ($q) use ($availableIds) {
                $q->whereNotIn('id', $availableIds);
            })
            ->orderBy('sort_order')
            ->get();
    }

    public function getCourseWithTasks(int $courseId): Course
    {
        return Course::with('tasks')->findOrFail($courseId);
    }
}
