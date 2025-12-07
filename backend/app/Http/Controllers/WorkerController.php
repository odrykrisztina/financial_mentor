<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Resources\WorkerPublicResource;
use App\Models\Worker;

class WorkerController extends Controller
{
    public function index()
    {
        $workers = Worker::query()
            ->with(['user', 'rankType'])
            ->where('valid', true)
            ->whereHas('user', fn ($q) => $q->where('valid', true))
            ->orderByDesc('ranking')
            ->get();

        return WorkerPublicResource::collection($workers);
    }

    public function simple(Request $request)
    {
        $maxRanking = $request->integer('max_ranking');

        $query = Worker::query()
            ->join('users', 'workers.user_id', '=', 'users.id')
            ->where('workers.valid', true)
            ->where('users.valid', true)
            ->select([
                'workers.id as worker_id',
                'users.prefix_name',
                'users.first_name',
                'users.middle_name',
                'users.last_name',
                'users.postfix_name',
            ]);

        if (!is_null($maxRanking)) {
            $query->where('workers.ranking', '<=', $maxRanking);
        }

        $workers = $query->get();

        return response()->json([
            'data' => $workers,
        ]);
    }
}
