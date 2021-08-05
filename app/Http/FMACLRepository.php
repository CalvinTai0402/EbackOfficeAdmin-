<?php

namespace App\Http;

use Alexusmai\LaravelFileManager\Services\ACLService\ACLRepository;
use Illuminate\Support\Facades\Auth;

class FMACLRepository implements ACLRepository
{
    /**
     * Get user ID
     *
     * @return mixed
     */
    public function getUserID()
    {
        return Auth::id();
    }

    /**
     * Get ACL rules list for user
     *
     * @return array
     */
    public function getRules(): array
    {
        if (Auth::user()->role === "admin") {
            return [
                ['disk' => 'public', 'path' => '*', 'access' => 2],
            ];
        }

        // 0 - no access; 1 - read only; 2 - read and write
        return [
            ['disk' => 'public', 'path' => '/', 'access' => 1],
            ['disk' => 'public', 'path' => 'users', 'access' => 1],
            ['disk' => 'public', 'path' => 'users/' . Auth::user()->name . ' (' . Auth::user()->email . ')', 'access' => 1],
            ['disk' => 'public', 'path' => 'users/' . Auth::user()->name . ' (' . Auth::user()->email . ')/', 'access' => 2],
            ['disk' => 'public', 'path' => 'users/' . Auth::user()->name . ' (' . Auth::user()->email . ')/*', 'access' => 2],
            ['disk' => 'public', 'path' => 'users/*', 'access' => 0],
            ['disk' => 'public', 'path' => 'shared', 'access' => 2],
            ['disk' => 'public', 'path' => 'shared/*', 'access' => 2],
        ];
    }
}
