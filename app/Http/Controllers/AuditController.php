<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use \OwenIt\Auditing\Models\Audit;

class AuditController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input("search");
        $limit = $request->input("limit");
        $page = $request->input("page");
        $orderBy = $request->input("orderBy");
        $order = $request->input("order");
        $toSkip = ($page - 1) * $limit;
        $audits = Audit::with('user');
        if (!is_null($search)) {
            $audits = $audits
                ->where('user_id', 'LIKE', '%' . $search . '%')
                ->orWhere('event', 'LIKE', '%' . $search . '%')
                ->orWhere('auditable_type', 'LIKE', '%' . $search . '%')
                ->orWhere('old_values', 'LIKE', '%' . $search . '%')
                ->orWhere('new_values', 'LIKE', '%' . $search . '%');
        }
        if (!is_null($orderBy)) {
            $audits = $audits
                ->order($orderBy, $order);
        }
        $audits = $audits
            ->skip($toSkip)
            ->take($limit)
            ->get();
        foreach ($audits as $audit) {
            $audit->old_values = json_encode($audit->old_values);
            $audit->new_values = json_encode($audit->new_values);
            $audit["username"] = $audit->user->name;
        }
        return response()->json(['count' => Audit::count(), 'total' => Audit::count(), 'data' => $audits]);
    }

    public function edit(Audit $audit)
    {
        // $audit->old_values = json_encode($audit->old_values);
        // $audit->new_values = json_encode($audit->new_values);
        $audit->old_values = $audit->old_values;
        $audit->new_values = $audit->new_values;
        $audit["username"] = $audit->user->name;
        return response()->json(['status' => 200, 'audit' => $audit]);
    }
}
