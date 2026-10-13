<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class ArcadeTest extends TestCase
{
    public function test_arcade_is_public_and_contains_all_nine_games(): void
    {
        $this->get('/')
            ->assertOk()
            ->assertSee('Pixelclub')
            ->assertSee('lang="nl"', false)
            ->assertSee('data-game="snake"', false)
            ->assertSee('data-game="breakout"', false)
            ->assertSee('data-game="memory"', false)
            ->assertSee('data-game="reaction"', false)
            ->assertSee('data-game="pacman"', false)
            ->assertSee('data-game="tetris"', false)
            ->assertSee('data-game="pong"', false)
            ->assertSee('data-game="invaders"', false)
            ->assertSee('data-game="2048"', false)
            ->assertSee('id="game-dialog"', false);
    }

    public function test_checks_use_the_isolated_mysql_connection(): void
    {
        $this->assertSame('mysql', DB::connection()->getDriverName());
        $this->assertSame($_ENV['TEST_DB_DATABASE'], DB::connection()->getDatabaseName());
        $this->assertSame(1, (int) DB::selectOne('SELECT 1 AS connected')->connected);
    }
}
