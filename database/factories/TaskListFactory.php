<?php

namespace Database\Factories;

use App\Models\TaskList;
use Illuminate\Database\Eloquent\Factories\Factory;
use \Carbon\Carbon;

class TaskListFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = TaskList::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        return [
            'name' => $this->faker->sentence(1),
            'description' => $this->faker->sentence(7),
            'notes' => $this->faker->sentence(7),
            'duedate' => "07-11-2021",
            'repeat' => "Daily",
            'priority' => "High",
            'status' => "In progress",
            'assigneeNames' => "Jian Tai",
            'customer_code' => "fvbsdff890we03-fibfv",
            'customer_id' => \App\Models\Customer::factory(),
        ];
    }
}
