<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\UpdateProfileRequest;
use App\Http\Requests\ChangeEmailRequest;
use App\Http\Requests\ChangePasswordRequest;
use App\Http\Resources\UserAuthResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;

class AuthController extends Controller {

  public function login(LoginRequest $request) {

    $email = trim($request->input('email'));
    $password = $request->input('password');

    $user = User::with('worker')
                ->where('email', $email)
                ->first();

    if (!$user) return response()->json(['message' => 'user_non_existent'], 422);
    if (!$user->valid) return response()->json(['message' => 'user_not_valid'], 422);
    if (($user->attempts_num ?? 0) >= 5) return response()->json(['message' => 'user_attempts_exceeded'], 423);
    if (!Hash::check($password, $user->password)) {
      $user->increment('attempts_num');
      return response()->json(['message' => 'user_password_incorrect'], 422);
    }

    $user->attempts_num = 0;
    $user->login_at = Carbon::now();
    $user->save();
    $user->tokens()->delete();

    $token = $user->createToken('api')->plainTextToken;
    return response()->json([
      'token' => $token,
      'data'  => new UserAuthResource($user),
    ]);
  }

  public function me(Request $request) {
    $user = $request->user();
    if (!$user) return response()->json(['message' => 'user_not_authenticated',], 401);
    $user->load('worker');
    return new UserAuthResource($user);
  }

  public function logout(Request $request) {
    if ($request->user() && $request->user()->currentAccessToken())
      $request->user()->currentAccessToken()->delete();
    return response()->json(['message' => 'logout_success']);
  }

  public function register(RegisterRequest $request): JsonResponse
  {
    try {

      $data = $request->validated();

      // Alapértékek
      $data['type']                     = $data['type'] ?? 'G'; // G = Guest
      $data['attempts_num']             = 0;
      $data['email_verified']           = false;
      $data['email_verification_code']  = null;
      $data['email_verified_at']        = null;
      $data['login_at']                 = null;
      $data['valid']                    = true;

      // Opcionális mezők
      $data['phone']        = $data['phone']        ?? null;
      $data['residence']    = $data['residence']    ?? null;
      $data['postal_code']  = $data['postal_code']  ?? null;
      $data['address']      = $data['address']      ?? null;
      $data['img']          = $data['img']          ?? null;
      $data['img_type']     = $data['img_type']     ?? null;

      // Jelszó titkosítása
      $data['password'] = Hash::make($data['password']);

      // Felhasználó létrehozása
      $user = User::create($data);

      return response()->json([
        'status'     => 'ok',
        'messageKey' => 'register_success',
        'user'       => [
          'id'            => $user->id,
          'prefix_name'   => $user->prefix_name,
          'first_name'    => $user->first_name,
          'middle_name'   => $user->middle_name,
          'last_name'     => $user->last_name,
          'postfix_name'  => $user->postfix_name,
          'email'         => $user->email,
        ],
      ], 201);

    } catch (\Throwable $e) {

      report($e);

      return response()->json([
        'status'     => 'error',
        'messageKey' => 'register_failed',
      ], 500);
    }
  }

  public function updateProfile(UpdateProfileRequest $request): JsonResponse
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

      // User ellenőrzése
      if (isset($data['id']) && (int)$data['id'] !== $authUser->id) {
        return response()->json([
          'status'     => 'error',
          'messageKey' => 'profile_invalid_user',
        ], 403);
      }

      /** @var \App\Models\User $user */
      $user = $authUser;

      // Jelszó ellenőrzése
      if (empty($data['password']) || 
        !Hash::check($data['password'], $user->password)) {
        return response()->json([
          'status'     => 'error',
          'messageKey' => 'user_password_incorrect',
        ], 422);
      }
      unset($data['password']);

      // Alap mezők frissítése
      $user->prefix_name  = $data['prefix_name']  ?? null;
      $user->first_name   = $data['first_name'];
      $user->middle_name  = $data['middle_name']  ?? null;
      $user->last_name    = $data['last_name'];
      $user->postfix_name = $data['postfix_name'] ?? null;

      $user->born         = $data['born'];
      $user->gender       = $data['gender'];

      $user->phone        = $data['phone']       ?? null;
      $user->residence    = $data['residence']   ?? null;
      $user->postal_code  = $data['postal_code'] ?? null;
      $user->address      = $data['address']     ?? null;

      // Kép ellenőrzése
      $imgProvided =  array_key_exists('img', $data) || 
                      array_key_exists('img_type', $data);

      if ($imgProvided) {

        $img      = $data['img']      ?? null;
        $img_type = $data['img_type'] ?? null;

        // Ha a képet törölte
        if ($img === null && $img_type === null) {
            $user->img      = null;
            $user->img_type = null;
        }

        // Új káp vagy módosított
        else {
          if (empty($img) || empty($img_type)) {
            return response()->json([
              'status'     => 'error',
              'messageKey' => 'profile_image_invalid',
            ], 422);
          }

          if (strpos($img_type, 'image/') !== 0) {
            return response()->json([
              'status'     => 'error',
              'messageKey' => 'profile_image_invalid_type',
            ], 422);
          }

          $binary = base64_decode($img, true);
          if ($binary === false) {
            return response()->json([
              'status'     => 'error',
              'messageKey' => 'profile_image_decode_failed',
            ], 422);
          }

          $user->img      = $binary;
          $user->img_type = $img_type;
        }
      }
      
      // Check user type Guest -> User
      if ($user->type === 'G' /*&& $user->email_verified*/) {
        $hasCoreData = 
          !empty($user->first_name) &&
          !empty($user->last_name)  &&
          !empty($user->born)       &&
          !empty($user->gender);

        $hasContactData =
          !empty($user->phone)       &&
          !empty($user->residence)   &&
          !empty($user->postal_code) &&
          !empty($user->address);

        if ($hasCoreData && $hasContactData) {
          $user->type = 'U';
        }
      }

      $user->save();
      $user->load('worker');

      return response()->json([
        'status'     => 'ok',
        'messageKey' => 'data_saved_success',
        'user'       => new UserAuthResource($user),
      ], 200);

    } catch (\Throwable $e) {
      report($e);

      return response()->json([
        'status'     => 'error',
        'messageKey' => 'data_saved_failed',
      ], 500);
    }
  }

  public function changeEmail(ChangeEmailRequest $request): JsonResponse
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

      if (isset($data['id']) && (int)$data['id'] !== $authUser->id) {
        return response()->json([
          'status'     => 'error',
          'messageKey' => 'email_change_invalid_user',
        ], 403);
      }

      $currentEmail = mb_strtolower(trim($authUser->email ?? ''));
      if (($data['email_current'] ?? '') !== $currentEmail) {
        return response()->json([
          'status'     => 'error',
          'messageKey' => 'email_change_email_mismatch',
        ], 422);
      }

      if (!Hash::check($data['password'], $authUser->password)) {
        return response()->json([
          'status'     => 'error',
          'messageKey' => 'email_change_password_incorrect',
        ], 422);
      }

      $newEmail = $data['email'];

      $exists = User::where('email', $newEmail)
          ->where('id', '!=', $authUser->id)
          ->exists();

      if ($exists) {
        return response()->json([
          'status'     => 'error',
          'messageKey' => 'email_change_email_in_use',
        ], 422);
      }

      $authUser->email             = $newEmail;
      $authUser->email_verified    = false; 
      $authUser->email_verified_at = null; 

      $authUser->save();
      $authUser->load('worker');

      return response()->json([
        'status'     => 'ok',
        'messageKey' => 'email_change_success',
        'user'       => new UserAuthResource($authUser),
      ], 200);

    } catch (\Throwable $e) {
      report($e);

      return response()->json([
        'status'     => 'error',
        'messageKey' => 'email_change_failed',
      ], 500);
    }
  }

  public function changePassword(ChangePasswordRequest $request): JsonResponse
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

      if (isset($data['id']) && (int)$data['id'] !== $authUser->id) {
        return response()->json([
          'status'     => 'error',
          'messageKey' => 'password_change_invalid_user',
        ], 403);
      }

      if (!Hash::check($data['password_current'], $authUser->password)) {
        return response()->json([
          'status'     => 'error',
          'messageKey' => 'password_change_password_incorrect',
        ], 422);
      }

      if (Hash::check($data['password'], $authUser->password)) {
          return response()->json([
            'status'     => 'error',
            'messageKey' => 'password_change_same_as_old',
          ], 422);
      }

      $authUser->password = Hash::make($data['password']);
      $authUser->save();
      $authUser->tokens()->delete();

      return response()->json([
        'status'     => 'ok',
        'messageKey' => 'password_change_success'
      ], 200);

    } catch (\Throwable $e) {
      report($e);

      return response()->json([
        'status'     => 'error',
        'messageKey' => 'password_change_failed',
      ], 500);
    }
  }
}