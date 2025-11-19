<?php

namespace App\Http\Controllers;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use App\Imports\FazendasImport;
use PhpOffice\PhpSpreadsheet\IOFactory;


class ExcelController extends Controller
{
     public function index(){
       
        return view('excel.index');
    }


    public function store(Request $request)
{
    $request->validate([
        'arquivo_excel' => 'required|mimes:xlsx,xlsm'
    ]);

    $file = $request->file('arquivo_excel');

    
    $spreadsheet = IOFactory::load($file->getPathname());
    $sheet = $spreadsheet->getActiveSheet();

   
    $header = $sheet->rangeToArray('A1:' . $sheet->getHighestColumn() . '1')[0];

    
    $received = array_map(fn($h) => strtolower(trim($h)), $header);

    
    $expected = [
        'setor',
        'fazenda',
        'talhao',
        'variedade',
        'corte',
        'area',
        'insumo',
        'dataplantio'
    ];

    
    foreach ($expected as $col) {
        if (!in_array($col, $received)) {
            return back()->with('mensagem.erro', 
                "Erro no Excel: a coluna obrigatória '{$col}' está faltando. Baixe o modelo e tente novamente."
            );
        }
    }

    Excel::import(new FazendasImport, $file);

    return to_route('rotafazenda.index')
        ->with('mensagem.sucesso', 'Excel importado com sucesso!');
}


   public function download(){


    $arquivo = 'uploads/Modelo_Dados.xlsx';

    abort_unless(Storage::disk('public')->exists($arquivo), 404, 'Arquivo modelo não encontrado');
    
    return Storage::disk('public')->download($arquivo, 'Modelo_Dados.xlsx');
  }
}
