<?php

namespace App\Http\Controllers;

use App\Models\Worker;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use App\Http\Requests\ChangeMessageRequest;
use Illuminate\Http\JsonResponse;

class MessageController extends Controller
{
    public function store(Request $request)
    {
        // Normalizálás: 0 -> null, üres string -> null
        $request->merge([
            'user_id'   => $request->integer('user_id') ?: null,
            'worker_id' => $request->integer('worker_id') ?: null,
        ]);

        // Validálás
        $validated = $request->validate([
            'user_id'   => ['nullable', 'integer', 'exists:users,id'],
            'worker_id' => ['nullable', 'integer', 'exists:workers,id'],

            'prefix_name'  => ['nullable', 'string', 'max:20'],
            'first_name'   => ['required', 'string', 'max:100'],
            'middle_name'  => ['nullable', 'string', 'max:100'],
            'last_name'    => ['required', 'string', 'max:100'],
            'postfix_name' => ['nullable', 'string', 'max:20'],
            'gender'       => ['required','in:M,F'],

            'phone' => ['nullable', 'string', 'max:20'],
            'email' => ['required', 'string', 'email', 'max:255'],

            'subject_id' => [
                'required',
                'string',
                'max:20',
                Rule::exists('types', 'id')->where('type', 'MSG_SUBJECT'),
            ],

            'message' => ['required', 'string'],
        ]);

        // Üres stringek NULL-lá alakítása opcionális mezőknél
        foreach (['prefix_name', 'middle_name', 
                  'postfix_name', 'phone'] as $field) {
            if (array_key_exists($field, $validated) && 
                $validated[$field] === '') {
                $validated[$field] = null;
            }
        }

        // Alap státusz
        $validated['status'] =  is_null($validated['worker_id']) ? 
                                'NEW_NOT_ASSIGNED' : 
                                'NEW_ASSIGNED';

        // Mentés
        $message = Message::create($validated);

        return response()->json([
            'success' => true,
            'data'    => [
                'id'         => $message->id,
                'status'     => $message->status,
                'created_at' => $message->created_at,
            ],
        ], 201);
    }

    public function index(Request $request)
    {
        $user = $request->user();

        // Csak bejelentkezett worker (type = 'W') kérheti le
        if (!$user || $user->type !== 'W') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // Get/Check user worker ideintifier
        $workerId = $user->worker?->id;
        if (!$workerId) {
            return response()->json([
                'message' => "Worker id not found for user"
            ], 403);
        }

        // ?new=1 / ?new=true / ?new=0
        $onlyNew = $request->boolean('new');

        $query = Message::query()
        
            // Users join (küldő user képe)
            ->leftJoin('users', 'messages.user_id', '=', 'users.id')

            // Status típus (MSG_STATUS)
            ->leftJoin('types as status_types', function ($join) {
                $join->on('messages.status', '=', 'status_types.id')
                     ->where('status_types.type', '=', 'MSG_STATUS');
            })

            // Subject típus (MSG_SUBJECT)
            ->leftJoin('types as subject_types', function ($join) {
                $join->on('messages.subject_id', '=', 'subject_types.id')
                     ->where('subject_types.type', '=', 'MSG_SUBJECT');
            })

            ->select([
                'messages.id',
                'messages.status as status_id',
                'status_types.name_id as status_name_id',
                'messages.prefix_name',
                'messages.first_name',
                'messages.middle_name',
                'messages.last_name',
                'messages.postfix_name',
                'messages.gender',
                'messages.email',
                'messages.phone',
                'users.img as img',
                'users.img_type as img_type',
                'messages.worker_id',
                'messages.subject_id',
                'subject_types.name_id as subject_name_id',
                'messages.message',
                'messages.created_at',
            ])
            ->orderByDesc('messages.created_at');

        // SZŰRÉS – nagyon fontosak a zárójelek (AND / OR miatt!)
        if ($onlyNew) {
            // Csak új üzenetek
            $query->where(function ($q) use ($workerId) {
                $q->where(function ($q2) use ($workerId) {
                    $q2->where('messages.status', 'NEW_ASSIGNED')
                       ->where('messages.worker_id', $workerId);
                })->orWhere(function ($q2) {
                    $q2->where('messages.status', 'NEW_NOT_ASSIGNED')
                       ->whereNull('messages.worker_id');
                });
            });
        } else {
            // Minden üzenet a dolgozónak + gazda nélküli új
            $query->where(function ($q) use ($workerId) {
                $q->where('messages.worker_id', $workerId)
                  ->orWhere(function ($q2) {
                      $q2->where('messages.status', 'NEW_NOT_ASSIGNED')
                         ->whereNull('messages.worker_id');
                  });
            });
        }

        $messages = $query->get();

        $data = $messages->map(function ($row) {

            $imgDataUrl = null;

            if (!is_null($row->img)) {
                $base64 = base64_encode($row->img);
                $mime   = $row->img_type ?? 'image/jpeg';
                $imgDataUrl = "data:{$mime};base64,{$base64}";
            }

            return [
                'id'              => $row->id,
                'status_id'       => $row->status_id,
                'status_name_id'  => $row->status_name_id,
                'prefix_name'     => $row->prefix_name,
                'first_name'      => $row->first_name,
                'middle_name'     => $row->middle_name,
                'last_name'       => $row->last_name,
                'postfix_name'    => $row->postfix_name,
                'gender'          => $row->gender,
                'email'           => $row->email,
                'phone'           => $row->phone,
                'img'             => $imgDataUrl,
                'worker_id'       => $row->worker_id,
                'subject_id'      => $row->subject_id,
                'subject_name_id' => $row->subject_name_id,
                'message'         => $row->message,
                'created_at'      => optional($row->created_at)->toDateTimeString(),
            ];
        });

        return response()->json([
            'data' => $data,
        ]);
    }

    public function changeMessage(ChangeMessageRequest $request): JsonResponse
    {
        try {

            $authUser = $request->user();

            if (!$authUser) {
                return response()->json([
                    'status'     => 'error',
                    'messageKey' => 'user_not_authenticated',
                ], 401);
            }

            $data = $request->validated();

            if (isset($data['user_id']) && (int)$data['user_id'] !== $authUser->id) {
                return response()->json([
                    'status'     => 'error',
                    'messageKey' => 'message_change_invalid_user',
                ], 403);
            }

            $message = Message::find($data['id']);

            if (!$message) {
                return response()->json([
                    'status'     => 'error',
                    'messageKey' => 'message_not_found',
                ], 404);
            }

            if (isset($data['worker_id'])) {
                $message->worker_id = (int)$data['worker_id'];
            }

            if (isset($data['status_id'])) {
                $message->status = $data['status_id'];
            }

            if (isset($data['worker_id_modified'])) {
                $message->worker_id_modified = $data['worker_id_modified'];
            }

            $message->save();

            return response()->json([
                'status'     => 'ok',
                'messageKey' => 'data_saved_success',
                'data'       => $message,
            ], 200);

        } catch (\Throwable $e) {
            report($e);

            return response()->json([
                'status'     => 'error',
                'messageKey' => 'data_saved_failed',
            ], 500);
        }
    }
}
