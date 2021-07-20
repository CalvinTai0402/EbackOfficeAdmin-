<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCustomersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->string('service');
            $table->string('service_other')->nullable();
            $table->text('business_address')->nullable();
            $table->text('mailing_address')->nullable();
            $table->string('year_end')->nullable();
            $table->string('ein')->nullable();
            $table->string('company_group')->nullable();
            $table->string('contact_person')->nullable();
            $table->string('other_contact_person')->nullable();
            $table->string('email')->nullable();
            $table->string('fax')->nullable();
            $table->string('telephone')->nullable();
            $table->string('client_status')->nullable();
            $table->text('remark')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('customers');
    }
}
