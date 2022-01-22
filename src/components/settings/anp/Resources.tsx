export const subscriptionsPerTier = (tier: number | undefined) => {
  if (!tier || tier <= 0) {
    return 2
  } else if (tier === 1) {
    return 5
  } else if (tier === 2) {
    return 10
  } else if (tier === 3) {
    return 20
  } else if (tier === 4) {
    return 1000
  }
}
