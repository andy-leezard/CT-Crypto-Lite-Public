import { Dimensions } from "react-native"
import * as Env from "../env.json"
import { ServerSide, Coin } from "./Types"
import { GlobalContextInterface } from "../ContextManager"
import { User } from "@firebase/auth-types"

export enum Enum_app_actions {
  SET_USER = "setUser",
  SET_USEREMAIL = "setUserEmail",
  SET_LANG = "setLang",
  SET_TABLET_MODE = "setTabletMode",
  SET_THEME = "setTheme",
  SET_NOTIF_TOKEN = "setNotifToken",
  SET_NOTIF_SUBSCRIBED = "setNotifSubs",
  PERMIT_TRACKING = "permitTracking",
  SYNCHRONIZE = "synchronize", // synchronize the global environment with the server
}

export enum Enum_main_actions {
  SET_USERNAME = "setUsername",
  SET_REQUIRE_PIN = "setRequirePIN",
  SET_VIP = "setVIP",
  SET_ADBLOCK = "setADBlock",
  SET_AD_ID = "setAdID", // banner and rewarded videos
}

export enum Enum_coin_actions {
  SET = "setCoin",
  INIT = "initialize",
}

export const app_reducer_init: GlobalContextInterface = {
  auth: {
    user: null,
    userEmail: null,
  },
  env: {
    darkmode: null,
    lang: "",
    isTablet: null,
    screenWidth: Dimensions.get("window").width,
    screenHeight: Dimensions.get("window").height,
    trackingPermitted: null,
    notification: {
      tokenID: null,
      subscribed: false,
    },
  },
  serverSide: {
    currentVersion: Env.currentVersion_incremental,
    r_interval: Env.default_RI,
    r_interval_g: Env.default_RIG,
    f_c_render: false,
    maintenance: false,
  },
}

export const fallback_serverside_variables = {
  currentVersion: 1,
  r_interval: Env.default_RI,
  r_interval_g: Env.default_RIG,
  f_c_render: true,
  maintenance: false,
}

export type APP_ACTIONTYPE =
  | { type: Enum_app_actions.SET_USER; payload: User | null }
  | { type: Enum_app_actions.SET_USEREMAIL; payload: string | null }
  | { type: Enum_app_actions.SET_LANG; payload: string }
  | { type: Enum_app_actions.SET_THEME; payload: boolean }
  | { type: Enum_app_actions.SET_TABLET_MODE; payload: boolean }
  | { type: Enum_app_actions.SET_NOTIF_TOKEN; payload: { tokenID: string | null; subscribed: boolean } }
  | { type: Enum_app_actions.SET_NOTIF_SUBSCRIBED; payload: boolean }
  | { type: Enum_app_actions.PERMIT_TRACKING; payload: boolean }
  | { type: Enum_app_actions.SYNCHRONIZE; payload: ServerSide }

export const app_reducer = (state: GlobalContextInterface, action: APP_ACTIONTYPE) => {
  let _state = { ...state }
  switch (action.type) {
    case Enum_app_actions.SET_USER:
      _state.auth.user = action.payload
      return _state
    case Enum_app_actions.SET_USEREMAIL:
      _state.auth.userEmail = action.payload
      return _state
    case Enum_app_actions.SET_LANG:
      _state.env.lang = action.payload
      return _state
    case Enum_app_actions.SET_THEME:
      _state.env.darkmode = action.payload
      return _state
    case Enum_app_actions.SET_TABLET_MODE:
      _state.env.isTablet = action.payload
      return _state
    case Enum_app_actions.SET_NOTIF_TOKEN:
      _state.env.notification = action.payload
      return _state
    case Enum_app_actions.SET_NOTIF_SUBSCRIBED:
      _state.env.notification.subscribed = action.payload
      return _state
    case Enum_app_actions.PERMIT_TRACKING:
      _state.env.trackingPermitted = action.payload
      return _state
    case Enum_app_actions.SYNCHRONIZE:
      _state.serverSide = action.payload
      return _state
    default:
      return state
  }
}

export type COIN_ACTIONTYPE = { type: Enum_coin_actions.SET; payload: Coin } | { type: Enum_coin_actions.INIT }

export const coin_reducer = (state: Coin | null, action: COIN_ACTIONTYPE) => {
  switch (action.type) {
    case Enum_coin_actions.SET:
      return action.payload
    case Enum_coin_actions.INIT:
      return null
    default:
      return state
  }
}
