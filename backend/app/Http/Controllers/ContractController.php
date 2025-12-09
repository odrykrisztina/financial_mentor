<?php

namespace App\Http\Controllers;

use App\Models\Contract;
use App\Models\Worker;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContractController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();               // auth:sanctum
        $role = $user->type ?? 'U';             // 'W' | 'U' | 'A'

        $query = Contract::query();

        if ($role === 'A') {
            // ALL ALLOWED
        } elseif ($role === 'U') {
            // User only own
            $query->where('contracts.user_id', $user->id);
        } elseif ($role === 'W') {
            // Own and subordinate (recursive)
            $worker = Worker::where('user_id', $user->id)->first();

            if ($worker) {
                $workerIds = Worker::getTreeIds($worker->id);
                $query->whereIn('contracts.worker_id', $workerIds);
            } else {
                $query->whereRaw('1 = 0');
            }
        } else {
            $query->whereRaw('1 = 0');
        }

        $rows = $query
            ->leftJoin('types as t', function ($join) {
                $join->on('contracts.type', '=', 't.id')
                     ->where('t.type', '=', 'CONTRACT');
            })
            ->leftJoin('users as u', 'contracts.user_id', '=', 'u.id')
            ->leftJoin('workers', 'contracts.worker_id', '=', 'workers.id')
            ->leftJoin('users as u2', 'workers.user_id', '=', 'u2.id')
            ->leftJoin('financial_institutions as fi', 'contracts.financial_institution_id', '=', 'fi.id')
            ->select([
                'contracts.id',
                'contracts.contract_no',
                'contracts.type',
                't.name_id as type_name_id',
                'contracts.award',
                'contracts.currency',
                'contracts.start_at',
                'contracts.description',
                'contracts.created_at',
                'contracts.updated_at',

                'contracts.user_id',
                'u.prefix_name',
                'u.first_name',
                'u.middle_name',
                'u.last_name',
                'u.postfix_name',
                'u.gender',
                //'u.img',

                'contracts.worker_id',
                'u2.prefix_name as w_prefix_name',
                'u2.first_name as w_first_name',
                'u2.middle_name as w_middle_name',
                'u2.last_name as w_last_name',
                'u2.postfix_name as w_postfix_name',
                'u2.gender as w_gender',
                //'u2.img as w_img',

                'fi.id as f_i_id',
                'fi.name as f_i_name',
                //'fi.img as f_i_img',
            ])
            ->orderBy('contracts.start_at', 'desc')
            ->get();

        return response()->json([
            'success'    => true,
            'messageKey' => 'success',
            'data'       => $rows,
        ]);
    }
}
