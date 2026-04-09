<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EmailController;
use App\Http\Controllers\ImageUploadController;
use App\Http\Controllers\TemplateController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/dashboard');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    Route::get('templates', [TemplateController::class, 'index'])->name('templates.index');
    Route::get('templates/create', [TemplateController::class, 'create'])->name('templates.create');
    Route::post('templates', [TemplateController::class, 'store'])->name('templates.store');
    Route::get('templates/{slug}', [TemplateController::class, 'show'])->name('templates.show');
    Route::get('templates/{slug}/edit', [TemplateController::class, 'edit'])->name('templates.edit');
    Route::post('templates/{slug}', [TemplateController::class, 'update'])->name('templates.update');
    Route::delete('templates/{slug}', [TemplateController::class, 'destroy'])->name('templates.destroy');
    Route::get('templates/{slug}/preview', [TemplateController::class, 'preview'])->name('templates.preview');

    Route::get('emails', [EmailController::class, 'index'])->name('emails.index');
    Route::get('emails/create/{slug}', [EmailController::class, 'create'])->name('emails.create');
    Route::post('emails', [EmailController::class, 'store'])->name('emails.store');
    Route::get('emails/{email}', [EmailController::class, 'show'])->name('emails.show');
    Route::get('emails/{email}/edit', [EmailController::class, 'edit'])->name('emails.edit');
    Route::put('emails/{email}', [EmailController::class, 'update'])->name('emails.update');
    Route::get('emails/{email}/preview', [EmailController::class, 'preview'])->name('emails.preview');
    Route::get('emails/{email}/download', [EmailController::class, 'download'])->name('emails.download');
    Route::post('emails/{email}/clone', [EmailController::class, 'clone'])->name('emails.clone');
    Route::delete('emails/{email}', [EmailController::class, 'destroy'])->name('emails.destroy');

    Route::post('images/upload', [ImageUploadController::class, 'store'])->name('images.upload');

    Route::get('tags', [\App\Http\Controllers\TagController::class, 'index'])->name('tags.index');
    Route::post('tags', [\App\Http\Controllers\TagController::class, 'store'])->name('tags.store');
});

require __DIR__.'/settings.php';
