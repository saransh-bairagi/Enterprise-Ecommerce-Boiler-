# Shipping Module

## Delhivery Integration

### Endpoints
- **POST** `/shipping/delhivery/create-shipment` — Create a new shipment
- **GET** `/shipping/delhivery/track/:shipmentId` — Track shipment status
- **POST** `/shipping/delhivery/cancel/:shipmentId` — Cancel a shipment
- **GET** `/shipping/delhivery/rates` — Fetch shipping rates
- **POST** `/shipping/delhivery/webhook` — Webhook for shipment updates

### Payloads & Responses
- **Create Shipment**: `{ orderId, pickup: { ... }, delivery: { ... } }`
- **Track Shipment**: Returns real-time status
- **Cancel Shipment**: Returns updated shipment object
- **Rates**: Query params for rate calculation
- **Webhook**: `{ event, shipmentId }`

### Database Schema
- **Shipment**
  - `shipmentId`: String (unique)
  - `orderId`: String
  - `provider`: String
  - `status`: String
  - `pickup`: Object
  - `delivery`: Object
  - `history`: Array of { status, at, details }
  - `createdAt`, `updatedAt`: Date

### Factory Usage
- Use `ShippingFactory(provider)` to get the provider instance.
- Example:
  ```js
  const ShippingFactory = require('./providers/shippingFactory');
  const delhivery = ShippingFactory('DELHIVERY');
  await delhivery.createShipment(...);
  ```

### Error Handling & Retry
- All API calls use retry with exponential backoff.
- Errors are handled with `AppError` and logged.
- All DB operations are atomic using transactions.

### Testing
- Jest tests cover:
  - Shipment creation, tracking, cancellation
  - Error handling & retry
  - Webhook processing
  - Factory switching

---
For more details, see `/shipping/providers/delhivery/` and `/shipping/providers/shippingFactory.js`.