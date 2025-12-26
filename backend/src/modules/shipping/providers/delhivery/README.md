# Delhivery Shipping Provider

## Overview
This module provides Delhivery shipping integration for the e-commerce backend, supporting shipment creation, tracking, cancellation, rate fetching, and webhook handling. It is designed for extensibility using a factory pattern for multiple providers.

## Structure
- `delhivery.service.js`: Business logic, API calls, retry, atomicity
- `delhivery.dao.js`: DB operations (atomic, transactional)
- `delhivery.controller.js`: API endpoints
- `delhivery.constants.js`: API URLs, statuses
- `delhivery.middleware.js`: Validation
- `delhivery.route.js`: Express routes

## Usage
- Use `ShippingFactory('DELHIVERY')` to get the service instance.
- All async ops use `catchAsync` and throw `AppError` on error.

## Endpoints
- POST `/shipping/delhivery/create-shipment`
- GET `/shipping/delhivery/track/:shipmentId`
- POST `/shipping/delhivery/cancel/:shipmentId`
- GET `/shipping/delhivery/rates`
- POST `/shipping/delhivery/webhook`

## DB Schema
See `models/shipment.model.js` for details.

## Testing
Run Jest tests in `delhivery.test.js` for all features and error handling.

## Extending
Add new providers by implementing a similar structure and updating `shippingFactory.js`.
