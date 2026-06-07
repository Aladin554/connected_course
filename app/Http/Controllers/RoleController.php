<?php

namespace App\Http\Controllers;

use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RoleController extends Controller
{
    /**
     * Display a listing of roles.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(): \Illuminate\Http\JsonResponse
    {
        $auth = Auth::user();

        // If superadmin → show all roles
        if ($auth->role->id === 1) {
            $roles = Role::all();
        }
        // If admin → only allow "user" role
        else if ($auth->role->id === 2) {
            $roles = Role::where('name', 'user')->get();
        }
        // If normal user → block completely
        else {
            return response()->json([], 403);
        }

        return response()->json($roles);
    }
}
