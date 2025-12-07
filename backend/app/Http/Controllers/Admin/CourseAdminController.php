<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\Request;

class CourseAdminController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'title'             => ['required', 'string', 'max:255'],
            'slug'              => ['required', 'string', 'max:255', 'unique:courses,slug'],
            'short_description' => ['nullable', 'string', 'max:255'],
            'description'       => ['nullable', 'string'],
            'level'             => ['nullable', 'string', 'max:50'],
            'language'          => ['nullable', 'string', 'max:10'],
            'estimated_minutes' => ['nullable', 'integer', 'min:0'],
            'sort_order'        => ['nullable', 'integer', 'min:0'],
            'thumbnail_path'    => ['nullable', 'string', 'max:255'],
        ]);

        $data['created_by'] = $request->user()->id;
        $data['status']     = 'draft';

        $course = Course::create($data);

        return response()->json($course, 201);
    }

    public function update(Course $course, Request $request)
    {
        $data = $request->validate([
            'title'             => ['sometimes', 'string', 'max:255'],
            'slug'              => ['sometimes', 'string', 'max:255', 'unique:courses,slug,' . $course->id],
            'short_description' => ['sometimes', 'nullable', 'string', 'max:255'],
            'description'       => ['sometimes', 'nullable', 'string'],
            'level'             => ['sometimes', 'string', 'max:50'],
            'language'          => ['sometimes', 'string', 'max:10'],
            'estimated_minutes' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'sort_order'        => ['sometimes', 'integer', 'min:0'],
            'thumbnail_path'    => ['sometimes', 'nullable', 'string', 'max:255'],
        ]);

        $course->update($data);

        return response()->json($course);
    }

    public function destroy(Course $course)
    {
        $course->delete();

        return response()->json([
            'message' => 'Course deleted',
        ]);
    }

    public function publish(Course $course)
    {
        $course->update([
            'status'       => 'published',
            'published_at' => now(),
        ]);

        return response()->json($course);
    }

    public function unpublish(Course $course)
    {
        $course->update([
            'status'       => 'draft',
            'published_at' => null,
        ]);

        return response()->json($course);
    }

    /**
     * POST /admin/courses/{course}/prerequisites
     * body: { "required_course_ids": [1, 2, 3] }
     */
    public function syncPrerequisites(Course $course, Request $request)
    {
        $data = $request->validate([
            'required_course_ids'   => ['array'],
            'required_course_ids.*' => ['integer', 'exists:courses,id'],
        ]);

        $ids = $data['required_course_ids'] ?? [];

        // ugyanazt csinálja, mint: $course->prerequisites()->sync($ids);
        $course->prerequisites()->sync($ids);

        $course->load('prerequisites');

        return response()->json([
            'course'        => $course,
            'prerequisites' => $course->prerequisites,
        ]);
    }
}
