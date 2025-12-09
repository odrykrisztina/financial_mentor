<?php

namespace App\Http\Controllers;

use App\Models\Contract;
use App\Models\ContractAttachment;
use App\Models\Worker;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContractAttachmentController extends Controller
{
    public function index(Request $request, Contract $contract): JsonResponse
    {
        $user = $request->user();
        $role = $user->type ?? 'U';

        if ($role === 'A') {    
            // ALL ALLOWED
        } elseif ($role === 'U') {
            if ($contract->user_id !== $user->id) {
                abort(403, 'Forbidden');
            }
        } elseif ($role === 'W') {
            $worker = Worker::where('user_id', $user->id)->first();
            if (!$worker) {
                abort(403, 'Forbidden');
            }

            $workerIds = Worker::getTreeIds($worker->id);
            if (!in_array($contract->worker_id, $workerIds, true)) {
                abort(403, 'Forbidden');
            }
        } else {
            abort(403, 'Forbidden');
        }

        $rows = ContractAttachment::query()
            ->where('contract_id', $contract->id)
            ->leftJoin('types as t', function ($join) {
                $join->on('contract_attachments.type', '=', 't.id')
                     ->where('t.type', '=', 'ATTACHMENT');
            })
            ->select([
                'contract_attachments.id',
                'contract_attachments.contract_id',
                'contract_attachments.type',
                't.name_id as type_name_id',
                'contract_attachments.file_name',
                'contract_attachments.file_path',
                'contract_attachments.file_url',
                //'contract_attachments.file',
                'contract_attachments.file_type',
                'contract_attachments.description',
                'contract_attachments.created_at',
                'contract_attachments.updated_at',
            ])
            ->orderBy('contract_attachments.id')
            ->get();

        return response()->json([
            'success'    => true,
            'messageKey' => 'success',
            'data'       => $rows,
        ]);
    }
}
