<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ChapterTask;
use App\Models\CourseChapter;
use App\Models\TaskOption;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TaskAdminController extends Controller
{
    /**
     * POST /admin/chapters/{chapter}/tasks
     */
    public function store(CourseChapter $chapter, Request $request)
    {
        $data = $request->validate([
            'title'       => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'type'        => ['required', 'string', 'in:single_choice,multiple_choice,true_false,text'],
            'max_score'   => ['nullable', 'integer', 'min:1'],
            'is_required' => ['nullable', 'boolean'],
            'sort_order'  => ['nullable', 'integer', 'min:0'],

            // opciók egyben létrehozáshoz
            'options'              => ['nullable', 'array'],
            'options.*.text'       => ['required_with:options', 'string'],
            'options.*.is_correct' => ['nullable', 'boolean'],
            'options.*.sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        $data['chapter_id'] = $chapter->id;
        $data['max_score']  = $data['max_score'] ?? 1;

        return DB::transaction(function () use ($data) {
            $options = $data['options'] ?? [];
            unset($data['options']);

            $task = ChapterTask::create($data);

            foreach ($options as $opt) {
                TaskOption::create([
                    'task_id'     => $task->id,
                    'text'        => $opt['text'],
                    'is_correct'  => $opt['is_correct'] ?? false,
                    'sort_order'  => $opt['sort_order'] ?? 0,
                ]);
            }

            $task->load('options');

            return response()->json($task, 201);
        });
    }

    /**
     * PATCH /admin/tasks/{task}
     */
    public function update(ChapterTask $task, Request $request)
    {
        $data = $request->validate([
            'title'       => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'type'        => ['sometimes', 'string', 'in:single_choice,multiple_choice,true_false,text'],
            'max_score'   => ['sometimes', 'integer', 'min:1'],
            'is_required' => ['sometimes', 'boolean'],
            'sort_order'  => ['sometimes', 'integer', 'min:0'],
        ]);

        $task->update($data);

        return response()->json($task);
    }

    /**
     * DELETE /admin/tasks/{task}
     */
    public function destroy(ChapterTask $task)
    {
        $task->delete();

        return response()->json([
            'message' => 'Task deleted',
        ]);
    }

    /**
     * POST /admin/tasks/{task}/options/sync
     * Teljes opciólista cseréje.
     *
     * body:
     * {
     *   "options": [
     *     { "id": 1, "text": "...", "is_correct": true, "sort_order": 0 },
     *     { "text": "új opció", "is_correct": false, "sort_order": 1 }
     *   ]
     * }
     */
    public function syncOptions(ChapterTask $task, Request $request)
    {
        $data = $request->validate([
            'options'              => ['required', 'array'],
            'options.*.id'         => ['nullable', 'integer', 'exists:task_options,id'],
            'options.*.text'       => ['required', 'string'],
            'options.*.is_correct' => ['nullable', 'boolean'],
            'options.*.sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        $optionsData = $data['options'];

        return DB::transaction(function () use ($task, $optionsData) {

            $keepIds = [];

            foreach ($optionsData as $opt) {
                if (!empty($opt['id'])) {
                    // meglévő frissítése
                    $option = TaskOption::where('task_id', $task->id)
                        ->where('id', $opt['id'])
                        ->firstOrFail();

                    $option->update([
                        'text'       => $opt['text'],
                        'is_correct' => $opt['is_correct'] ?? false,
                        'sort_order' => $opt['sort_order'] ?? 0,
                    ]);

                    $keepIds[] = $option->id;
                } else {
                    // új opció
                    $option = TaskOption::create([
                        'task_id'    => $task->id,
                        'text'       => $opt['text'],
                        'is_correct' => $opt['is_correct'] ?? false,
                        'sort_order' => $opt['sort_order'] ?? 0,
                    ]);

                    $keepIds[] = $option->id;
                }
            }

            // minden más opció törlése
            TaskOption::where('task_id', $task->id)
                ->whereNotIn('id', $keepIds)
                ->delete();

            $task->load('options');

            return response()->json($task);
        });
    }
}
