# Implementation Checklist - বাকি কাজসমূহ

## ✅ Completed (100% Done)

- [x] Database schema design
- [x] Create 4 new migrations
- [x] Run migrations successfully
- [x] Update ServiceProvider model
- [x] Update ProductService model
- [x] Update Order model
- [x] Create ServiceProviderSchedule model
- [x] Update ServiceManagementController
- [x] Update ServiceProviderAssignmentService
- [x] Create API ServiceController
- [x] Add API routes
- [x] Add admin routes for service management
- [x] Add working hours management
- [x] Add schedule viewing capability
- [x] Add time slot calculation
- [x] Add double booking prevention
- [x] Documentation created

---

## ⏳ Pending Tasks (Frontend UI)

### 1. Admin Panel UI Components

#### A. Service Assignment Page
**File**: `resources/js/Pages/Admin/ServiceManagement/ManageServices.vue`

**Requirements**:
- [ ] Display service provider details (name, category, location)
- [ ] Show all available services (from product_services table)
- [ ] Checkbox/toggle for each service
- [ ] Input field for custom price (optional)
- [ ] Dropdown for experience level (beginner/intermediate/expert)
- [ ] Save button to update assignments
- [ ] Success/error notifications

**API Integration**:
```javascript
// Fetch current assignments
GET /admin/service-management/{id}/services

// Update assignments
PUT /admin/service-management/{id}/services
Body: {
  services: [
    { service_id: 1, custom_price: 500, experience_level: 'expert', is_active: true },
    ...
  ]
}
```

**UI Mock**:
```
Service Provider: John Doe (Installer)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Available Services:
☑ Installation Service
  Custom Price: [৳500] (leave empty for default)
  Experience: [Expert ▾]
  Status: ● Active

☑ Repair Service  
  Custom Price: [    ] (using default ৳300)
  Experience: [Intermediate ▾]
  Status: ● Active

☐ Warranty Extension
  (Not assigned)

[Save Changes]
```

---

#### B. Working Hours Management Page
**File**: `resources/js/Pages/Admin/ServiceManagement/WorkingHours.vue`

**Requirements**:
- [ ] Day-wise working hours editor
- [ ] Enable/disable per day
- [ ] Start time picker per day
- [ ] End time picker per day
- [ ] Service duration input (minutes)
- [ ] Advance booking hours input
- [ ] Save button
- [ ] Visual calendar/schedule view

**API Integration**:
```javascript
PUT /admin/service-management/{id}/working-hours
Body: {
  working_hours: {
    monday: { available: true, start: "09:00", end: "18:00" },
    tuesday: { available: true, start: "09:00", end: "18:00" },
    ...
  },
  working_days: ["monday", "tuesday", "wednesday", ...],
  avg_service_duration: 60,
  min_advance_booking_hours: 24
}
```

**UI Mock**:
```
Working Schedule Setup
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Day         Available    Start Time    End Time
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Monday      ☑           [09:00]       [18:00]
Tuesday     ☑           [09:00]       [18:00]
Wednesday   ☑           [09:00]       [18:00]
Thursday    ☑           [09:00]       [18:00]
Friday      ☑           [09:00]       [18:00]
Saturday    ☑           [10:00]       [16:00]
Sunday      ☐           [  :  ]       [  :  ]

Service Settings
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Average Service Duration: [60] minutes
Minimum Advance Booking:  [24] hours

[Save Settings]
```

---

#### C. Schedule View Page
**File**: `resources/js/Pages/Admin/ServiceManagement/Schedule.vue`

**Requirements**:
- [ ] Calendar view of bookings
- [ ] Date range selector
- [ ] List view of schedules
- [ ] Show order details per booking
- [ ] Status indicators (scheduled/in_progress/completed)
- [ ] Filter by status
- [ ] Export to PDF/Excel (optional)

**API Integration**:
```javascript
GET /admin/service-management/{id}/schedule?start_date=2026-01-01&end_date=2026-01-31
```

**UI Mock**:
```
Schedule for: John Doe
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[< Jan 2026 >]  [List View] [Calendar View]

Date            Time          Order        Status       Customer
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Jan 20, 2026    10:00-11:00   #ORD-123     ⏱ Scheduled  Jane Doe
Jan 20, 2026    14:00-15:00   #ORD-124     ⏱ Scheduled  Bob Smith
Jan 21, 2026    09:00-10:00   #ORD-125     🔄 In Progress Tom Brown
Jan 22, 2026    11:00-12:00   #ORD-126     ✓ Completed  Alice Green
```

---

### 2. Customer Checkout UI Components

#### A. Service Selection Component
**File**: `resources/js/Components/Checkout/ServiceSelection.vue`

**Requirements**:
- [ ] Display available services for cart products
- [ ] Checkbox for each service
- [ ] Show service price
- [ ] Show service description
- [ ] Calculate total service cost
- [ ] Show mandatory services (pre-checked, disabled)
- [ ] Update total amount when services selected

**Props**:
```javascript
props: {
  product: Object,          // Current product
  selectedServices: Array,  // Currently selected service IDs
}

emits: ['update:selectedServices']
```

**API Integration**:
```javascript
// Fetch services for product
GET /api/services/products/{productId}/services

// Calculate cost
POST /api/services/calculate-cost
Body: {
  service_ids: [1, 2],
  product_ids: [10]
}
```

**UI Mock**:
```
Available Services for: Boiler Part XYZ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

☑ Installation Service                    ৳500
  Professional installation by expert
  [Required]

☐ Extended Warranty (1 Year)              ৳200
  Additional 1 year warranty coverage
  [Optional]

☐ Maintenance Package                     ৳300
  3 months free maintenance
  [Optional]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Services Total:                           ৳500
```

---

#### B. Date & Time Selector Component
**File**: `resources/js/Components/Checkout/DateTimeSelector.vue`

**Requirements**:
- [ ] Date picker (minimum 24 hours ahead)
- [ ] Disable past dates
- [ ] Disable unavailable dates
- [ ] Show available time slots for selected date
- [ ] Visual indication of slot availability
- [ ] Show provider info for selected slot
- [ ] Flexible time option

**Props**:
```javascript
props: {
  cityId: Number,
  areaId: Number,
  serviceIds: Array,
  selectedDate: String,
  selectedTime: String,
}

emits: ['update:selectedDate', 'update:selectedTime']
```

**API Integration**:
```javascript
// Check availability
POST /api/services/check-availability
Body: {
  city_id: 1,
  area_id: 5,
  service_ids: [1, 2],
  service_date: "2026-01-20",
  service_time: "10:00"
}

// Get available slots
POST /api/services/available-slots
Body: {
  city_id: 1,
  area_id: 5,
  service_date: "2026-01-20",
  service_ids: [1, 2]
}
```

**UI Mock**:
```
Select Service Date & Time
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Preferred Date: [📅 Jan 20, 2026 ▾]

Available Time Slots:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Morning (8 AM - 12 PM)
○ 09:00 AM - 10:00 AM    Provider: John (★4.5)
○ 10:00 AM - 11:00 AM    Provider: Mike (★4.8)
○ 11:00 AM - 12:00 PM    Provider: John (★4.5)

Afternoon (12 PM - 5 PM)
○ 02:00 PM - 03:00 PM    Provider: Sarah (★4.7)
○ 03:00 PM - 04:00 PM    Provider: Mike (★4.8)

Evening (5 PM - 8 PM)
○ 05:00 PM - 06:00 PM    Provider: John (★4.5)

◉ I'm flexible with timing (Auto-assign best available)

Service Instructions (Optional):
[Textarea for special instructions]
```

---

#### C. Checkout Integration
**File**: `resources/js/Pages/Checkout.vue` (Update existing)

**Requirements**:
- [ ] Add service selection section
- [ ] Add date/time selection section
- [ ] Show service cost in order summary
- [ ] Validate service selection before placing order
- [ ] Submit service data with order

**Order Submission Data**:
```javascript
{
  // ... existing order data
  selected_services: [
    { product_id: 10, service_ids: [1, 2] }
  ],
  preferred_service_date: "2026-01-20",
  preferred_service_time: "10:00",
  service_time_slot: "morning",
  service_instructions: "Please call before arrival"
}
```

---

### 3. Backend Integration Tasks

#### A. Checkout Controller Updates
**File**: `app/Http/Controllers/CheckoutController.php` (or similar)

**Requirements**:
- [ ] Accept service selection data
- [ ] Accept service date/time data
- [ ] Validate service availability
- [ ] Calculate service costs
- [ ] Add service costs to order total
- [ ] Save service data to order_items
- [ ] Trigger auto-assignment after order creation

**Example**:
```php
public function placeOrder(Request $request)
{
    // Validate
    $validated = $request->validate([
        // ... existing validations
        'selected_services' => 'nullable|array',
        'preferred_service_date' => 'nullable|date',
        'preferred_service_time' => 'nullable|date_format:H:i',
        'service_time_slot' => 'nullable|in:morning,afternoon,evening,flexible',
        'service_instructions' => 'nullable|string|max:500',
    ]);

    DB::beginTransaction();
    try {
        // Create order
        $order = Order::create([...]);

        // Save order items with services
        foreach ($cartItems as $item) {
            $orderItem = OrderItem::create([
                // ... item data
                'selected_services' => $item->selected_services,
                'services_total' => $item->services_total,
            ]);
        }

        // Auto-assign service provider
        if ($validated['preferred_service_date']) {
            $assignmentService = app(ServiceProviderAssignmentService::class);
            $provider = $assignmentService->autoAssignServiceProvider($order);
            
            if ($provider) {
                // Success message
            } else {
                // No provider available message
            }
        }

        DB::commit();
        return redirect()->route('order.success');
    } catch (\Exception $e) {
        DB::rollBack();
        return back()->withErrors(['error' => $e->getMessage()]);
    }
}
```

---

## 📋 Testing Checklist

### Admin Panel Testing:
- [ ] Can create service provider
- [ ] Can assign services to provider
- [ ] Can set custom prices per service
- [ ] Can set experience levels
- [ ] Can enable/disable services
- [ ] Can set working hours
- [ ] Can set working days
- [ ] Can view schedule
- [ ] Can see bookings in calendar
- [ ] Can toggle provider status
- [ ] Can verify provider

### Customer Flow Testing:
- [ ] Services show on product page
- [ ] Can select services in cart
- [ ] Service prices add to total
- [ ] Can select service date
- [ ] Available slots show correctly
- [ ] Can select time slot
- [ ] Can add service instructions
- [ ] Order places successfully
- [ ] Service data saves in database
- [ ] Auto-assignment works
- [ ] Provider gets assigned
- [ ] Schedule entry created

### Auto Assignment Testing:
- [ ] Location matching works
- [ ] Service capability matching works
- [ ] Date/time availability works
- [ ] Working hours respected
- [ ] Double booking prevented
- [ ] Rating-based priority works
- [ ] Fallback to city-wide works
- [ ] No provider handling works

---

## 📊 Priority Order

### High Priority (Must Have):
1. ✅ Backend (Complete)
2. ⏳ Admin: Service Assignment UI
3. ⏳ Admin: Working Hours UI
4. ⏳ Checkout: Service Selection UI
5. ⏳ Checkout: Date/Time Selector UI
6. ⏳ Backend: Checkout Integration

### Medium Priority (Should Have):
7. ⏳ Admin: Schedule View UI
8. ⏳ Customer: Provider Details View
9. ⏳ Email notifications for assignments

### Low Priority (Nice to Have):
10. ⏳ Real-time availability updates
11. ⏳ Provider mobile app
12. ⏳ Customer tracking of service status
13. ⏳ Rating system for providers
14. ⏳ Analytics dashboard

---

## 💡 Implementation Tips

### For Frontend Developers:

1. **Use existing Inertia patterns**
   - Look at existing admin pages for reference
   - Follow the same structure and styling

2. **API calls with Axios**
   ```javascript
   import axios from 'axios'
   
   // Example
   const fetchServices = async (productId) => {
     const response = await axios.get(`/api/services/products/${productId}/services`)
     return response.data.services
   }
   ```

3. **Form handling with Inertia**
   ```javascript
   import { useForm } from '@inertiajs/vue3'
   
   const form = useForm({
     services: [],
     working_hours: {},
   })
   
   const submit = () => {
     form.put(route('admin.service-management.services.update', providerId))
   }
   ```

4. **Date/Time pickers**
   - Use VueDatePicker or similar
   - Respect min_advance_booking_hours
   - Disable past dates

5. **Loading states**
   - Show spinners while fetching slots
   - Disable buttons during submission
   - Show success/error messages

---

## 🎯 Success Criteria

System will be considered complete when:

- [x] Backend APIs working 100%
- [ ] Admin can assign services to providers
- [ ] Admin can set working hours
- [ ] Admin can view schedules
- [ ] Customers can select services at checkout
- [ ] Customers can select date/time
- [ ] Orders place successfully with services
- [ ] Auto-assignment works correctly
- [ ] No double booking occurs
- [ ] All tests pass

---

**Current Status**: Backend 100% Complete ✅
**Next Step**: Start with Admin Service Assignment UI 🎨
