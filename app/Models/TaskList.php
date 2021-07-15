<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use \App\Models\User;

class TaskList extends Model
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
    ];

    public function scopeName($query, $filter)
    {
        if (!is_null($filter)) {
            return $query->where('name', 'LIKE', '%' . $filter . '%');
        }

        return $query;
    }

    public function scopeDescription($query, $filter)
    {
        if (!is_null($filter)) {
            return $query->orWhere('description', 'LIKE', '%' . $filter . '%');
        }

        return $query;
    }

    public function scopeNotes($query, $filter)
    {
        if (!is_null($filter)) {
            return $query->orWhere('notes', 'LIKE', '%' . $filter . '%');
        }

        return $query;
    }
    public function scopeRepeat($query, $filter)
    {
        if (!is_null($filter)) {
            return $query->orWhere('repeat', 'LIKE', '%' . $filter . '%');
        }

        return $query;
    }

    public function scopePriority($query, $filter)
    {
        if (!is_null($filter)) {
            return $query->orWhere('priority', 'LIKE', '%' . $filter . '%');
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

    public function scopeAssigneenames($query, $filter)
    {
        if (!is_null($filter)) {
            return $query->orWhere('assigneeNames', 'LIKE', '%' . $filter . '%');
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
}
