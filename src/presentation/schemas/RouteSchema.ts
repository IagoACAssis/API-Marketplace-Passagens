export const createRouteSchema = {
  body: {
    type: 'object',
    required: [
      'origin',
      'originCountry',
      'originType',
      'destination',
      'destinationCountry',
      'destinationType',
      'departureTime',
      'arrivalTime',
      'price',
      'type',
      'totalSeats'
    ],
    properties: {
      origin: { type: 'string' },
      originState: { type: 'string' },
      originCountry: { type: 'string' },
      originType: { type: 'string', enum: ['city', 'airport', 'station'] },
      destination: { type: 'string' },
      destinationState: { type: 'string' },
      destinationCountry: { type: 'string' },
      destinationType: { type: 'string', enum: ['city', 'airport', 'station'] },
      departureTime: { type: 'string', format: 'date-time' },
      arrivalTime: { type: 'string', format: 'date-time' },
      price: { type: 'number', minimum: 0 },
      type: { type: 'string', enum: ['bus', 'train', 'plane'] },
      totalSeats: { type: 'integer', minimum: 1 },
      amenities: { 
        type: 'array', 
        items: { type: 'string' } 
      },
      active: { type: 'boolean' }
    },
    additionalProperties: false
  }
}; 