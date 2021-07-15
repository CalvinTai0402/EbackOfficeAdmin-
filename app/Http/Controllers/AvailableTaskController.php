<?php

namespace App\Http\Controllers;

use App\Models\AvailableTask;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AvailableTaskController extends Controller
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
        $availableTasks = AvailableTask::name($search)
            ->description($search)
            ->order($orderBy, $order)
            ->skipPage($toSkip)
            ->take($limit)
            ->get();
        return response()->json(['count' => AvailableTask::count(), 'total' => AvailableTask::count(), 'data' => $availableTasks]);
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
            "name" => "required|max:50|unique:available_tasks,name",
            "description" => "required|max:200"
        ]);
        if ($validator->fails()) {
            return response()->json(['status' => 422, 'errors' => $validator->messages()]);
        }
        $availableTask = AvailableTask::create($request->all());
        return response()->json(['status' => 200, 'availableTask' => $availableTask]);
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\AvailableTask  $availableTask
     * @return \Illuminate\Http\Response
     */
    public function show(AvailableTask $availableTask)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\AvailableTask  $availableTask
     * @return \Illuminate\Http\Response
     */
    public function edit(AvailableTask $availableTask)
    {
        return response()->json(['status' => 200, 'availableTask' => $availableTask]);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\AvailableTask  $availableTask
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, AvailableTask $availableTask)
    {
        $validator = Validator::make($request->all(), [
            "name" => "required|max:50|unique:available_tasks,name,$availableTask->id",
            "description" => "required|max:200"
        ]);
        if ($validator->fails()) {
            return response()->json(['status' => 422, 'errors' => $validator->messages()]);
        }
        $availableTask->update($request->all());
        return response()->json(['status' => 200, 'availableTask' => $availableTask]);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\AvailableTask  $availableTask
     * @return \Illuminate\Http\Response
     */
    public function destroy(AvailableTask $availableTask)
    {
        if ($availableTask->delete()) {
            return response()->json(["status" => 200]);
        }
    }

    public function destroyMany(Request $request)
    {
        $selectedAvailableTaskIds = $request->selectedAvailableTaskIds;
        $availableTasksToDelete = AvailableTask::whereIn('id', $selectedAvailableTaskIds)->delete();
        return response()->json(['status' => 200, 'availableTasksToDelete' => $availableTasksToDelete]);
    }

    public function populateAvalableTasksForTaskList()
    {
        $availableTaskNamesAndDescriptions = AvailableTask::select("name", "description")->get();
        return response()->json(['status' => 200, 'availableTaskNamesAndDescriptions' => $availableTaskNamesAndDescriptions]);
    }
}
