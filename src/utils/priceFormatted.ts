export const priceFormattedInDollars = (unitAmount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(unitAmount / 100)
}
