export const PharmaNetOrgs = Object.freeze({
  manufacturer: 'manufacturerMSP',
  distributor: 'distributorMSP',
  retailer: 'retailerMSP',
  transporter: 'transporterMSP',
  consumer: 'consumerMSP'
});

export const PharmaNetRoles = Object.freeze({
  Manufacturer: 1,
  Distributor: 2,
  Retailer: 3,
  Transporter: null //No hierarchy key for transporters
});

export const ShipmentStatus = Object.freeze({
  inTransit: 'in-transit', 
  delivered: 'delivered'
});