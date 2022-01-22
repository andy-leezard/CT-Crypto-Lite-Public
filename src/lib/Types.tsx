export type ServerSide = {
  currentVersion: number
  r_interval: number
  r_interval_g: number
  f_c_render: boolean
  maintenance: boolean
}

export type UserSnapshot = {
  vip: boolean
  fav: string[]
  pin: string
  pnldate: string | number
  adblock: boolean
  referrals: string[]
  requirePIN: boolean
  seed: number
  totalbuyin: number
  totalbuyin_const: number
  username: string

  bullish_index?: number
  override?: boolean
  platform?: string
  lastActivity?: string
  referral_code?: string
  referral?: string
  reward_acc?: number
  times_watched_ads?: number
  push_notif_tokens?: string[]
  push_notif_tokens_unsubscribed?: string[]
  custom_profile_image?: string //uri
  status_msg?: string
}

export type Rewards = {
  /**
   * numbers are probabilities
   */
  _1: number
  _2: number
  _7: number
  _20: number
  _70: number
}

export type AD_controller = {
  testAD_video: boolean
  testAD_banner: boolean
  globalAdBlock: boolean
  rewards: Rewards
}

export type CT_Wallet = {
  // Client-side
  id: string // coin (document) name
  // Server-side
  appre: number
  avg_price: number //average purchase price
  quantity: number
  symbol: string
  // Extended in Portfolio analysis
  appreciation?: number
  img?: string
  crntPrice?: number
  name?: string
  rank?: number
  url?: string
}

export type Coin_Asso = {
  id: string
  index: number
  img: string
  quantity: number
  crntPrice: number
  name: string
  rank: number
  avg_price: number
  url: string
  appreciation?: number
}

export type TotalPortfolio = {
  piedata: any[]
  associatedData: Coin_Asso[]
  totalAppreciation: number
  pnl: number
  pnl_const: number
  delisted: CT_Wallet[]
}

export type Coin = {
  current_price: number
  id: string
  image: string
  name: string
  symbol: string
  market_cap_rank: number

  ath?: number
  ath_change_percentage?: number
  ath_date?: string
  atl?: number
  atl_change_percentage?: number
  atl_date?: string
  circulating_supply?: number
  fully_diluted_valuation?: number
  high_24h?: number
  last_updated?: string
  low_24h?: number
  market_cap?: number
  market_cap_change_24h?: number
  market_cap_change_percentage_24h?: number
  max_supply?: number
  price_change_24h?: number
  price_change_percentage_24h?: number
  total_supply?: number
  total_volume?: number
  roi?: any
  price_change_percentage_14d_in_currency?: number
  price_change_percentage_1h_in_currency?: number
  price_change_percentage_1y_in_currency?: number
  price_change_percentage_200d_in_currency?: number
  price_change_percentage_30d_in_currency?: number
  price_change_percentage_7d_in_currency?: number
}

export type PieData = {
  name: string
  dominance: number
  legendFontColor: string
  legendFontSize: number
  color?: string
}

//prices
export enum ViewMode {
  PRICES = "Prices",
  TOPMOVERS = "24H",
  CAPS = "Market Cap",
}

export enum ModalTarget {
  USERNAME = "username",
  PIN = "pin",
  PROFILE = "picture",
  STATUS = "status",
}

export enum ModalTarget_Friends {
  USERNAME = "username",
  PROFILE = "picture",
  STATUS = "status",
  ADDFRIENDS = "addfriends",
}
export enum ModalTarget_Settings {
  USERNAME = "username",
  PIN = "pin",
  PROFILE = "picture",
  STATUS = "status",
}
