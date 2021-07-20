<?php

namespace App\Http\Controllers;

use App\Models\TaskList;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\User;
use App\Models\Customer;

class TaskListController extends Controller
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
        $taskLists = TaskList::name($search)
            ->customer($search)
            ->description($search)
            ->notes($search)
            ->repeat($search)
            ->priority($search)
            ->status($search)
            ->assigneenames($search)
            ->order($orderBy, $order)
            ->skipPage($toSkip)
            ->take($limit)
            ->get();
        return response()->json(['count' => TaskList::count(), 'total' => TaskList::count(), 'data' => $taskLists]);
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
            "name" => "required|max:200",
            "customer_code" => "required|max:200",
            "description" => "required|max:200",
            "duedate" => "required|max:200",
            "repeat" => "required|max:200",
            "priority" => "required|max:200",
            "status" => "required|max:200",
        ]);
        if ($validator->fails()) {
            return response()->json(['status' => 422, 'errors' => $validator->messages()]);
        }
        $assigneeNames = [];
        $assigneeNameArrays = User::select('name')->whereIn('id', $request["asigneeIds"])->get()->toArray();
        foreach ($assigneeNameArrays as $assigneeNameArray) {
            array_push($assigneeNames, $assigneeNameArray["name"]);
        }
        $request["assigneeNames"] = implode(", ", $assigneeNames);
        $taskList = TaskList::create($request->all());
        $taskList->users()->attach($request["asigneeIds"]);
        $taskList->customer()->associate(Customer::find($request["customer_id"]))->save();
        return response()->json(['status' => 200, 'taskList' => $taskList]);
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\TaskList  $taskList
     * @return \Illuminate\Http\Response
     */
    public function show(TaskList $taskList)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\TaskList  $taskList
     * @return \Illuminate\Http\Response
     */
    public function edit(TaskList $taskList)
    {
        $asigneeIds = [];
        $initialAssignees = [];
        foreach ($taskList->users()->select("user_id", "name")->get()->toArray() as $userInfo) {
            array_push($asigneeIds, $userInfo["user_id"]);
            array_push($initialAssignees, $userInfo["name"]);
        }
        $taskList["asigneeIds"] = $asigneeIds;
        $taskList["initialAssignees"] = $initialAssignees;
        return response()->json(['status' => 200, 'taskList' => $taskList]);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\TaskList  $taskList
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, TaskList $taskList)
    {
        $validator = Validator::make($request->all(), [
            "name" => "required|max:200",
            "customer_code" => "required|max:200",
            "description" => "required|max:200",
            "duedate" => "required|max:200",
            "repeat" => "required|max:200",
            "priority" => "required|max:200",
            "status" => "required|max:200",
        ]);
        if ($validator->fails()) {
            return response()->json(['status' => 422, 'errors' => $validator->messages()]);
        }
        $assigneeNames = [];
        $assigneeNameArrays = User::select('name')->whereIn('id', $request["asigneeIds"])->get()->toArray();
        foreach ($assigneeNameArrays as $assigneeNameArray) {
            array_push($assigneeNames, $assigneeNameArray["name"]);
        }
        $request["assigneeNames"] = implode(", ", $assigneeNames);
        $taskList->users()->sync($request["asigneeIds"]);
        $taskList->customer()->associate(Customer::find($request["customer_id"]))->save();
        $taskList->update($request->all());
        return response()->json(['status' => 200, 'taskList' => $taskList]);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\TaskList  $taskList
     * @return \Illuminate\Http\Response
     */
    public function destroy(TaskList $taskList)
    {
        if ($taskList->delete()) {
            return response()->json(["status" => 200]);
        }
    }

    public function destroyMany(Request $request)
    {
        $selectedTaskListIds = $request->selectedTaskListIds;
        $taskListsToDelete = TaskList::whereIn('id', $selectedTaskListIds)->delete();
        return response()->json(['status' => 200, 'taskListsToDelete' => $taskListsToDelete]);
    }
}
