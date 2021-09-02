<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Announcement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Intervention\Image\Facades\Image;
use Illuminate\Support\Facades\Storage;

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
        // $read = $request->input("read");
        // $unreadAnnouncements =  Auth::user()->announcementsReadOrUnread(0)->name($search)
        //     ->description($search)
        //     ->order($orderBy, $order)
        //     ->skipPage($toSkip)
        //     ->take($limit)
        //     ->get();
        // foreach ($unreadAnnouncements as $unreadAnnouncement) {
        //     $unreadAnnouncement['status'] = "Unread";
        // }
        // $readAnnouncements =  Auth::user()->announcementsReadOrUnread(1)->name($search)
        //     ->description($search)
        //     ->order($orderBy, $order)
        //     ->skipPage($toSkip)
        //     ->take($limit)
        //     ->get();
        // foreach ($readAnnouncements as $readAnnouncement) {
        //     $readAnnouncement['status'] = "Read";
        // }
        // $announcements = $unreadAnnouncements->merge($readAnnouncements);
        $unreadAnnouncements =  Auth::user()->announcementsReadOrUnread(0)->name($search)
            ->description($search)
            ->order($orderBy, $order)
            ->get();
        foreach ($unreadAnnouncements as $unreadAnnouncement) {
            $unreadAnnouncement['status'] = "Unread";
        }
        $readAnnouncements =  Auth::user()->announcementsReadOrUnread(1)->name($search)
            ->description($search)
            ->order($orderBy, $order)
            ->get();
        foreach ($readAnnouncements as $readAnnouncement) {
            $readAnnouncement['status'] = "Read";
        }
        // $announcements = $unreadAnnouncements->merge($readAnnouncements)->skip(1)->take(5);
        if ($toSkip != 0) {
            $announcements = $unreadAnnouncements->merge($readAnnouncements)
                ->skip($toSkip)
                ->take($limit);
            // ->get();
        } else {
            $announcements = $unreadAnnouncements->merge($readAnnouncements)
                ->take($limit);
            // ->get();
        }
        return response()->json(['count' => $unreadAnnouncements->merge($readAnnouncements)->count(), 'total' => $unreadAnnouncements->merge($readAnnouncements)->count(), 'data' => $announcements]);
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
            "description" => "required|max:3000"
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
            "description" => "required|max:3000"
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
        if (!is_null($search)) {
            $sentAnnouncements = Announcement::sent()->where(function (
                $query
            ) use ($search) {
                $query
                    ->where('name', 'LIKE', '%' . $search . '%')
                    ->orWhere('description', 'LIKE', '%' . $search . '%');
            });
        } else {
            $sentAnnouncements = Announcement::sent();
        }
        $sentAnnouncements = $sentAnnouncements->order($orderBy, $order)
                                                ->skipPage($toSkip)
                                                ->take($limit)
                                                ->get();
        return response()->json(['count' => Announcement::sent()->count(), 'total' => Announcement::sent()->count(), 'data' => $sentAnnouncements]);
    }

    public function saveImageFile(Request $request)
    {
        $response = [];
        if ($request->has('imageFile')) {
            $imageFile = $request->file('imageFile');
            // $imageFile->move('announcementImages/', $request["fileName"]);
            $imageFileResized = Image::make($imageFile)->resize(300, null, function ($constraint) {
                $constraint->aspectRatio();
            });
            // $imageFileResized->save(public_path('announcementImages/' . $request["fileName"]));
            $imageFileResized->save(Storage::disk('local')->getDriver()->getAdapter()->getPathPrefix() . 'public/announcementImages/' . $request["fileName"]);
            $response["status"] = 200;
            $response["message"] = "Success! kerasModelFile(s) uploaded";
        } else {
            $response["status"] = 500;
            $response["message"] = "Failed! kerasModelFile(s) not uploaded";
        }
        return response()->json($response);
    }
}
