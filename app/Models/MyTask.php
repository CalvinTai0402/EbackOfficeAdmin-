<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Customer;
use Illuminate\Support\Facades\Auth;

class MyTask extends Model
{
    use HasFactory;
    protected $fillable = [
        'name',
        'description',
        'notes',
        'duedate',
        'repeat',
        'priority',
        'status',
        'assigneeNames',
        'customer_code',
        'customer_id'
    ];
    protected $table = 'task_lists';

    // private $loggedInUsername;

    // public function __construct()
    // {
    //     $this->loggedInUsername = Auth::user()->name;;
    // }

    // public function scopeOverdue($query, $filter)
    // {
    //     if (!is_null($filter)) {
    //         return $query->orWhere('assigneeNames', 'LIKE', '%' . $filter . '%');
    //     }

    //     return $query;
    // }

    // public function scopeIncomplete($query, $value)
    // {
    //     if ($value) {
    //         return $query->where('status', '<>', 'Completed');
    //     }

    //     return $query;
    // }

    // public function scopeSearch($query, $filter)
    // {
    //     if (!is_null($filter)) {
    //         return $query->where('assigneeNames', 'LIKE', '%' . $this->loggedInUsername . '%')
    //             ->where(function ($query, $filter) {
    //                 $query->where('name', 'LIKE', '%' . $filter . '%')
    //                     ->orWhere('customer_code', 'LIKE', '%' . $filter . '%')
    //                     ->orWhere('description', 'LIKE', '%' . $filter . '%')
    //                     ->orWhere('priority', 'LIKE', '%' . $filter . '%')
    //                     ->orWhere('status', 'LIKE', '%' . $filter . '%');
    //             });
    //     }
    //     return $query;
    // }

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
