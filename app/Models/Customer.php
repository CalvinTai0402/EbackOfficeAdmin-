<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Credential;
use App\Models\TaskList;

class Customer extends Model
{
    use HasFactory;
    protected $fillable = [
        'code',
        'name',
        'service',
        'service_other',
        'business_address',
        'mailing_address',
        'year_end',
        'ein',
        'company_group',
        'contact_person',
        'other_contact_person',
        'email',
        'fax',
        'telephone',
        'client_status',
        'remark',
    ];

    public function scopeCode($query, $filter)
    {
        if (!is_null($filter)) {
            return $query->where('code', 'LIKE', '%' . $filter . '%');
        }

        return $query;
    }

    public function scopeName($query, $filter)
    {
        if (!is_null($filter)) {
            return $query->orWhere('name', 'LIKE', '%' . $filter . '%');
        }

        return $query;
    }

    public function scopeService($query, $filter)
    {
        if (!is_null($filter)) {
            return $query->orWhere('service', 'LIKE', '%' . $filter . '%');
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

    public function credentials()
    {
        return $this->hasMany(Credential::class);
    }

    public function taskLists()
    {
        return $this->hasMany(TaskList::class);
    }
}
