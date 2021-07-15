<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $search = $request->input("search");
        $limit = $request->input("limit");
        $page = $request->input("page");
        $orderBy = $request->input("orderBy");
        $order = $request->input("order");
        $toSkip = ($page - 1) * $limit;
        $users = User::name($search)
            ->email($search)
            ->order($orderBy, $order)
            ->skipPage($toSkip)
            ->take($limit)
            ->get();
        return response()->json(['count' => User::count(), 'total' => User::count(), 'data' => $users]);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            "name" => "required|max:50|unique:users,name",
            "email" => "required|max:50|unique:users,email",
            "role" => "required|max:20",
        ]);
        if ($validator->fails()) {
            return response()->json(['status' => 422, 'errors' => $validator->messages()]);
        }
        $request['password'] = Hash::make($request['password']);
        $user = User::create($request->all());
        return response()->json(['status' => 200, 'user' => $user]);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show(User $user)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit(User $user)
    {
        return response()->json(['status' => 200, 'user' => $user]);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, User $user)
    {
        $validator = Validator::make($request->all(), [
            "name" => "required|max:50|unique:users,name,$user->id",
            "email" => "required|max:50|unique:users,email,$user->id",
            "role" => "required|max:20",
        ]);
        if ($validator->fails()) {
            return response()->json(['status' => 422, 'errors' => $validator->messages()]);
        }
        $user->update($request->all());
        return response()->json(['status' => 200, 'user' => $user]);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(User $user)
    {
        if ($user->delete()) {
            return response()->json(["status" => 200]);
        }
    }

    public function destroyMany(Request $request)
    {
        $selectedUserIds = $request->selectedUserIds;
        $usersToDelete = User::whereIn('id', $selectedUserIds)->delete();
        return response()->json(['status' => 200, 'usersToDelete' => $usersToDelete]);
    }

    public function populateUsersForTaskList()
    {
        $userIdsAndNames = User::select("id", "name")->get();
        return response()->json(['status' => 200, 'userIdsAndNames' => $userIdsAndNames]);
    }

    public function readAnnouncement($announcementId)
    {
        Auth::user()->announcements()->updateExistingPivot($announcementId, ["read" => 1]);
        return response()->json(['status' => 200]);
    }

    public function unreadAnnouncement($announcementId)
    {
        Auth::user()->announcements()->updateExistingPivot($announcementId, ["read" => 0]);
        return response()->json(['status' => 200]);
    }

    public function deleteAnnouncement($announcementId)
    {
        Auth::user()->announcements()->updateExistingPivot($announcementId, ["deleted" => 1]);
        return response()->json(['status' => 200]);
    }

    public function deleteAnnouncements(Request $request)
    {
        $selectedAnnouncementIds = $request->selectedAnnouncementIds;
        Auth::user()->announcements()->updateExistingPivot($selectedAnnouncementIds, ["deleted" => 1]);
        return response()->json(['status' => 200]);
    }
}
