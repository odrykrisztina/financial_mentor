<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class UserAuthResource extends JsonResource {

  public function toArray($request) {
    
    $user   = $this->resource;
    $worker = $this->worker;
    $type   = $user->type;
    if ($type === 'W' && !$worker) $type = 'U';

    return [
      'id'              => $this->id,
      'type'            => $type,
      'email'           => $this->email,
      'prefix_name'     => $this->prefix_name,
      'first_name'      => $this->first_name,
      'middle_name'     => $this->middle_name,
      'last_name'       => $this->last_name,
      'postfix_name'    => $this->postfix_name,
      'gender'          => $this->gender,
      'born'            => $this->born,
      'phone'           => $this->phone,
      'residence'       => $this->residence,
      'postal_code'     => $this->postal_code,
      'address'         => $this->address,
      'img'             => $this->img_base64,
      'img_type'        => $this->img_type,
      'email_verified'  => $this->email_verified,
      'worker_id'       => $worker?->id,
      'rank'            => $worker?->rank,
    ];
  }
}
