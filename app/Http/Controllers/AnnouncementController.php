<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Announcement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class AnnouncementController extends Controller
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
        $read = $request->input("read");
        $announcements =  Auth::user()->announcementsReadOrUnread($read)->name($search)
            ->description($search)
            ->order($orderBy, $order)
            ->skipPage($toSkip)
            ->take($limit)
            ->get();
        return response()->json(['count' => Auth::user()->announcementsReadOrUnread($read)->count(), 'total' => Auth::user()->announcementsReadOrUnread($read)->count(), 'data' => $announcements]);
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
            "name" => "required|max:50",
            "description" => "required|max:200"
        ]);
        if ($validator->fails()) {
            return response()->json(['status' => 422, 'errors' => $validator->messages()]);
        }
        $assignees = [];
        $assigneeNameArrays = User::select('name')->whereIn('id', $request["asigneeIds"])->get()->toArray();
        foreach ($assigneeNameArrays as $assigneeNameArray) {
            array_push($assignees, $assigneeNameArray["name"]);
        }
        $request["assignees"] = implode(", ", $assignees);
        $request["owner_id"] = Auth::id();
        $announcement = Announcement::create($request->all());
        $announcement->users()->attach($request["asigneeIds"]);
        return response()->json(['status' => 200, 'announcement' => $announcement]);
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Announcement  $announcement
     * @return \Illuminate\Http\Response
     */
    public function show(Announcement $announcement)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Announcement  $announcement
     * @return \Illuminate\Http\Response
     */
    public function edit(Announcement $announcement)
    {
        $asigneeIds = [];
        $initialAssignees = [];
        foreach ($announcement->users()->select("user_id", "name")->get()->toArray() as $userInfo) {
            array_push($asigneeIds, $userInfo["user_id"]);
            array_push($initialAssignees, $userInfo["name"]);
        }
        $announcement["asigneeIds"] = $asigneeIds;
        $announcement["initialAssignees"] = $initialAssignees;
        return response()->json(['status' => 200, 'announcement' => $announcement]);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Announcement  $announcement
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Announcement $announcement)
    {
        $validator = Validator::make($request->all(), [
            "name" => "required|max:50",
            "description" => "required|max:200"
        ]);
        if ($validator->fails()) {
            return response()->json(['status' => 422, 'errors' => $validator->messages()]);
        }
        $assignees = [];
        $assigneeNameArrays = User::select('name')->whereIn('id', $request["asigneeIds"])->get()->toArray();
        foreach ($assigneeNameArrays as $assigneeNameArray) {
            array_push($assignees, $assigneeNameArray["name"]);
        }
        $request["assignees"] = implode(", ", $assignees);
        $announcement->users()->sync($request["asigneeIds"]);
        $announcement->update($request->all());
        return response()->json(['status' => 200, 'announcement' => $announcement]);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Announcement  $announcement
     * @return \Illuminate\Http\Response
     */
    public function destroy(Announcement $announcement)
    {
        if ($announcement->delete()) {
            return response()->json(["status" => 200]);
        }
    }

    public function destroyMany(Request $request)
    {
        $selectedSentAnnouncementIds = $request->selectedSentAnnouncementIds;
        $sentAnnouncementsToDelete = Announcement::whereIn('id', $selectedSentAnnouncementIds)->delete();
        return response()->json(['status' => 200, 'sentAnnouncementsToDelete' => $sentAnnouncementsToDelete]);
    }

    public function populateThisAnnouncementDetails(Announcement $announcement)
    {
        $thisAnnouncementDetails = [];
        foreach ($announcement->users as $user) {
            $thisAnnouncementDetail = [];
            array_push(
                $thisAnnouncementDetail,
                $user->name,
                $user->pivot->read,
                $user->pivot->deleted
            );
            array_push($thisAnnouncementDetails, $thisAnnouncementDetail);
        }
        return response()->json(['status' => 200, 'thisAnnouncementDetails' => $thisAnnouncementDetails]);
    }

    public function getSentAnnouncements(Request $request)
    {
        $search = $request->input("search");
        $limit = $request->input("limit");
        $page = $request->input("page");
        $orderBy = $request->input("orderBy");
        $order = $request->input("order");
        $toSkip = ($page - 1) * $limit;
        $read = $request->input("read");
        $sentAnnouncements =  Announcement::sent()
            ->name($search)
            ->description($search)
            ->order($orderBy, $order)
            ->skipPage($toSkip)
            ->take($limit)
            ->get();
        return response()->json(['count' => Announcement::sent()->count(), 'total' => Announcement::sent()->count(), 'data' => $sentAnnouncements]);
    }
}
