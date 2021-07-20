<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
}
