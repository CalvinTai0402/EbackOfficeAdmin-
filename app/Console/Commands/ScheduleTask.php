<?php

namespace App\Console\Commands;

// use Illuminate\Support\Facades\DB;
use Illuminate\Console\Command;
use App\Models\TaskList;
use Carbon\Carbon;

class ScheduleTask extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'make:task';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create repetitive tasks';
    public $tasks;
    public $frequency;

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        foreach (TaskList::all()->toArray() as $taskList) {
            $startDate = Carbon::now()->subDays(15);
            $endDate = Carbon::now()->addDays(30);
            $currentTaskListDuedate = Carbon::createFromFormat('m-d-Y',  $taskList["duedate"]);
            if ($currentTaskListDuedate->between($startDate, $endDate)) {
                $this->handleHelper($taskList, $taskList["repeat"]);
            }
        }
    }

    public function handleHelper($currentTaskList, $frequency)
    {
        $allTaskLists = TaskList::all()->toArray();
        // $matchedTasks = []; // tasks with the same taskname and companycode
        // foreach ($allTasks as $task) {
        //     if ($task['taskname'] == $currentTask['taskname'] && $task['companycode'] == $currentTask['companycode']) {
        //         array_push($matchedTasks, $task);
        //     }
        // }
        $matchedTaskLists = []; // tasks with the same taskname
        foreach ($allTaskLists as $taskList) {
            if ($taskList['name'] == $currentTaskList['name']) {
                array_push($matchedTaskLists, $taskList);
            }
        }
        // Now we have all the tasks that match the current task's taskname and companycode. Next, we check if the "next" (impending) task exists. If not, insert it. Note that "next" is defined by the "repeat" column.
        $nextTaskList = $currentTaskList;
        unset($nextTaskList["id"]);
        $nextTaskList["created_at"] = Carbon::now();
        $nextTaskList["updated_at"] = Carbon::now();
        if ($frequency == "Daily") {
            $nextTaskList["duedate"] = Carbon::createFromFormat('m-d-Y', $currentTaskList["duedate"])->addDay(1)->format('m-d-Y');
        } elseif ($frequency == "Weekly") {
            $nextTaskList["duedate"] = Carbon::createFromFormat('m-d-Y', $currentTaskList["duedate"])->addWeek(1)->format('m-d-Y');
        } elseif ($frequency == "Monthly") {
            $nextTaskList["duedate"] = Carbon::createFromFormat('m-d-Y', $currentTaskList["duedate"])->addMonth(1)->format('m-d-Y');
        } elseif ($frequency == "Yearly") {
            $nextTaskList["duedate"] = Carbon::createFromFormat('m-d-Y', $currentTaskList["duedate"])->addYear(1)->format('m-d-Y');
        }
        $dontInsert = false;
        foreach ($matchedTaskLists as $matchedTaskList) {
            if ($nextTaskList["duedate"] == $matchedTaskList["duedate"]) {
                $dontInsert = true;
                break;
            }
        }
        if (!$dontInsert) {
            // DB::table('tasklist')->insert($nextTask);
            TaskList::create($nextTaskList);
        }
    }
}
