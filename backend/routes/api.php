<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\WorkerController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\TypeController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\TaskSubmissionController;
use App\Http\Controllers\Admin\CourseAdminController;
use App\Http\Controllers\Admin\ChapterAdminController;
use App\Http\Controllers\Admin\TaskAdminController;

Route::prefix('v1')->group(function () {

  Route::post('auth/login', [AuthController::class, 'login'])
    ->middleware('throttle:20,1');

  Route::post('auth/register', [AuthController::class, 'register'])
    ->middleware('throttle:20,1');

  Route::get('/users/{id}', [UserController::class, 'showPublic']);

  Route::get('workers', [WorkerController::class, 'index']);

  Route::get('/workers/simple', [WorkerController::class, 'simple']);

  Route::get('/types/message-subjects', [TypeController::class, 'messageSubjects']);

  Route::post('/messages', [MessageController::class, 'store']);
  
  Route::middleware('auth:sanctum')->group(function () {

    Route::get('auth/me', [AuthController::class, 'me']);
    Route::post('auth/logout', [AuthController::class, 'logout']);
    Route::put('auth/profile', [AuthController::class, 'updateProfile']);
    Route::post('auth/email-change', [AuthController::class, 'changeEmail']);
    Route::post('auth/password-change', [AuthController::class, 'changePassword']);

    Route::get('/types/message-statuses', [TypeController::class, 'messageStatuses']);
    Route::get('/types/contract-types', [TypeController::class, 'contractTypes']);

    // Üzenetek
    Route::get('/messages', [MessageController::class, 'index']);
    Route::post('messages/change', [MessageController::class, 'changeMessage']);
    
    // Elérhető + Zárolt kurzusok
    Route::get('/courses', [CourseController::class, 'index']);

    // Csak elérhető kurzusok
    Route::get('/courses/available', [CourseController::class, 'available']);

    // Csak zárolt kurzusok
    Route::get('/courses/locked', [CourseController::class, 'locked']);

    // Konkrét kurzus részletei 
    // (fejezetek, mellékletek, feladatok, opciók + progress)
    Route::get('/courses/{course}', [CourseController::class, 'show']);

    // Előremenetel egy kurzusra
    Route::get('/courses/{course}/progress', [CourseController::class, 'progress']);

    // Feladat beküldése
    Route::post('/tasks/{task}/submit', [TaskSubmissionController::class, 'submit']);

    // Kurzusra beiratkozás
    Route::post('/courses/{course}/enroll', [CourseController::class, 'enroll']);

    // Felhasználó saját kurzusai
    Route::get('/my/courses', [CourseController::class, 'myCourses']);

    // Kurzusok
    Route::post('/courses', [CourseAdminController::class, 'store']);
    Route::patch('/courses/{course}', [CourseAdminController::class, 'update']);
    Route::delete('/courses/{course}', [CourseAdminController::class, 'destroy']);

    Route::post('/courses/{course}/publish', [CourseAdminController::class, 'publish']);
    Route::post('/courses/{course}/unpublish', [CourseAdminController::class, 'unpublish']);

    Route::post('/courses/{course}/prerequisites', [CourseAdminController::class, 'syncPrerequisites']);

    // Fejezetek
    Route::post('/courses/{course}/chapters', [ChapterAdminController::class, 'store']);
    Route::patch('/chapters/{chapter}', [ChapterAdminController::class, 'update']);
    Route::delete('/chapters/{chapter}', [ChapterAdminController::class, 'destroy']);

    // Feladatok + opciók
    Route::post('/chapters/{chapter}/tasks', [TaskAdminController::class, 'store']);
    Route::patch('/tasks/{task}', [TaskAdminController::class, 'update']);
    Route::delete('/tasks/{task}', [TaskAdminController::class, 'destroy']);

    // Task opciók szinkronizálása (egyből az egész lista)
    Route::post('/tasks/{task}/options/sync', [TaskAdminController::class, 'syncOptions']);
  });
});

Route::get('/ping', function () {
  return response()->json([
    'pong' => true,
    'time' => now()->toDateTimeString(),
  ]);
});
