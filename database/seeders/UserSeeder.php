<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Admin User
        User::create([
            'first_name' => 'Admin',
            'last_name' => 'User',
            'email' => 'admin@boilerparts.com',
            'password' => Hash::make('password123'),
            'phone' => '+8801700000000',
            'user_type' => 'admin',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        // Manager User
        User::create([
            'first_name' => 'Manager',
            'last_name' => 'User',
            'email' => 'manager@boilerparts.com',
            'password' => Hash::make('password123'),
            'phone' => '+8801700000001',
            'user_type' => 'manager',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);
    }
}
