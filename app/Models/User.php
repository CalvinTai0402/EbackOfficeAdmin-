<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use \App\Models\Event;
use \App\Models\TaskList;
use \App\Models\Announcement;
use Illuminate\Support\Facades\Auth;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'usersPerPage',
        'customersPerPage',
        'availableTasksPerPage',
        'taskListsPerPage',
        'myTasksPerPage',
        'auditsPerPage',
        'announcementsPerPage',
        'sentAnnouncementsPerPage',
        'sidebarTextColor',
        'sidebarTextSelectedColor',
    ];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
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

    public function events()
    {
        return $this->hasMany(Event::class);
    }

    public function taskLists()
    {
        return $this->belongsToMany(TaskList::class, 'tasklists_users', 'user_id', 'tasklist_id');
    }

    public function myTasks()
    {
        return $this->belongsToMany(TaskList::class, 'tasklists_users', 'user_id', 'tasklist_id')->wherePivot('user_id', Auth::id());
    }

    public function announcements()
    {
        return $this->belongsToMany(Announcement::class, 'announcements_users', 'user_id', 'announcement_id')->withPivot('read', 'deleted');
    }

    public function announcementsReadOrUnread($read)
    {
        return $this->belongsToMany(Announcement::class, 'announcements_users', 'user_id', 'announcement_id')->wherePivot('deleted', 0)->wherePivot('read', $read);
    }

    public function announcementsUndeleted()
    {
        return $this->belongsToMany(Announcement::class, 'announcements_users', 'user_id', 'announcement_id')->wherePivot('deleted', 0);
    }
}
