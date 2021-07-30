<?php

namespace App\Http\Controllers;

class UtilitiesController extends Controller
{
    public function token()
    {
        echo csrf_token();
    }

    public function getLoggedInUsername()
    {
        return response()->json(["loggedInUserName" => auth()->user()->name ?? 'Guest']);
    }
}
