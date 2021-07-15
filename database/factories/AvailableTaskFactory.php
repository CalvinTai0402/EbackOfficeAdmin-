<?php

namespace Database\Factories;

use App\Models\AvailableTask;
use Illuminate\Database\Eloquent\Factories\Factory;

class AvailableTaskFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = AvailableTask::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        return [
            'name' => $this->faker->unique()->sentence(1),
            'description' => $this->faker->sentence(7),
        ];
    }
}
