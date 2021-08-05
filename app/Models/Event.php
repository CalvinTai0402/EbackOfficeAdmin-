<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use \App\Models\User;
use OwenIt\Auditing\Contracts\Auditable;

class Event extends Model implements Auditable
{
    use HasFactory;
    use \OwenIt\Auditing\Auditable;
    protected $fillable = [
        'title', 'start', 'end', 'description', "priority", "color", "user_id", "task_id",
    ];
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
