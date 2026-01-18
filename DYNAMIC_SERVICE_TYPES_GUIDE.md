# Dynamic Service Types Implementation

## কি পরিবর্তন করা হয়েছে (What has been changed)

### 1. Database Changes
- নতুন `service_types` টেবিল তৈরি করা হয়েছে
- `product_services` টেবিলে `service_type_id` ফরেন কি যোগ করা হয়েছে

### 2. Model Updates
- `ServiceType` মডেল তৈরি করা হয়েছে
- `ProductService` মডেলে `serviceType` relationship যোগ করা হয়েছে

### 3. Controller Updates
- `ServiceTypeController` তৈরি করা হয়েছে (API endpoints)
- `ProductServiceController` আপডেট করা হয়েছে dynamic types support করার জন্য

### 4. Frontend Changes
- Create.tsx page এ modal যোগ করা হয়েছে
- নতুন service type তৈরি করার সুবিধা যোগ করা হয়েছে
- Dynamic service types লোড হবে database থেকে

## Setup Instructions

### Step 1: Run Migrations
```bash
php artisan migrate
```

### Step 2: Seed Initial Service Types
```bash
php artisan db:seed --class=ServiceTypeSeeder
```

এটি নিম্নলিখিত default service types তৈরি করবে:
- Setup Service
- Delivery Service
- Installation Service
- Maintenance Service
- Other Service

### Step 3: Clear Cache (Optional but recommended)
```bash
php artisan cache:clear
php artisan config:clear
php artisan route:clear
```

## কিভাবে ব্যবহার করবেন (How to Use)

### Admin Panel থেকে:

1. **Product Service তৈরি করার সময়:**
   - "Service Type" সেকশনে যান
   - বিদ্যমান type গুলো থেকে select করুন
   - অথবা "Add New Type" বাটনে ক্লিক করুন

2. **নতুন Service Type তৈরি করতে:**
   - "Add New Type" বাটনে ক্লিক করুন
   - Modal খুলবে
   - Name, Description, Color এবং Sort Order দিন
   - "Create Type" বাটনে ক্লিক করুন
   - নতুন type তৈরি হয়ে automatically select হবে

### Features:

✅ **Dynamic Types:** Database থেকে service types load হবে
✅ **Modal Creation:** Page reload ছাড়াই নতুন type তৈরি করা যাবে
✅ **Auto-Selection:** নতুন type তৈরি হলে automatically select হবে
✅ **Color Themes:** 9টি different color theme থেকে choose করা যাবে
✅ **Validation:** সব input validation করা আছে
✅ **Real-time Updates:** নতুন type তৈরি হলে সাথে সাথে list এ আসবে

## API Endpoints

```
GET    /api/admin/service-types        - Get all service types
POST   /api/admin/service-types        - Create new service type
PUT    /api/admin/service-types/{id}   - Update service type
DELETE /api/admin/service-types/{id}   - Delete service type
```

## Database Schema

### service_types table:
- id
- name
- slug
- description
- color
- sort_order
- is_active
- created_at
- updated_at

### product_services table (updated):
- ... (existing columns)
- service_type_id (foreign key)

## Notes

- Service types শুধু active users দেখতে পারবে (auth:sanctum middleware)
- যদি কোনো service type ব্যবহার করা হয়ে থাকে, তাহলে delete করা যাবে না
- সব service types alphabetically এবং sort_order অনুযায়ী sort হবে
