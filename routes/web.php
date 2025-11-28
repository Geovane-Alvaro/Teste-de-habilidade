<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\KmzController;
use App\Http\Controllers\ExcelController;
use App\Http\Controllers\RotafazendaController;

Route::get('/', [RotafazendaController::class, 'index']);

Route::resource('rotafazenda', RotafazendaController::class);

Route::resource('kmz', KmzController::class)->only(['index', 'store']);
Route::get('/kmz/download', [KmzController::class, 'dowload'])->name('kmz.download');

Route::resource('excel', ExcelController::class)->only(['index', 'store']);
Route::get('excel/download', [ExcelController::class, 'download'])->name('excel.download');

// Route::get('rotafazenda/buscar-setor/{setor}', [RotafazendaController::class, 'buscarPorSetor']);
Route::get('rotafazenda/buscar/{setor}/{talhao}', [RotafazendaController::class, 'buscarPorTalhao']);
Route::get('/rotafazenda/mapa/{setor}/{talhao}', [RotafazendaController::class, 'mapa']);
Route::get('/rotafazenda/shape/{setor}',[RotafazendaController::class, 'shapefile']);
Route::get('/rotafazenda/opcoes', [RotafazendaController::class, 'listarOpcoes']);