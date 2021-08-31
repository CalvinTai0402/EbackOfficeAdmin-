<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Customer;
use Illuminate\Support\Facades\Auth;
use OwenIt\Auditing\Contracts\Auditable;

class MyTask extends Model implements Auditable
{
    use HasFactory;
    use \OwenIt\Auditing\Auditable;
    protected $fillable = [
        'name',
        'description',
        'notes',
        'duedate',
        'repeat',
        'priority',
        'status',
        'minutes',
        'assigneeNames',
        'customer_code',
        'customer_id',
    ];
    protected $table = 'task_lists';

    public function scopeTest($query)
    {
        echo "Success!";
        return $query;
    }

    public function scopeName($query, $filter)
    {
        if (!is_null($filter)) {
            return $query->where('name', 'LIKE', '%' . $filter . '%');
        }

        return $query;
    }

    public function scopeCustomer($query, $filter)
    {
        if (!is_null($filter)) {
            return $query->orWhere('customer_code', 'LIKE', '%' . $filter . '%');
        }

        return $query;
    }

    public function scopePriority($query, $filter)
    {
        if (!is_null($filter)) {
            return $query->where('priority', 'LIKE', '%' . $filter . '%');
        }

        return $query;
    }

    public function scopeStatus($query, $filter)
    {
        if (!is_null($filter)) {
            return $query->orWhere('status', 'LIKE', '%' . $filter . '%');
        }

        return $query;
    }

    public function scopeOrder($query, $field, $order)
    {
        if (!is_null($field)) {
            return $query->orderBy($field, $order);
        }

        return $query;
    }

    public function scopeSkipPage($query, $toSkip)
    {
        if ($toSkip != 0) {
            return $query->skip($toSkip);
        }

        return $query;
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'tasklists_users', 'tasklist_id', 'user_id');
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}
