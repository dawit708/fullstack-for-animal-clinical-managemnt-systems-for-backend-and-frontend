// utils/pharmacyStatus.js
export const rxStatusColor = (status) => ({
  pending:   'blue',
  checking:  'amber',
  ready:     'green',
  dispensed: 'gray',
  cancelled: 'red',
}[status] || 'gray');

export const stockStatusColor = (status) => ({
  ok:           'green',
  low:          'amber',
  critical:     'red',
  out_of_stock: 'red',
  expiring:     'amber',
  expiring_soon:'amber',
}[status] || 'gray');

export const alertTypeColor = (type) => ({
  critical_stock: 'red',
  low_stock:      'amber',
  expiring:       'amber',
  expired:        'red',
}[type] || 'gray');

export const poStatusColor = (status) => ({
  pending:   'amber',
  approved:  'blue',
  ordered:   'purple',
  received:  'green',
  cancelled: 'red',
}[status] || 'gray');