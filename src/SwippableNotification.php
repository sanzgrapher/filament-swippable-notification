<?php

namespace Sanzgrapher\SwippableNotification;

use Filament\Contracts\Plugin;
use Filament\Panel;
use Filament\Support\Assets\Css;
use Filament\Support\Assets\Js;
use Filament\Support\Facades\FilamentAsset;

class SwippableNotification implements Plugin
{
    public static function make(): static
    {
        return app(static::class);
    }

    public function register(Panel $panel): void
    {
        // Registration logic
    }

    public function boot(Panel $panel): void
    {
        // Register JavaScript and CSS for swipe-to-close functionality
        // Assets should be published to public folder via: php artisan vendor:publish --provider="Sanzgrapher\\SwippableNotification\\SwippableNotificationServiceProvider"
        FilamentAsset::register([
            Css::make('swippable-notification-styles', public_path('css/sanzgrapher/swippable-notification/swippable-notification-styles.css')),
            Js::make('init-swippable', public_path('js/sanzgrapher/swippable-notification/init-swippable.js')),
        ], package: 'sanzgrapher/swippable-notification');
    }

    public function getId(): string
    {
        return 'swippable-notification';
    }
}
