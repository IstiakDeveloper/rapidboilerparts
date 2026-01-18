# Admin Panel - Service Management Quick Guide

## 📖 কিভাবে System Setup করবেন

### Step 1: Service Provider Category তৈরি করুন
```
Route: /admin/service-management
- প্রথমে Service Provider Categories থাকতে হবে (installer, technician, electrician etc.)
- Database এ ইতিমধ্যে seeder থেকে কিছু categories আছে
```

### Step 2: Product Services তৈরি করুন
```
Route: /admin/product-services
- এখানে সব available services তৈরি করুন
- উদাহরণ: Installation, Warranty Extension, Repair Service, Maintenance
- প্রতিটি service এর price, type, description দিন
```

### Step 3: Service Provider তৈরি করুন
```
Route: /admin/service-management/create
Basic Information:
- User account select করুন (যে user service provider হবে)
- Category select করুন (Installer, Technician etc.)
- City & Area select করুন
- Business name, contact info দিন
- Service charge (base charge) set করুন
- Max daily orders limit দিন
```

### Step 4: Service Provider কে Services Assign করুন
```
Route: /admin/service-management/{id}/services
এখানে:
- Service Provider কোন কোন services দিতে পারবে সেগুলো select করুন
- প্রতিটি service এর জন্য:
  - Custom price (optional) - নিজস্ব price set করতে পারবেন
  - Experience level - beginner, intermediate, expert
  - Active status - enable/disable করতে পারবেন

উদাহরণ:
Provider "John" can provide:
✓ Installation Service - Expert level - ৳500
✓ Repair Service - Intermediate level - ৳300
✓ Warranty Extension - Beginner level - ৳150
```

### Step 5: Working Hours/Schedule Setup করুন
```
Route: /admin/service-management/{id}/working-hours
Set করুন:
- Working Days: Monday, Tuesday, Wednesday etc.
- Working Hours: প্রতিদিনের start time এবং end time
  Example: Monday 9:00 AM - 6:00 PM
- Service Duration: একটা service এ কত সময় লাগবে (minutes)
  Example: 60 minutes
- Advance Booking: কত ঘণ্টা আগে booking করতে হবে
  Example: 24 hours

উদাহরণ Working Hours:
Monday:    9:00 AM - 6:00 PM  ✓ Available
Tuesday:   9:00 AM - 6:00 PM  ✓ Available
Wednesday: 9:00 AM - 6:00 PM  ✓ Available
Thursday:  9:00 AM - 6:00 PM  ✓ Available
Friday:    9:00 AM - 6:00 PM  ✓ Available
Saturday:  10:00 AM - 4:00 PM ✓ Available
Sunday:    CLOSED             ✗ Not Available
```

## 🎯 Customer Checkout Flow (যা হবে)

### 1. Product Select করবে
Customer তার পছন্দের product cart এ add করবে

### 2. Service Selection (Checkout এ)
```javascript
// Frontend API Call
GET /api/services/products/{productId}/services

// Response এ পাবে:
- Available services for this product
- Service prices
- Service descriptions
```

### 3. Date/Time Selection
```javascript
// Check availability
POST /api/services/check-availability
{
  city_id: 1,
  area_id: 5,
  service_ids: [1, 2],
  service_date: "2026-01-20",
  service_time: "10:00"
}

// Response:
{
  available: true,
  provider_count: 3,
  providers: [...]
}
```

### 4. Get Available Time Slots
```javascript
POST /api/services/available-slots
{
  city_id: 1,
  area_id: 5,
  service_date: "2026-01-20",
  service_ids: [1, 2]
}

// Response:
{
  available_providers: [
    {
      provider: { id: 1, name: "John", rating: 4.5 },
      slots: [
        { start_time: "09:00", end_time: "10:00", formatted: "9:00 AM - 10:00 AM" },
        { start_time: "11:00", end_time: "12:00", formatted: "11:00 AM - 12:00 PM" },
        ...
      ]
    }
  ]
}
```

### 5. Place Order
Order create হলে automatically:
- ✅ Available service provider খুঁজবে
- ✅ Location match করবে (City/Area)
- ✅ Required services দিতে পারে কিনা check করবে
- ✅ Selected date/time এ free আছে কিনা check করবে
- ✅ Working hours এর মধ্যে আছে কিনা check করবে
- ✅ Best match provider কে assign করবে
- ✅ Schedule entry create করবে
- ✅ Provider এর daily order count increase করবে

## 🔍 Admin Panel Features

### View Service Provider Details
```
Route: /admin/service-management/{id}
দেখতে পারবেন:
- Basic information
- Assigned services
- Current schedule
- Order history
- Performance stats
```

### View Schedule
```
Route: /admin/service-management/{id}/schedule
Parameters: start_date, end_date
দেখতে পারবেন:
- Date-wise bookings
- Time slots
- Order details
- Status (scheduled, in_progress, completed)
```

### Quick Actions
```
- Toggle Status: Active/Inactive করা
- Verify Provider: Verified mark দেওয়া
- Reset Daily Orders: Manual reset করা
- Edit Information: সব info update করা
```

## 📊 Database Tables

### New Tables Created:
1. **product_service_service_provider**
   - Links services with providers
   - Custom pricing per provider
   - Experience level tracking

2. **service_provider_schedules**
   - Tracks all bookings
   - Prevents double booking
   - Shows availability

### Updated Tables:
1. **orders**
   - preferred_service_date
   - preferred_service_time
   - service_time_slot
   - service_instructions

2. **service_providers**
   - working_hours (JSON)
   - working_days (JSON)
   - avg_service_duration
   - min_advance_booking_hours

## 🎨 Frontend UI Components Needed

### Admin Panel (Inertia Vue Pages):
```
1. resources/js/Pages/Admin/ServiceManagement/ManageServices.vue
   - Service assignment interface
   - Add/remove services
   - Set custom prices
   - Set experience levels

2. resources/js/Pages/Admin/ServiceManagement/WorkingHours.vue
   - Calendar-like interface
   - Day-wise working hours
   - Enable/disable days
   - Set time slots

3. resources/js/Pages/Admin/ServiceManagement/Schedule.vue
   - Calendar view of bookings
   - Timeline view
   - Booking details
```

### Customer Frontend (Checkout Page):
```
1. ServiceSelectionCard.vue
   - Display available services
   - Checkbox/radio selection
   - Show prices
   - Calculate totals

2. DateTimeSelector.vue
   - Date picker
   - Time slot selector
   - Show available slots
   - Provider info preview

3. ServiceProviderCard.vue
   - Provider details
   - Rating display
   - Available slots
   - Select button
```

## 🔐 API Endpoints Summary

### Public APIs (for frontend):
```
GET  /api/services/products/{id}/services - Get services for product
POST /api/services/check-availability - Check if services available
POST /api/services/available-slots - Get available time slots
GET  /api/services/providers/{id} - Get provider details
POST /api/services/calculate-cost - Calculate service cost
```

### Admin APIs (protected):
```
GET  /admin/service-management/{id}/services - Manage services page
PUT  /admin/service-management/{id}/services - Update services
GET  /admin/service-management/{id}/schedule - Get schedule
PUT  /admin/service-management/{id}/working-hours - Update working hours
```

## ✅ Testing Checklist

### Admin Panel:
- [ ] Create service provider
- [ ] Assign services to provider
- [ ] Set working hours
- [ ] View schedule
- [ ] Edit provider info

### Customer Flow:
- [ ] View services on product page
- [ ] Add product with services to cart
- [ ] Select date/time at checkout
- [ ] See available slots
- [ ] Place order
- [ ] Verify auto-assignment

### Auto Assignment:
- [ ] Location-based matching works
- [ ] Service capability matching works
- [ ] Date/time availability works
- [ ] Working hours respected
- [ ] Schedule created correctly
- [ ] No double booking

---

## 📝 Important Notes

1. **Default Working Days**: Monday-Saturday (can be customized per provider)
2. **Default Working Hours**: 9:00 AM - 6:00 PM (can be customized per day)
3. **Default Service Duration**: 60 minutes
4. **Minimum Advance Booking**: 24 hours
5. **Time Slot Calculation**: Based on service duration and working hours

## 🚀 Next Steps

1. ✅ Backend complete - All models, migrations, controllers done
2. ⏳ Frontend needed - Create Inertia Vue components
3. ⏳ Integration - Connect checkout with assignment service
4. ⏳ Testing - Test complete flow end-to-end
