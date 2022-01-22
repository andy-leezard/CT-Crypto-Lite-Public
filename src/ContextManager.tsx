import React from "react"
import { User } from "@firebase/auth-types"
import { APP_ACTIONTYPE, COIN_ACTIONTYPE } from "./lib/Reducers"
import { AD_controller, Coin, CT_Wallet, ServerSide, TotalPortfolio, UserSnapshot } from "./lib/Types"

export interface GlobalContextInterface {
  auth: {
    user: User | null
    userEmail: string | null
  }
  env: {
    screenWidth: number
    screenHeight: number
    darkmode: boolean | null
    lang: string
    isTablet: boolean | null
    trackingPermitted: boolean | null
    notification: {
      tokenID: string | null
      subscribed: boolean
    }
  }
  serverSide: ServerSide
}

export interface GlobalContextInterfaceAsReducer {
  state: GlobalContextInterface
  dispatch: (param: APP_ACTIONTYPE) => void
}
export interface MainContextInterface {
  rerender: React.Dispatch<React.SetStateAction<boolean>>
  extend: () => void
  reload: (all: boolean) => void
  adEnv: AD_controller
  user: UserSnapshot
  adBlock: boolean
  rewardedVideoIsTestID: boolean
  fetching: boolean
  coindata: Coin[]
  postdata: CT_Wallet[]
  changedata: any
  topInset: number
  bottomInset: number
  banner_ad_height: number
  tab_bar_height: number
  rewarded_ad_available: boolean
  update_rewarded_ad_state: React.Dispatch<React.SetStateAction<boolean>>
  show_rewarded_ad_alert: (message_reward: string | number) => void
  show_rewarded_ad_error_message: () => void
  show_ad: () => void
}
export interface TradingContextInterfaceAsReducer {
  state: Coin | null
  dispatch: (param: COIN_ACTIONTYPE) => void
}

export const GlobalContext = React.createContext<GlobalContextInterface | GlobalContextInterfaceAsReducer | null>(null)
export const MainContext = React.createContext<MainContextInterface | null>(null)
export const PortfolioContext = React.createContext<{ portfolio: TotalPortfolio } | null>(null)
export const TradingContext = React.createContext<TradingContextInterfaceAsReducer | null>(null)
