<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ContractAttachment extends Model
{
    use HasFactory;

    protected $table = 'contract_attachments';

    protected $fillable = [
        'contract_id',
        'type',
        'file_name',
        'file_path',
        'file_url',
        'file',
        'file_type',
        'description',
        'valid',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'valid'      => 'boolean',
    ];

    public function contract()
    {
        return $this->belongsTo(Contract::class);
    }
}
