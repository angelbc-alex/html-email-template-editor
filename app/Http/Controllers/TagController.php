<?php

namespace App\Http\Controllers;

use App\Models\Tag;
use Illuminate\Http\Request;

class TagController extends Controller
{
    public function index()
    {
        return response()->json(Tag::orderBy('name')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:50',
            'color' => 'required|string|regex:/^#[0-9a-fA-F]{6}$/',
        ]);

        $tag = Tag::firstOrCreate(['name' => $validated['name']], $validated);

        return response()->json($tag);
    }
}
