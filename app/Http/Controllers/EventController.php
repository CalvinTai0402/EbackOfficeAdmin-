<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\TaskList;
use Illuminate\Http\Request;
use DateTime;
use DateTimeZone;
use Illuminate\Support\Facades\Auth;

class EventController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $events =  Auth::user()->events;
        return response()->json(['status' => 200, 'events' => $events]);
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
        $request["title"] = "E: " . $request["title"];
        $startDate = new DateTime($request["start"], new DateTimeZone('UTC'));
        $startDate->setTimezone(new DateTimeZone('America/Denver'));
        $endDate = new DateTime($request["end"], new DateTimeZone('UTC'));
        $endDate->setTimezone(new DateTimeZone('America/Denver'));
        $request["start"] = $startDate->format('Y-m-d H:i:s');
        $request["end"] = $endDate->format('Y-m-d H:i:s');
        if ($request["priority"] == "High") {
            $request["color"] = "Red";
        } elseif ($request["priority"] == "Medium") {
            $request["color"] = "Blue";
        } else {
            $request["color"] = "Green";
        }
        $request["user_id"] = Auth::id();
        $event = Event::create($request->all());
        return response()->json(['status' => 200, 'event' => $event]);
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Event  $event
     * @return \Illuminate\Http\Response
     */
    public function show(Event $event)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Event  $event
     * @return \Illuminate\Http\Response
     */
    public function edit(Event $event)
    {
        return response()->json(['status' => 200, 'event' => $event]);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Event  $event
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Event $event)
    {
        if ($request->editType == "date") {
            $startDate = new DateTime($request["start"], new DateTimeZone('UTC'));
            $startDate->setTimezone(new DateTimeZone('America/Denver'));
            $endDate = new DateTime($request["end"], new DateTimeZone('UTC'));
            $endDate->setTimezone(new DateTimeZone('America/Denver'));
            $request["start"] = $startDate->format('Y-m-d H:i:s');
            $request["end"] = $endDate->format('Y-m-d H:i:s');
            $event->update($request->all());
        } else if ($request->editType == "content") {
            $request["title"] = "E: " . $request["title"];
            if ($request["priority"] == "High") {
                $request["color"] = "Red";
            } elseif ($request["priority"] == "Medium") {
                $request["color"] = "Blue";
            } else {
                $request["color"] = "Green";
            }
            $event->update($request->all());
        }
        return response()->json(['status' => 200, 'event' => $event]);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Event  $event
     * @return \Illuminate\Http\Response
     */
    public function destroy(Event $event)
    {
        if ($event->title[0] == "E") {
            if ($event->delete()) {
                return response()->json(["status" => 200]);
            }
        }
        // else {
        //     $taskList = TaskList::find($event->task_id);
        //     if ($taskList->delete()) {
        //         if ($event->delete()) {
        //             return response()->json(["status" => 200]);
        //         }
        //     }
        // }
    }

    public function getTaskId(Event $event)
    {
        return response()->json(['status' => 200, 'taskId' => $event->task_id]);
    }
}
