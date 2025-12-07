<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CourseChapter;
use Illuminate\Http\Request;

class ChapterAdminController extends Controller
{
    /**
     * POST /admin/courses/{course}/chapters
     */
    public function store(Course $course, Request $request)
    {
        $data = $request->validate([
            'title'             => ['required', 'string', 'max:255'],
            'slug'              => ['required', 'string', 'max:255', 'unique:course_chapters,slug'],
            'content'           => ['nullable', 'string'],
            'estimated_minutes' => ['nullable', 'integer', 'min:0'],
            'sort_order'        => ['nullable', 'integer', 'min:0'],
            'is_published'      => ['nullable', 'boolean'],
        ]);

        $data['course_id'] = $course->id;

        $chapter = CourseChapter::create($data);

        return response()->json($chapter, 201);
    }

    /**
     * PATCH /admin/chapters/{chapter}
     */
    public function update(CourseChapter $chapter, Request $request)
    {
        $data = $request->validate([
            'title'             => ['sometimes', 'string', 'max:255'],
            'slug'              => ['sometimes', 'string', 'max:255', 'unique:course_chapters,slug,' . $chapter->id],
            'content'           => ['sometimes', 'nullable', 'string'],
            'estimated_minutes' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'sort_order'        => ['sometimes', 'integer', 'min:0'],
            'is_published'      => ['sometimes', 'boolean'],
        ]);

        $chapter->update($data);

        return response()->json($chapter);
    }

    /**
     * DELETE /admin/chapters/{chapter}
     */
    public function destroy(CourseChapter $chapter)
    {
        $chapter->delete();

        return response()->json([
            'message' => 'Chapter deleted',
        ]);
    }
}
