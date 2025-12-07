<?php

namespace App\Http\Controllers;

use App\Http\Requests\SubmitTaskRequest;
use App\Models\ChapterTask;
use App\Models\TaskSubmission;
use App\Services\CourseService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TaskSubmissionController extends Controller
{
    public function __construct(
        protected CourseService $courseService
    ) {}

    /**
     * POST /api/tasks/{task}/submit
     */
    public function submit(ChapterTask $task, SubmitTaskRequest $request)
    {
        $user = $request->user();
        $data = $request->validated();

        // biztonság kedvéért: csak olyan option id-ket engedjünk, amelyek ehhez a taskhoz tartoznak
        if (!empty($data['selected_option_ids'])) {
            $validOptionIds = $task->options()->pluck('id')->toArray();
            $data['selected_option_ids'] = array_values(
                array_intersect($data['selected_option_ids'], $validOptionIds)
            );
        }

        $result = DB::transaction(function () use ($task, $user, $data) {

            // 1) pontozás
            [$isCorrect, $score] = $this->evaluateTask($task, $data);

            // 2) attempt szám meghatározása
            $lastAttempt = TaskSubmission::where('task_id', $task->id)
                ->where('user_id', $user->id)
                ->max('attempt');

            $attempt = $lastAttempt ? $lastAttempt + 1 : 1;

            // 3) submission mentése
            $submission = TaskSubmission::create([
                'task_id'             => $task->id,
                'user_id'             => $user->id,
                'text_answer'         => $data['text_answer'] ?? null,
                'selected_option_ids' => $data['selected_option_ids'] ?? null,
                'score'               => $score,
                'is_correct'          => $isCorrect,
                'attempt'             => $attempt,
                'submitted_at'        => now(),
            ]);

            // 4) progress újraszámolása az adott kurzusra
            $course = $task->chapter->course;

            $progress = $this->courseService
                ->getProgressForCourseAndUser($course, $user->id);

            // 5) kurzus státusz frissítése, ha kész
            $this->courseService
                ->updateCourseCompletionIfEligible($course, $user->id, $progress);

            return [
                'submission' => $submission,
                'is_correct' => $isCorrect,
                'score'      => $score,
                'attempt'    => $attempt,
                'progress'   => $progress,
            ];
        });

        return response()->json($result, 201);
    }

    /**
     * Egyszerű pontozás típus alapján.
     * Itt később ki is szervezhetjük egy külön service-be, ha akarod.
     */
    protected function evaluateTask(ChapterTask $task, array $data): array
    {
        $maxScore = $task->max_score ?? 1;

        // TEXT: egyelőre automatikusan 0 pont, nem jelöljük helyesnek
        if ($task->type === 'text') {
            return [false, 0];
        }

        $selected = collect($data['selected_option_ids'] ?? []);

        // nincsenek kijelölt opciók
        if ($selected->isEmpty()) {
            return [false, 0];
        }

        $correctOptionIds = $task->options()
            ->where('is_correct', true)
            ->pluck('id');

        // SINGLE / TRUE_FALSE: akkor helyes, ha egyetlen opció és megegyezik az egyetlen helyes opcióval
        if (in_array($task->type, ['single_choice', 'true_false'], true)) {
            $isCorrect = $selected->count() === 1
                && $correctOptionIds->count() === 1
                && (int) $selected->first() === (int) $correctOptionIds->first();

            return [$isCorrect, $isCorrect ? $maxScore : 0];
        }

        // MULTIPLE_CHOICE: akkor helyes, ha pontosan a helyes halmazt választotta
        if ($task->type === 'multiple_choice') {
            $isCorrect =
                $selected->sort()->values()->all() ===
                $correctOptionIds->sort()->values()->all();

            return [$isCorrect, $isCorrect ? $maxScore : 0];
        }

        // fallback
        return [false, 0];
    }
}
