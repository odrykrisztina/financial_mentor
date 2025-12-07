<?php

namespace App\Services;

use App\Models\Course;
use App\Repositories\Contracts\CourseRepositoryInterface;

class CourseService
{
    
    public function __construct(
        protected CourseRepositoryInterface $courses,
        protected CourseProgressService $progressService,
    ) {}

    /**
     * Teljes kurzus struktúra + user progress.
     */
    public function getCourseDetailForUser(int $courseId, int $userId): array
    {
        $course = $this->courses->findWithStructure($courseId);

        $progress = $this->progressService
                         ->calculateProgress($course, $userId);

        return [
            'course'   => $course,
            'progress' => $progress,
        ];
    }

    /**
     * Elérhető kurzusok (minden előfeltétel teljesítve).
     */
    public function getAvailableCoursesForUser(int $userId)
    {
        return $this->courses->getAvailableForUser($userId);
    }

    /**
     * Zárolt kurzusok (még hiányzik előfeltétel).
     */
    public function getLockedCoursesForUser(int $userId)
    {
        return $this->courses->getLockedForUser($userId);
    }

    /**
     * Csak progress (ha már van Course objektumod máshonnan).
     */
    public function getProgressForCourseAndUser(Course $course, int $userId): array
    {
        // itt biztosítjuk, hogy a tasks reláció be legyen töltve
        if (! $course->relationLoaded('tasks')) {
            $course->load('tasks');
        }

        return $this->progressService->calculateProgress($course, $userId);
    }

    /**
     * Ellenőrzi, hogy a user teljesítette-e az összes előfeltételt.
     */
    public function userHasCompletedPrerequisites(Course $course, int $userId): bool
    {
        // töltsük be az előfeltételeket + a hozzájuk tartozó student pivotokat
        $course->loadMissing(['prerequisites.students']);

        foreach ($course->prerequisites as $prereq) {
            $completed = $prereq->students
                ->contains(function ($student) use ($userId) {
                    return (int) $student->id === $userId
                        && $student->pivot->status === 'completed';
                });

            if (! $completed) {
                return false;
            }
        }

        return true;
    }

    /**
     * Lehet-e beiratkozni (kurzus published + előfeltételek teljesítve).
     */
    public function canUserEnroll(Course $course, int $userId): bool
    {
        if ($course->status !== 'published') {
            return false;
        }

        return $this->userHasCompletedPrerequisites($course, $userId);
    }

    /**
     * Beiratkoztatja a usert a kurzusra.
     * Visszaadja a kurzust + az aktuális progress-t.
     */
    public function enrollUserInCourse(Course $course, int $userId): array
    {
        // ha valahonnan más controllerből hívnád, itt is őrzött
        if (! $this->canUserEnroll($course, $userId)) {
            throw new \RuntimeException('User cannot enroll in this course.');
        }

        // pivot sor létrehozása / frissítése
        $course->students()->syncWithoutDetaching([
            $userId => [
                'status'       => 'enrolled',
                'score'        => null,
                'completed_at' => null,
            ],
        ]);

        // progress kiszámítása (feladatok alapján)
        $progress = $this->getProgressForCourseAndUser($course, $userId);

        return [
            'course'   => $course->fresh(),
            'progress' => $progress,
        ];
    }

    /**
     * Ha a progress 100%, beállítjuk a kurzus státuszt completed-re.
     */
    public function updateCourseCompletionIfEligible(Course $course, int $userId, ?array $progress = null): void
    {
        $progress ??= $this->getProgressForCourseAndUser($course, $userId);

        if (($progress['progressPercent'] ?? 0) < 100) {
            // ide betehetsz később "in_progress" frissítést is
            return;
        }

        $course->students()->syncWithoutDetaching([
            $userId => [
                'status'       => 'completed',
                'score'        => $progress['completedTasks'] ?? null,
                'completed_at' => now(),
            ],
        ]);
    }
}
