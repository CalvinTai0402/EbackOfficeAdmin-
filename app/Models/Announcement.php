<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use \App\Models\User;
use Illuminate\Support\Facades\Auth;
use OwenIt\Auditing\Contracts\Auditable;

class Announcement extends Model  implements Auditable
{
    use HasFactory;
    use \OwenIt\Auditing\Auditable;
    protected $fillable = [
        'name',
        'description',
        'assignees',
        'owner_id'
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

    public function scopeSent($query)
    {
        return $query->where('owner_id', '=', Auth::id());
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
        return $this->belongsToMany(User::class, 'announcements_users', 'announcement_id', 'user_id')->withPivot('read', 'deleted');
    }
}
