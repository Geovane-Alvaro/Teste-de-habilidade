<?php

namespace App\Http\Controllers;

use App\Models\Rotafazenda;
use Illuminate\Http\Request;

class RotafazendaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $fazendas = Rotafazenda::all();

        $mensagemSucesso = session('mensagem.sucesso');

        return view('rotafazenda.index')->with('fazendas', $fazendas)->with('mensagemSucesso', $mensagemSucesso);
        
    }
    
    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Rotafazenda $rotafazenda)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Rotafazenda $rotafazenda)
    {
        return view('rotafazenda.edit')->with('fazenda', $rotafazenda);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Rotafazenda $rotafazenda)
    {
        $dados = $request->all();

        $rotafazenda->update($dados);

        return to_route('rotafazenda.index')
        ->with('mensagem.sucesso', "Fazenda '{$rotafazenda->fazenda}' atualizada com sucesso!");
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Rotafazenda $rotafazenda)
    {
         $rotafazenda->delete();

        return to_route('rotafazenda.index')->with('mensagem.sucesso', "Fazenda '{$rotafazenda->fazenda}' deletada com sucesso!");
    }
}
