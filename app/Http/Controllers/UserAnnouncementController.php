<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserAnnouncementController extends Controller
{
    public function store(Request $request)
    {
        //
    }

    public function update(Request $request, Announcement $announcement)
    {
        // TODO: Check the status of 'read' and just toggle it between true/false
        Auth::user()->announcements()->updateExistingPivot($announcement->id, ['read' => true]);
    }

    public function destroy(Announcement $announcement)
    {
        Auth::user()->announcements()->updateExistingPivot($announcement->id, ['deleted' => true]);
    }

    public function destroyMany(Request $request)
    {
        $selectedAnnouncementIds = $request->input('selectedAnnouncementIds');
        Auth::user()->announcements()->updateExistingPivot($selectedAnnouncementIds, ["deleted" => 1]);
        return response()->json(['status' => 200]);
    }
}
