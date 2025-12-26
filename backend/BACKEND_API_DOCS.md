# Backend API Documentation

## Table of Contents
- [Routes](#routes)
- [Request/Response Schemas](#requestresponse-schemas)
- [Feature-to-Module Mapping](#feature-to-module-mapping)
- [Database Models & Relations](#database-models--relations)
- [Schedulers](#schedulers)
- [Assumptions](#assumptions)

---

## Routes

### User & Auth
- `POST /api/v1/auth/register` — Register user
- `POST /api/v1/auth/login` — Login (email/password)
- `POST /api/v1/auth/oauth/google` — Google OAuth
- `POST /api/v1/auth/forgot-password` — Password reset
- `POST /api/v1/auth/verify` — Account verification
- `GET /api/v1/users/me` — Get profile
- `PUT /api/v1/users/me` — Update profile
- `POST /api/v1/auth/mfa/enable` — Enable MFA
- `POST /api/v1/auth/mfa/validate` — Validate MFA
- ...

### Product & Catalog
- `GET /api/v1/products` — List products
- `POST /api/v1/products` — Add product
- `PUT /api/v1/products/:id` — Edit product
- `DELETE /api/v1/products/:id` — Delete product
- `GET /api/v1/catalog/categories` — List categories
- ...

### Cart & Checkout
- `GET /api/v1/cart` — Get cart
- `POST /api/v1/cart/add` — Add item
- `POST /api/v1/cart/remove` — Remove item
- `POST /api/v1/cart/apply-coupon` — Apply coupon
- `POST /api/v1/cart/checkout` — Checkout
- ...

### Order
- `POST /api/v1/orders` — Create order
- `GET /api/v1/orders` — List orders
- `GET /api/v1/orders/:id` — Get order
- `POST /api/v1/orders/cancel` — Cancel order
- ...

### Payment
- `POST /api/v1/payments/initiate` — Initiate payment
- `GET /api/v1/payments/history` — Payment history
- ...

### Shipping
- `POST /api/v1/shipping/create` — Create shipment
- `GET /api/v1/shipping/track/:id` — Track shipment
- ...

### Notification
- `POST /api/v1/notifications/send` — Send notification
- `GET /api/v1/notifications` — List notifications
- ...

### Analytics
- `GET /admin/analytics/dashboard` — Dashboard
- ...

---

## Request/Response Schemas
- All endpoints use JSON request/response.
- Standard response: `{ success: boolean, data: object, message?: string }`
- Error response: `{ success: false, error: string }`

---

## Feature-to-Module Mapping
- User/Auth: `modules/user`, `modules/auth`
- Product: `modules/products`, `modules/catalog`
- Cart: `modules/cart`
- Order: `modules/order`
- Payment: `modules/payment`
- Shipping: `modules/shipping`
- Notification: `modules/notification`
- Analytics: `modules/analytics`
- Coupons/Promo: `modules/coupons`, `modules/promo`
- Returns: `modules/returns`
- Reviews: `modules/reviews`
- Wishlist: `modules/wishlist`
- ...

---

## Database Models & Relations
- User, Product, Order, Cart, Payment, Coupon, Notification, Shipment, Return, Review, Wishlist, etc.
- Relations:
  - User ↔ Orders, Cart, Reviews, Wishlist
  - Product ↔ Reviews, Orders, Inventory
  - Order ↔ Payment, Shipment, Return
  - Cart ↔ User, Products
  - Coupon ↔ Orders, Cart
  - Notification ↔ User
  - ...

---

## Schedulers
- Inventory Sync: every 30 min
- Low Stock Alert: every 6 hours
- Order Processing: every 10 min
- Order Validation: hourly
- Order Cleanup: daily 2 AM
- Payment Sync: every 15 min
- Payment Reconciliation: hourly
- Payment Retry: every 5 min
- Refund Processing: hourly
- Promo/Coupon Expiration: daily at midnight
- Notification Reminders: hourly
- Analytics Update: every 30 min
- Analytics Report: daily 6 AM
- Sales Report: daily 6 AM, weekly Sunday 6 AM
- Health Check: hourly

---

## Assumptions
- All endpoints require authentication unless marked public.
- JWT is used for session management.
- All monetary values are in INR unless specified.
- Email/SMS/Push providers are configured via environment variables.
- Elasticsearch and Redis are required for search and caching.
- All jobs are managed by node-cron and are stateless.
- ...

---

For detailed API, see OpenAPI/Swagger docs or code comments in each module.
