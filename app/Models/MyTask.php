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
    ];
    protected $table = 'task_lists';
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
}
