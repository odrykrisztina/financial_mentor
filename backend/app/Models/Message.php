<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    protected $fillable = [
        'status',
        'worker_id',
        'user_id',
        'prefix_name',
        'first_name',
        'middle_name',
        'last_name',
        'postfix_name',
        'gender',
        'phone',
        'email',
        'subject_id',
        'message',
        'finished_at',
    ];

    protected $casts = [
        'worker_id'   => 'integer',
        'user_id'     => 'integer',
        'finished_at' => 'datetime',
    ];
}
