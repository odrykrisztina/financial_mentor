<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Services\CourseService;
use Illuminate\Http\Request;

class CourseController extends Controller
{
    public function __construct(
        protected CourseService $courseService
    ) {}

    public function index(Request $request)
    {
        $userId = $request->user()->id;

        $available = $this->courseService->getAvailableCoursesForUser($userId);
        $locked    = $this->courseService->getLockedCoursesForUser($userId);

        return response()->json([
            'available' => $available,
            'locked'    => $locked,
        ]);
    }

    public function available(Request $request)
    {
        $userId = $request->user()->id;

        $available = $this->courseService->getAvailableCoursesForUser($userId);

        return response()->json([
            'data' => $available,
        ]);
    }

    public function locked(Request $request)
    {
        $userId = $request->user()->id;

        $locked = $this->courseService->getLockedCoursesForUser($userId);

        return response()->json([
            'data' => $locked,
        ]);
    }

    public function show(Course $course, Request $request)
    {
        $userId = $request->user()->id;

        $data = $this->courseService
            ->getCourseDetailForUser($course->id, $userId);

        return response()->json($data);
    }

    public function progress(Course $course, Request $request)
    {
        $userId = $request->user()->id;

        $progress = $this->courseService
            ->getProgressForCourseAndUser($course, $userId);

        return response()->json($progress);
    }

    /**
     * POST /api/courses/{course}/enroll
     * Beiratkoztatja a bejelentkezett felhasználót a kurzusra.
     */
    public function enroll(Course $course, Request $request)
    {
        $userId = $request->user()->id;

        // ha nem teljesítette az előfeltételeket vagy nem published a kurzus
        if (! $this->courseService->canUserEnroll($course, $userId)) {
            return response()->json([
                'message' => 'Nem iratkozhatsz be erre a kurzusra (még hiányoznak előfeltételek, vagy a kurzus nem elérhető).',
            ], 403);
        }

        try {
            $data = $this->courseService->enrollUserInCourse($course, $userId);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Nem sikerült a beiratkozás.',
            ], 422);
        }

        return response()->json($data, 201);
    }

    /**
     * GET /api/my/courses
     * A user összes kurzusa, amire be van iratkozva.
     */
    public function myCourses(Request $request)
    {
        $user = $request->user();

        $courses = $user->courses()
                        ->with('chapters')
                        ->withPivot(['status', 'score', 'completed_at'])
                        // vagy sort_order, majd meglátjuk
                        ->orderBy('course_user.created_at', 'desc') 
                        ->get();

        return response()->json([
            'data' => $courses,
        ]);
    }
}
