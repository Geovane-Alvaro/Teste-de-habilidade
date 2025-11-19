<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class KmzController extends Controller
{
    public function index()
    {
        $mensagemSucesso = session('mensagem.sucesso');
        return view('kmz.upload')->with('mensagemSucesso', $mensagemSucesso);
    }
    public function store(Request $request)
    {
        $request->validate([
            'arquivo_kmz' => 'required|file|mimes:kmz,zip|max:10240',
        ]);

        
        if (Storage::disk('public')->exists('uploads/arquivo.kmz')) {
            Storage::disk('public')->delete('uploads/arquivo.kmz');
        }

        $arquivo = $request->file('arquivo_kmz');

        $arquivo->storeAs('uploads', 'arquivo.kmz', 'public');
        
        $nomeOriginal = $arquivo->getClientOriginalName();

        return to_route('kmz.index')
            ->with('mensagem.sucesso', "Arquivo '$nomeOriginal' KMZ enviado com sucesso!");
    }
    public function dowload(){
        $arquivo = 'uploads/arquivo.kmz';
        abort_unless(Storage::disk('public')->exists($arquivo), 404, 'Arquivo não encontrado.');

        return Storage::disk('public')->download($arquivo);
    }
}
