<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UtilitiesController extends Controller
{
    public function token()
    {
        echo csrf_token();
    }

    public function getLoggedInUsername()
    {
        if (Auth::check()) {
            return response()->json(["loggedInUserName" => Auth::user()->name, "loggedInUserId" => Auth::id()]);
        }
        return response()->json(["loggedInUserName" => "Guest"]);
    }
}
