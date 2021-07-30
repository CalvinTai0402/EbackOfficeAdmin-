<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateCustomerRequest extends FormRequest
{
    public function rules()
    {
        return [
            "code"        => ['required', 'max:50', 'unique:customers,code'],
            "name"        => ['required', 'min:3', 'max:50'],
            "service"     => ['required', 'max:50'],
            'credentials' => ['nullable', 'sometimes', 'array']
        ];
    }

    public function authorize()
    {
        return true;
    }
}
