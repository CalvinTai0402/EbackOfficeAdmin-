<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Credential;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CustomerController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $search = $request->input("search");
        $limit = $request->input("limit");
        $page = $request->input("page");
        $orderBy = $request->input("orderBy");
        $order = $request->input("order");
        $toSkip = ($page - 1) * $limit;
        $customers = Customer::code($search)
            ->name($search)
            ->service($search)
            ->order($orderBy, $order)
            ->skipPage($toSkip)
            ->take($limit)
            ->get();
        return response()->json(['count' => Customer::count(), 'total' => Customer::count(), 'data' => $customers]);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            "code" => "required|max:50|unique:customers,code",
            "name" => "required|min:3|max:50",
            "service" => "required|max:50"
        ]);
        if ($validator->fails()) {
            return response()->json(['status' => 422, 'errors' => $validator->messages()]);
        }
        $input = $request;
        $credentials = $input["credentials"];
        unset($input["credentials"]);
        $customer = Customer::create($input->all());
        foreach ($credentials as $credential) {
            $newCredential = new Credential;
            $newCredential->entity_name = $credential[0];
            $newCredential->login_url = $credential[1];
            $newCredential->username = $credential[2];
            $newCredential->password = $credential[3];
            $newCredential->remarks = $credential[4];
            $customer->credentials()->save($newCredential);
        }
        return response()->json(['status' => 200, 'customer' => $customer]);
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Customer  $customer
     * @return \Illuminate\Http\Response
     */
    public function show(Customer $customer)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Customer  $customer
     * @return \Illuminate\Http\Response
     */
    public function edit(Customer $customer)
    {
        return response()->json(['status' => 200, 'customer' => $customer]);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Customer  $customer
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Customer $customer)
    {
        $validator = Validator::make($request->all(), [
            "code" => "required|max:50|unique:customers,codes,$customer->id",
            "name" => "required|min:3|max:50",
            "service" => "required|max:50"
        ]);
        if ($validator->fails()) {
            return response()->json(['status' => 422, 'errors' => $validator->messages()]);
        }
        $input = $request;
        $credentials = $input["credentials"];
        unset($input["credentials"]);
        $customer->credentials()->delete();
        foreach ($credentials as $credential) {
            $newCredential = new Credential;
            $newCredential->entity_name = $credential[0];
            $newCredential->login_url = $credential[1];
            $newCredential->username = $credential[2];
            $newCredential->password = $credential[3];
            $newCredential->remarks = $credential[4];
            $customer->credentials()->save($newCredential);
        }
        $customer->update($input->all());
        return response()->json(['status' => 200, 'customer' => $customer]);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Customer  $customer
     * @return \Illuminate\Http\Response
     */
    public function destroy(Customer $customer)
    {
        if ($customer->delete()) {
            return response()->json(["status" => 200]);
        }
    }

    public function destroyMany(Request $request)
    {
        $selectedCustomerIds = $request->selectedCustomerIds;
        $customersToDelete = Customer::whereIn('id', $selectedCustomerIds)->delete();
        return response()->json(['status' => 200, 'customers' => $customersToDelete]);
    }

    public function populateAvailableCustomersForTaskList()
    {
        $availableCustomerIdsAndCodes = Customer::select("id", "code")->get();
        return response()->json(['status' => 200, 'availableCustomerIdsAndCodes' => $availableCustomerIdsAndCodes]);
    }
}
