<?php

namespace Sanzgrapher\SwippableNotification;

use Illuminate\Support\ServiceProvider;

class SwippableNotificationServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        // Register views
        $this->loadViewsFrom(__DIR__.'/../resources/views', 'swippable-notification');

        // Publish assets
        $this->publishes([
            __DIR__.'/../resources/dist/init-swippable.js' => public_path('js/sanzgrapher/swippable-notification/init-swippable.js'),
            __DIR__.'/../resources/dist/swippable-notification.css' => public_path('css/sanzgrapher/swippable-notification/swippable-notification-styles.css'),
        ], 'swippable-notification-assets');
    }
}
