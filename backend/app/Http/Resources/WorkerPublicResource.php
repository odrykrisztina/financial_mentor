<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class WorkerPublicResource extends JsonResource
{
    public function toArray($request)
    {
        /** @var \App\Models\Worker $worker */
        $worker = $this->resource;
        $user   = $worker->user;
        $rank   = $worker->rankType;

        return [
            'id'                => $user?->id,
            'worker_id'         => $worker->id,
            'worker_identifier' => $worker->identifier,
            'type'              => $user?->type,
            'prefix_name'       => $user?->prefix_name,
            'first_name'        => $user?->first_name,
            'middle_name'       => $user?->middle_name,
            'last_name'         => $user?->last_name,
            'postfix_name'      => $user?->postfix_name,
            'gender'            => $user?->gender,
            'email'             => $user?->email,
            'phone'             => $user?->phone,
            'residence'         => $user?->residence,
            'postal_code'       => $user?->postal_code,
            'address'           => $user?->address,
            'img'               => $user?->img_base64,
            'img_type'          => $user?->img_type,

            'rank'              => $worker->rank,
            'rank_name_id'      => $rank?->name_id, 
            'ranking'           => $worker->ranking,
            'id_card'           => $worker->id_card,
            'superior_id'       => $worker->superior,
        ];
    }
}
