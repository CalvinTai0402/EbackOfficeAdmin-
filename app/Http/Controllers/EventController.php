<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;
use DateTime;
use DateTimeZone;

class EventController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        // $data = Event::whereDate('start', '>=', $request->start)
        //     ->whereDate('end',   '<=', $request->end)
        //     ->get(['id', 'title', 'start', 'end']);
        $events = Event::all();
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
        $event = Event::create($request->all());
        return $event;
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
        //
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
        $startDate = new DateTime($request["start"], new DateTimeZone('UTC'));
        $startDate->setTimezone(new DateTimeZone('America/Denver'));
        $endDate = new DateTime($request["end"], new DateTimeZone('UTC'));
        $endDate->setTimezone(new DateTimeZone('America/Denver'));
        $request["start"] = $startDate->format('Y-m-d H:i:s');
        $request["end"] = $endDate->format('Y-m-d H:i:s');
        $event->update($request->all());
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
        if ($event->delete()) {
            return response()->json(["status" => 200]);
        }
    }
}
