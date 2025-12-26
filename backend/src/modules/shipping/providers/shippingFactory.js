const DelhiveryService = require('./delhivery/delhivery.service');
// const ShiprocketService = require('./shiprocket/shiprocket.service'); // For future

const ShippingFactory = (provider) => {
  if (provider === 'DELHIVERY') return new DelhiveryService();
  // if (provider === 'SHIPROCKET') return new ShiprocketService();
  throw new Error('Unsupported shipping provider');
};

module.exports = ShippingFactory;