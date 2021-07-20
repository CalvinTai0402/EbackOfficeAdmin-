<?php

namespace Database\Factories;

use App\Models\Customer;
use Illuminate\Database\Eloquent\Factories\Factory;

class CustomerFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Customer::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        return [
            'code' => $this->faker->unique()->uuid(),
            'name' => $this->faker->sentence(1),
            'service' => "Tax",
            'service_other' => '',
            'business_address' => $this->faker->address(),
            'mailing_address' => $this->faker->address(),
            'year_end' => "January",
            'ein' => '1289733',
            'company_group' => $this->faker->sentence(1),
            'contact_person' => $this->faker->name(),
            'other_contact_person' => $this->faker->name(),
            'email' => $this->faker->email(),
            'fax' => $this->faker->phoneNumber(),
            'telephone' => $this->faker->phoneNumber(),
            'client_status' => 'Done',
            'remark' => 'None',
        ];
    }
}
