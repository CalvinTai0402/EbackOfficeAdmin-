<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Customer;

class Credential extends Model
{
    use HasFactory;
    protected $fillable = [
        'entity_name',
        'login_url',
        'username',
        'password',
        'remarks',
        'customer_id',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}
