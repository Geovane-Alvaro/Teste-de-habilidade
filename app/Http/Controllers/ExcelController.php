<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use PhpOffice\PhpSpreadsheet\Shared\Date;
use App\Imports\FazendasImport;

class ExcelController extends Controller
{
     public function index(){
       
        return view('excel.index');
    }


    public function store(Request $request){

        $request->validate(['arquivo_excel' => 'required|mimes:xlsx,xlsm']);

        Excel::import(new FazendasImport, $request->file('arquivo_excel'));

        return to_route('rotafazenda.index')->with('mensagem.sucesso', 'Excel importado com sucesso!');
    }


    public function downloadModelo(){
        $caminho = public_path('storage/uploads/Modelo_Dados.xlsx');

        if (!file_exists($caminho)) {
            abort(404, 'Arquivo modelo não encontrado.');
        }

        return response()->download($caminho);
    }
}
