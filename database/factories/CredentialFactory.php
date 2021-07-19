<?php

namespace Database\Factories;

use App\Models\Credential;
use Illuminate\Database\Eloquent\Factories\Factory;

class CredentialFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Credential::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        return [
            'entity_name' => $this->faker->sentence(1),
            'login_url' => "https://google.com",
            'username' => $this->faker->sentence(1),
            'password' => $this->faker->uuid(),
            'remarks' => "None",
            "customer_id" => \App\Models\Customer::factory(),
        ];
    }
}
