<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Rotafazenda extends Model
{
    use HasFactory;

    protected $table = 'rotafazenda';

    protected $primaryKey = 'idFazenda';
    public $timestamps = false;
    

    protected $fillable = [
        'setor',
        'fazenda',
        'talhao',
        'variedade',
        'corte',
        'area',
        'insumo',
        'dataPlantio',
        'dataHoraFazenda',
    ];
}
