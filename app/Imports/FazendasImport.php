<?php

namespace App\Imports;
use App\Models\Rotafazenda;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use PhpOffice\PhpSpreadsheet\Shared\Date;
use Maatwebsite\Excel\Concerns\Importable;


class FazendasImport implements ToModel, WithHeadingRow, WithValidation
{


    use Importable;
    
    public function model(array $row){
        
        $insumo = in_array(strtolower(trim($row['insumo'] ?? '')), ['possui','sim','1'])
                    ? 1 : 0;

        try {
            $dataPlantio = is_numeric($row['dataplantio'])
                ? Date::excelToDateTimeObject($row['dataplantio'])->format('Y-m-d')
                : date('Y-m-d', strtotime($row['dataplantio']));
        } catch (\Exception $e) {
            
            $dataPlantio = null;
        }

        $duplicado = Rotafazenda::where([
            'setor'       => $row['setor'],
            'fazenda'     => $row['fazenda'],
            'talhao'      => $row['talhao'],
            'variedade'   => $row['variedade'],
            'corte'       => $row['corte'],
            'area'        => $row['area'],
            'insumo'      => $insumo,
            'dataPlantio' => $dataPlantio,
        ])->exists();

        if ($duplicado) {
            
            return null; 
        }


        return new Rotafazenda([
            'setor'          => $row['setor'],
            'fazenda'        => $row['fazenda'],
            'talhao'         => $row['talhao'],
            'variedade'      => $row['variedade'],
            'corte'          => $row['corte'],
            'area'           => $row['area'],
            'insumo'         => $insumo,
            'dataPlantio'    => $dataPlantio,
            'dataHoraFazenda'=> now(),
        ]);
    }

   
    public function rules(): array
    {
        return [
            '*.setor'       => ['required'],
            '*.fazenda'     => ['required'],
            '*.talhao'      => ['required'],
            '*.variedade'   => ['required'],
            '*.corte'       => ['required'],
            '*.area'        => ['required'],
            '*.insumo'      => ['nullable'],
            '*.dataplantio' => ['required'],
        ];
    }    
}
