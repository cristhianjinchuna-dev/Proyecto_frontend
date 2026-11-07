const priceFormatter = new Intl.NumberFormat('es-PE', {
  style: 'currency',
  currency: 'PEN',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});


export function formatPrice(value: number): string {
  return priceFormatter.format(value); // S/ 850
}

export function formatArea(value: number | null | undefined): string {
  return value == null ? 'Área no indicada' : `${value} m²`;
}