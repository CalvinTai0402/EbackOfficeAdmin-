<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AlterTableUsers extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('usersPerPage')->default(20);
            $table->string('customersPerPage')->default(20);
            $table->string('availableTasksPerPage')->default(20);
            $table->string('taskListsPerPage')->default(20);
            $table->string('myTasksPerPage')->default(20);
            $table->string('announcementsPerPage')->default(20);
            $table->string('sentAnnouncementsPerPage')->default(20);
            $table->string('sidebarTextColor')->default("white");
            $table->string('sidebarTextSelectedColor')->default("yellow");
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('usersPerPage');
            $table->dropColumn('customersPerPage');
            $table->dropColumn('availableTasksPerPage');
            $table->dropColumn('taskListsPerPage');
            $table->dropColumn('myTasksPerPage');
            $table->dropColumn('announcementsPerPage');
            $table->dropColumn('sentAnnouncementsPerPage');
            $table->dropColumn('sidebarTextColor');
            $table->dropColumn('sidebarTextSelectedColor');
        });
    }
}
