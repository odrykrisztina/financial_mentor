<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable {

  use HasApiTokens, HasFactory, Notifiable;

  protected $fillable = [
    'type', 'prefix_name', 'first_name', 'middle_name', 'last_name', 'postfix_name', 
    'born', 'gender', 'img', 'img_type', 'phone', 'residence', 'postal_code', 'address', 
    'email', 'email_verified', 'email_verification_code', 'email_verified_at', 
    'password', 'login_at', 'attempts_num', 'valid'
  ];

  protected $hidden = ['password','remember_token'];

  protected $casts = [
    'email_verified_at' => 'datetime',
    'born'              => 'date:Y-m-d',
    'login_at'          => 'datetime',
    'valid'             => 'boolean',
    'email_verified'    => 'boolean',
  ];

  public function worker() {
    return $this->hasOne(Worker::class)->where('valid', true);
  }
  
  public function getBornAttribute($value) {
    if (empty($value) || $value === '0000-00-00') return null;
    try { return \Carbon\Carbon::parse($value)->format('Y-m-d'); }
    catch (\Throwable $e) { return null; }
  }

  public function getImgBase64Attribute(): ?string {
    if (!$this->img) return null;
    $mime = $this->img_type ?: 'application/octet-stream';
    return 'data:'.$mime.';base64,'.base64_encode($this->img);
  }

  public function courses() {
    return $this->belongsToMany(Course::class, 'course_user')
                ->withPivot(['status', 'score', 'completed_at'])
                ->withTimestamps();
  }

  public function taskSubmissions() {
    return $this->hasMany(TaskSubmission::class);
  }
}
