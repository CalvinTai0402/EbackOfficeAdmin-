<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    use HasFactory;
    protected $fillable = [
        'name',
        'email',
    ];

    public function scopeName($query, $filter)
    {
        if (!is_null($filter)) {
            return $query->where('name', 'LIKE', '%' . $filter . '%');
        }

        return $query;
    }

    public function scopeEmail($query, $filter)
    {
        if (!is_null($filter)) {
            return $query->orWhere('email', 'LIKE', '%' . $filter . '%');
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
