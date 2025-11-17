<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RotafazendaController;
use App\Http\Controllers\KmzController;
use App\Http\Controllers\ExcelController;



Route::get('/', [RotafazendaController::class, 'index']);

Route::resource('rotafazenda', RotafazendaController::class);

Route::resource('kmz', KmzController::class)->only(['index', 'store']);

Route::resource('excel', ExcelController::class)->only(['index', 'store']);

Route::get('excel/download', [ExcelController::class, 'downloadModelo'])->name('excel.download');
