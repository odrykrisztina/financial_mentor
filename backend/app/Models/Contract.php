<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Contract extends Model
{
    use HasFactory;

    protected $table = 'contracts';

    protected $fillable = [
        'contract_no',
        'type',
        'user_id',
        'worker_id',
        'financial_institution_id',
        'award',
        'currency',
        'start_at',
        'description',
        'valid',
    ];

    protected $casts = [
        'start_at'   => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'valid'      => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function worker()
    {
        return $this->belongsTo(Worker::class);
    }

    public function financialInstitution()
    {
        return $this->belongsTo(FinancialInstitution::class, 'financial_institution_id');
    }

    public function attachments()
    {
        return $this->hasMany(ContractAttachment::class);
    }
}
