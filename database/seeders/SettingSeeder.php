<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Setting;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            // General Settings - UK
            ['key' => 'site_name', 'value' => 'Heating & Catering Parts UK', 'group' => 'general'],
            ['key' => 'site_tagline', 'value' => 'UK\'s Leading Boiler Spare Parts Supplier', 'group' => 'general'],
            ['key' => 'site_description', 'value' => 'We offer over 20,000 genuine boiler spare parts including PCB, Diverter Valves, Pumps & More for Baxi, Ideal, Vaillant, Worcester and more. Fast UK delivery.', 'group' => 'general'],
            ['key' => 'contact_email', 'value' => 'hi@heatingandcateringparts.com', 'group' => 'general'],
            ['key' => 'contact_phone', 'value' => '01919 338762', 'group' => 'general'], // UK landline format
            ['key' => 'whatsapp_number', 'value' => '+447832156716', 'group' => 'general'], // UK mobile
            ['key' => 'contact_address', 'value' => 'Unit 5, Industrial Estate, Manchester, M12 4QR, United Kingdom', 'group' => 'general'],
            ['key' => 'company_reg_number', 'value' => '12345678', 'group' => 'general'],
            ['key' => 'vat_number', 'value' => 'GB123456789', 'group' => 'general'],

            // UK E-commerce Settings
            ['key' => 'currency', 'value' => 'GBP', 'group' => 'ecommerce'],
            ['key' => 'currency_symbol', 'value' => '£', 'group' => 'ecommerce'],
            ['key' => 'vat_rate', 'value' => '20', 'group' => 'ecommerce'], // UK VAT
            ['key' => 'free_shipping_threshold', 'value' => '50', 'group' => 'ecommerce'], // £50
            ['key' => 'default_shipping_cost', 'value' => '4.95', 'group' => 'ecommerce'], // £4.95
            ['key' => 'express_shipping_cost', 'value' => '9.95', 'group' => 'ecommerce'], // £9.95
            ['key' => 'low_stock_threshold', 'value' => '5', 'group' => 'ecommerce'],
            ['key' => 'timezone', 'value' => 'Europe/London', 'group' => 'ecommerce'],

            // UK Shipping Settings
            ['key' => 'uk_mainland_shipping', 'value' => '4.95', 'group' => 'shipping'],
            ['key' => 'northern_ireland_shipping', 'value' => '9.95', 'group' => 'shipping'],
            ['key' => 'scottish_highlands_shipping', 'value' => '12.95', 'group' => 'shipping'],
            ['key' => 'next_day_delivery', 'value' => '14.95', 'group' => 'shipping'],
            ['key' => 'standard_delivery_days', 'value' => '2-3 working days', 'group' => 'shipping'],

            // Email Settings
            ['key' => 'smtp_host', 'value' => 'smtp.gmail.com', 'group' => 'email'],
            ['key' => 'smtp_port', 'value' => '587', 'group' => 'email'],
            ['key' => 'smtp_username', 'value' => 'info@heatingandcateringparts.com', 'group' => 'email'],
            ['key' => 'from_email', 'value' => 'info@heatingandcateringparts.com', 'group' => 'email'],
            ['key' => 'from_name', 'value' => 'Heating & Catering Parts UK', 'group' => 'email'],

            // Social Media
            ['key' => 'facebook_url', 'value' => 'https://facebook.com/heatingcateringpartsuk', 'group' => 'social'],
            ['key' => 'twitter_url', 'value' => 'https://twitter.com/hcpartsuk', 'group' => 'social'],
            ['key' => 'instagram_url', 'value' => 'https://instagram.com/heatingpartsuk', 'group' => 'social'],
            ['key' => 'linkedin_url', 'value' => 'https://linkedin.com/company/heating-catering-parts-uk', 'group' => 'social'],
            ['key' => 'youtube_url', 'value' => 'https://youtube.com/@heatingpartsuk', 'group' => 'social'],

            // SEO Settings
            ['key' => 'meta_keywords', 'value' => 'boiler parts UK, spare parts, worcester bosch, baxi, ideal, vaillant, PCB, pumps, diverter valves, heating engineer', 'group' => 'seo'],
            ['key' => 'google_analytics_id', 'value' => 'G-XXXXXXXXXX', 'group' => 'seo'],
            ['key' => 'google_search_console', 'value' => 'google-site-verification-code', 'group' => 'seo'],

            // UK Payment Settings
            ['key' => 'payment_methods', 'value' => json_encode(['card', 'paypal', 'bank_transfer', 'klarna']), 'group' => 'payment'],
            ['key' => 'stripe_enabled', 'value' => 'true', 'group' => 'payment'],
            ['key' => 'paypal_enabled', 'value' => 'true', 'group' => 'payment'],
            ['key' => 'klarna_enabled', 'value' => 'true', 'group' => 'payment'],
            ['key' => 'bank_transfer_enabled', 'value' => 'true', 'group' => 'payment'],

            // UK Business Hours
            ['key' => 'business_hours_mon_fri', 'value' => '8:00 AM - 6:00 PM GMT', 'group' => 'business'],
            ['key' => 'business_hours_saturday', 'value' => '9:00 AM - 4:00 PM GMT', 'group' => 'business'],
            ['key' => 'business_hours_sunday', 'value' => 'Closed', 'group' => 'business'],

            // UK Legal
            ['key' => 'terms_conditions_url', 'value' => '/terms-conditions', 'group' => 'legal'],
            ['key' => 'privacy_policy_url', 'value' => '/privacy-policy', 'group' => 'legal'],
            ['key' => 'cookie_policy_url', 'value' => '/cookie-policy', 'group' => 'legal'],
            ['key' => 'returns_policy_url', 'value' => '/returns-policy', 'group' => 'legal'],
        ];

        foreach ($settings as $setting) {
            Setting::create($setting);
        }
    }
}
