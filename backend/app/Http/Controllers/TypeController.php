<?php

namespace App\Http\Controllers;

use App\Models\Type;
use Illuminate\Http\JsonResponse;

class TypeController extends Controller
{
    public function messageSubjects(): JsonResponse
    {
        $rows = Type::query()
            ->where('type', 'MSG_SUBJECT')
            ->select(['id as subject_id', 'name_id'])
            ->get();

        return response()->json([
            'data' => $rows,
        ]);
    }

    public function messageStatuses(): JsonResponse
    {
        $rows = Type::query()
            ->where('type', 'MSG_STATUS')
            ->select(['id as status_id', 'name_id'])
            ->get();

        return response()->json([
            'data' => $rows,
        ]);
    }
}
