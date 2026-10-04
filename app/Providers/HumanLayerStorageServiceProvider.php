<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class HumanLayerStorageServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        foreach (['private', 'public'] as $visibility) {
            config(['filesystems.disks.uploads_'.$visibility => config('humanlayer_storage.'.$visibility)]);
        }
    }
}
