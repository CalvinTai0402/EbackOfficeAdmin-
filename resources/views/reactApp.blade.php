<!DOCTYPE html>
<html lang="{{ app()->getLocale() }}">

<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <!-- CSRF Token hehe-->
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>EBAdmin</title>
    <!-- Styles -->
    <link href="{{ asset('css/app.css') }}" rel="stylesheet">

    {{-- File Manager Fonts --}}
    <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.7.0/css/all.css">
    {{-- File Manager Styles --}}
    <link rel="stylesheet" href="{{ asset('vendor/file-manager/css/file-manager.css') }}">
</head>

<body>
    <div id="root"></div>
    <script src="{{ asset('js/app.js') }}"></script>
</body>

</html>
