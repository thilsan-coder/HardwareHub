<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $users = User::select('id', 'name', 'email', 'created_at')
            ->orderBy('id', 'desc')
            ->get();

        return response()->json([
            'users' => $users,
        ]);
    }
}
