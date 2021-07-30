<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateCustomerRequest;
use App\Models\Customer;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $search    = $request->input("search");
        $limit     = $request->input("limit");
        $page      = $request->input("page");
        $orderBy   = $request->input("orderBy");
        $order     = $request->input("order");
        $toSkip    = ($page - 1) * $limit;
        $customers = Customer::code($search)
                             ->name($search)
                             ->service($search)
                             ->order($orderBy, $order)
                             ->skipPage($toSkip)
                             ->take($limit)
                             ->get();
        return response()->json(['count' => Customer::count(), 'total' => Customer::count(), 'data' => $customers]);
    }

    public function store(CreateCustomerRequest $request)
    {
        $customer = Customer::create($request->except('credentials'));

        $request->input('credentials')->each(fn($credential) => $customer->credentials()->create([
            'entity_name' => $credential[0],
            'login_url'   => $credential[1],
            'username'    => $credential[2],
            'password'    => $credential[3],
            'remarks'     => $credential[4],
        ]));

        return response()->json(['status' => 200, 'customer' => $customer]);
    }

    public function edit(Customer $customer)
    {
        return response()->json(['status' => 200, 'customer' => $customer]);
    }

    public function update(CreateCustomerRequest $request, Customer $customer)
    {
        $customer->update($request->except('credentials'));
        $customer->credentials()->delete();

        $request->input('credentials')->each(fn($credential) => $customer->credentials()->create([
            'entity_name' => $credential[0],
            'login_url'   => $credential[1],
            'username'    => $credential[2],
            'password'    => $credential[3],
            'remarks'     => $credential[4],
        ]));
        return response()->json(['status' => 200, 'customer' => $customer]);
    }

    public function destroy(Customer $customer)
    {
        if ($customer->delete()) {
            return response()->json(["status" => 200]);
        }
    }

    public function destroyMany(Request $request)
    {
        $selectedCustomerIds = $request->selectedCustomerIds;
        $customersToDelete   = Customer::whereIn('id', $selectedCustomerIds)->delete();
        return response()->json(['status' => 200, 'customers' => $customersToDelete]);
    }

    public function populateAvailableCustomersForTaskList()
    {
        $availableCustomerDetails = Customer::select("id", "code", "name", "remark")->get();
        return response()->json(['status' => 200, 'availableCustomerDetails' => $availableCustomerDetails]);
    }
}
