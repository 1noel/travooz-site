# Protected Features Implementation

## Overview

Authentication-based feature protection has been implemented. Users must sign in to access certain features.

## What Was Implemented

### 1. ✅ Protected Routes

- Cart page now requires authentication
- Users are redirected to sign-in if they try to access without login
- After login, they're redirected back to where they were trying to go

### 2. ✅ Protected Cart Access in Header

- **When NOT logged in:**
  - Cart shows lock icon 🔒
  - Clicking opens sign-in page
  - Shows "Sign in required" tooltip
- **When logged in:**
  - Cart shows item count
  - Clicking goes to cart page
  - Full cart functionality available

### 3. ✅ User Display in Header

- **When NOT logged in:**
  - Shows "Register" and "Sign in" buttons
- **When logged in:**
  - Shows user name
  - Shows "Client account" label
  - Shows "Sign out" button
  - Sign out clears session and returns to home

### 4. ✅ Reusable Components Created

**ProtectedRoute Component** (`src/components/ProtectedRoute.jsx`)

- Wraps routes that require authentication
- Automatically redirects to sign-in
- Preserves intended destination

**AuthPrompt Component** (`src/components/AuthPrompt.jsx`)

- Beautiful modal for authentication prompts
- Shows when user tries protected action
- Options: Cancel, Sign In, Register

**useAuthCheck Hook** (`src/hooks/useAuthCheck.js`)

- Easy authentication checking
- Automatic prompt display
- Reusable across all pages

## How to Use

### Protecting a Route

```jsx
import ProtectedRoute from "./components/ProtectedRoute";

// In your Routes
<Route
  path="/cart"
  element={
    <ProtectedRoute>
      <Cart />
    </ProtectedRoute>
  }
/>;
```

### Protecting a Feature/Button

#### Method 1: Using the useAuthCheck Hook

```jsx
import { useAuthCheck } from "../hooks/useAuthCheck";
import AuthPrompt from "../components/AuthPrompt";

function MyComponent() {
  const { checkAuth, showAuthPrompt, closeAuthPrompt, authPromptMessage } =
    useAuthCheck();

  const handleBooking = () => {
    // Check if authenticated before proceeding
    if (!checkAuth("You need to sign in to make a booking.")) {
      return; // Stops execution, shows auth prompt
    }

    // Continue with booking logic
    // This only runs if user is authenticated
    proceedWithBooking();
  };

  return (
    <>
      <button onClick={handleBooking}>Book Now</button>

      {/* Add the auth prompt component */}
      <AuthPrompt
        isOpen={showAuthPrompt}
        onClose={closeAuthPrompt}
        message={authPromptMessage}
      />
    </>
  );
}
```

#### Method 2: Direct Authentication Check

```jsx
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";

function MyComponent() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      // Show toast or alert
      showToast("error", "Please sign in to add items to cart");
      // Redirect to login
      navigate("/sign-in");
      return;
    }

    // Proceed with add to cart
    addItemToCart();
  };

  return <button onClick={handleAddToCart}>Add to Cart</button>;
}
```

## Features to Protect

### 🔴 High Priority (Already Protected)

- ✅ Cart page access
- ✅ Cart link in header

### 🟡 Medium Priority (Recommended to Protect)

These should show AuthPrompt when clicked without login:

1. **Hotel Booking**
   - File: `src/pages/hotels/HotelDetails.jsx`
   - Button: "Book Room" or "Add to Cart"
2. **Restaurant Reservation**
   - File: `src/pages/EatingOut/EatingDeatils.jsx`
   - Button: "Reserve a Table"
3. **Activity Booking**
   - File: `src/pages/Activities/ActivityDetails.jsx`
   - Button: "Book Activity"
4. **Tour Package Booking**
   - File: `src/pages/TourPackages/TourPackageDetails.jsx`
   - Button: "Book Now"
5. **Car Rental**
   - File: `src/pages/Cars/CarDetails.jsx`
   - Button: "Book Now"

### 🟢 Low Priority (Optional)

- Wishlist/Favorites
- Reviews/Ratings
- User profile

## Example Implementation for Hotel Booking

Let me show you how to protect the hotel booking:

```jsx
// In HotelDetails.jsx
import { useAuthCheck } from "../../hooks/useAuthCheck";
import AuthPrompt from "../../components/AuthPrompt";

function HotelDetails() {
  const { checkAuth, showAuthPrompt, closeAuthPrompt, authPromptMessage } =
    useAuthCheck();

  const handleBookRoom = () => {
    // Check authentication first
    if (
      !checkAuth(
        "Sign in to book this hotel room and manage your reservations."
      )
    ) {
      return;
    }

    // Proceed with booking
    // ... existing booking logic
  };

  return (
    <>
      {/* Your existing JSX */}
      <button onClick={handleBookRoom}>Book Room</button>

      {/* Add auth prompt at the bottom */}
      <AuthPrompt
        isOpen={showAuthPrompt}
        onClose={closeAuthPrompt}
        message={authPromptMessage}
      />
    </>
  );
}
```

## Testing

### Test Protected Features

1. **Test Without Login:**

   ```
   - Open app (make sure you're logged out)
   - Try to click "Cart" in header
   - Should redirect to /sign-in
   - Try to access /cart directly
   - Should redirect to /sign-in
   ```

2. **Test With Login:**

   ```
   - Sign in with credentials
   - Cart should show normally
   - Cart link should work
   - Should see user name in header
   - Should see "Sign out" button
   ```

3. **Test Sign Out:**
   ```
   - Click "Sign out"
   - Should return to home page
   - Cart should show lock icon again
   - Should see "Register" and "Sign in" buttons
   ```

## User Flow

### Scenario 1: User tries to book without login

```
User clicks "Book Now"
  ↓
System checks: isAuthenticated?
  ↓ NO
Shows AuthPrompt modal
  ↓
User clicks "Sign In"
  ↓
Redirects to /sign-in page
  ↓
User logs in
  ↓
Returns to booking page
  ↓
User completes booking
```

### Scenario 2: User tries to access cart without login

```
User clicks "Cart" in header
  ↓
System checks: isAuthenticated?
  ↓ NO
Redirects to /sign-in
  ↓
Saves intended destination (/cart)
  ↓
User logs in
  ↓
Automatically redirects to /cart
  ↓
User sees their cart
```

## Customization

### Custom Auth Prompt Message

Different messages for different actions:

```jsx
// For booking
checkAuth("Sign in to book this hotel and manage your reservations.");

// For cart
checkAuth("Sign in to add items to your cart and checkout.");

// For wishlist
checkAuth("Sign in to save your favorite places and hotels.");

// For reviews
checkAuth("Sign in to write reviews and share your experiences.");
```

### Styling

The AuthPrompt component uses Tailwind CSS and can be customized:

- Colors: Change `bg-green-500` to your brand color
- Size: Adjust `max-w-md` for width
- Animation: Modify `animate-fade-in` class

## API Integration

When making API calls for bookings, include the auth token:

```jsx
import { useAuth } from "../context/useAuth";

function MyComponent() {
  const { token } = useAuth();

  const makeBooking = async (bookingData) => {
    const response = await fetch(`${API_BASE_URL}/api/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Include token
      },
      body: JSON.stringify(bookingData),
    });

    return await response.json();
  };
}
```

## Current Status

✅ **Implemented:**

- Protected route for cart
- Header shows user status
- Sign in/out functionality
- Cart access control in header
- ProtectedRoute component
- AuthPrompt component
- useAuthCheck hook

⏳ **Next Steps (For You):**

1. Add authentication checks to booking buttons
2. Use AuthPrompt in detail pages
3. Test all protected features
4. Customize prompt messages for each feature

## Files Modified

1. **src/App.jsx** - Added ProtectedRoute to cart
2. **src/components/Header.jsx** - Added auth-based cart access
3. **src/components/ProtectedRoute.jsx** - NEW: Route protection
4. **src/components/AuthPrompt.jsx** - NEW: Auth prompt modal
5. **src/hooks/useAuthCheck.js** - NEW: Auth checking hook

## Benefits

✨ **User Experience:**

- Clear indication of what requires sign-in
- Smooth redirect flow
- Returns to intended page after login
- Beautiful, professional prompts

🔒 **Security:**

- Protected routes can't be accessed directly
- Token-based authentication
- Automatic logout functionality
- Session persistence

⚡ **Developer Experience:**

- Reusable components
- Simple hook-based API
- Easy to add protection anywhere
- Consistent behavior across app

---

**Everything is set up and ready!** You can now protect any feature by using the `useAuthCheck` hook and showing the `AuthPrompt` component. The cart is already fully protected as an example. 🎉
