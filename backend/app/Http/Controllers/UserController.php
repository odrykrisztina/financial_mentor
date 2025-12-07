<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;

class UserController extends Controller
{
    public function showPublic(int $id)
    {
        $user = User::query()
            ->select([
                'prefix_name',
                'first_name',
                'middle_name',
                'last_name',
                'postfix_name',
                'gender',
                'img',       
                'img_type',   
            ])
            ->where('id', $id)
            ->where('valid', true)
            ->first();

        if (!$user) {
            return response()->json([
                'messageKey' => 'user_not_found',
            ], 404);
        }

        $imgDataUrl = null;

        if (!is_null($user->img)) {
            $base64 = base64_encode($user->img);
            $mime = $user->img_type ?? 'image/jpeg';
            $imgDataUrl = "data:{$mime};base64,{$base64}";
        }

        return response()->json([
            'data' => [
                'prefix_name'  => $user->prefix_name,
                'first_name'   => $user->first_name,
                'middle_name'  => $user->middle_name,
                'last_name'    => $user->last_name,
                'postfix_name' => $user->postfix_name,
                'gender'       => $user->gender,
                'img'          => $imgDataUrl, 
            ],
        ]);
    }
}
