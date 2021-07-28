<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        \App\Models\User::factory(10)->create();
        \App\Models\Customer::factory(10)->create();
        \App\Models\AvailableTask::factory(10)->create();
        \App\Models\TaskList::factory(10)->create();
        \App\Models\Announcement::factory(10)->create();
    }
}
