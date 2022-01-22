import AsyncStorage from "@react-native-async-storage/async-storage"
import I18n from "i18n-js"
import { Coin, Coin_Asso, CT_Wallet, TotalPortfolio, PieData } from "./Types"
import Env from "../env.json"
import { textColor } from "./StyleLib"
import stablecoins from "../stablecoins.json"
import { Alert, Platform } from "react-native"
import * as Notifications from "expo-notifications"
import { db, strg } from "../../firebase"
import * as ImagePicker from "expo-image-picker"
import * as Linking from "expo-linking"
import { MainContextInterface } from "../ContextManager"
import axios from "axios"
import * as StoreReview from "expo-store-review"
import { manipulateAsync, SaveFormat } from "expo-image-manipulator"

export const storeLanguage = async (langCode: any): Promise<void> => {
  try {
    await AsyncStorage.setItem("language", langCode)
    I18n.locale = langCode
  } catch (e) {
    I18n.locale = "en-US"
  }
}

export const isInList = (arr: string[], name: string): boolean => {
  return arr.some((item) => item === name)
}

export const isStableCoin = (id: string) => {
  /**
   * @param {string} id name or symbol
   */
  return Boolean(
    stablecoins.some((item) => item.name === id) ||
      stablecoins.some((item) => item.symbol === id.toLowerCase())
  )
}

export const isValidEmailAddress = (address: string): boolean => {
  return !!address.match(/.+@.+/)
}

export const isEnglishAlphabetOrNumber = (str: string): boolean => {
  return /^[a-zA-Z\d]+$/.test(str)
}

export const isNumber = (i: string): boolean => {
  return /^\d+$/.test(i)
}

export const isEmailConstructor = (str: string): boolean => {
  return Boolean(
    isEnglishAlphabetOrNumber(str) ||
      str.includes(".") ||
      str.includes("@") ||
      str.includes("-") ||
      str.includes("_")
  )
}

export const returnPNL = (totaloutput: number, totalinput: number): number => {
  if (totalinput <= 0) {
    return 0
  }
  let ratio = totaloutput / totalinput - 1
  ratio = Math.round(ratio * 10000) / 100
  return ratio
}

export const dynamicRound = (i: number, j: number): number => {
  return Math.round(i * Math.pow(10, j)) / Math.pow(10, j)
}

export const fastRound = (i: number): number => {
  return Math.round(i * 100) / 100
}

export const addZeroes = (num: number): string => {
  /**
   * show unconditionally 2 decimals at least
   */
  return num.toFixed(Math.max(((num + "").split(".")[1] || "").length, 2))
}

export const determineDecimals = (i: number) => {
  if (Math.abs(i) <= 10) {
    if (Math.abs(i) <= 0.000001) {
      return 11
    } else if (Math.abs(i) <= 0.00001) {
      return 9
    } else if (Math.abs(i) <= 0.001) {
      return 8
    } else if (Math.abs(i) <= 0.01) {
      return 7
    } else if (Math.abs(i) <= 0.1) {
      return 6
    } else if (Math.abs(i) <= 1) {
      return 5
    } else {
      return 4
    }
  } else {
    return 2
  }
}

// Prices.tsx
export const avoidScientificNotation = (i: number): string | number => {
  let x: number | string = i
  if (Math.abs(x) < 1.0) {
    let e = parseInt(x.toString().split("e-")[1])
    if (e) {
      let zeros = new Array(e).join("0")
      x *= Math.pow(10, e - 1)
      x = x.toString().substring(2)
      x = x.substring(0, 16 - zeros.length)
      x = "0." + zeros + x
    }
  }
  return x
}

export const avoidScientificNotation_withSign = (
  i: number
): string | number => {
  let x: number | string = i
  let sign = x > 0 ? "" : "-"
  if (Math.abs(x) < 1.0) {
    let e = parseInt(x.toString().split("e-")[1])
    if (e) {
      let zeros = new Array(e).join("0")
      x *= Math.pow(10, e - 1)
      x = Math.abs(x)
      x = dynamicRound(x, determineDecimals(x))
      x = x.toString().substring(2)
      x = x.substring(0, 16 - zeros.length)
      x = sign + "0." + zeros + x
    } else {
      x = dynamicRound(x, determineDecimals(x))
    }
  } else {
    x = dynamicRound(x, determineDecimals(x))
  }
  return x
}

export const avoidScientificNotation_andRound = (
  i: number
): string | number => {
  let x: number | string = i
  if (Math.abs(x) < 1.0) {
    let e = parseInt(x.toString().split("e-")[1])
    if (e) {
      let zeros = new Array(e).join("0")
      x *= Math.pow(10, e - 1)
      x = dynamicRound(x, determineDecimals(x))
      x = x.toString().substring(2)
      x = x.substring(0, 16 - zeros.length)
      x = "0." + zeros + x
    } else {
      x = dynamicRound(x, determineDecimals(x))
    }
  } else {
    x = dynamicRound(x, determineDecimals(x))
  }
  return x
}

export const autoRound = (i: number) => {
  if (i > 100000) {
    return Math.floor(i)
  } else if (i > 1000) {
    return Math.round(i * Math.pow(10, 2)) / Math.pow(10, 2)
  } else if (i > 100) {
    return Math.round(i * Math.pow(10, 3)) / Math.pow(10, 3)
  } else if (i > 1) {
    return Math.round(i * Math.pow(10, 6)) / Math.pow(10, 6)
  } else {
    return Math.round(i * Math.pow(10, 8)) / Math.pow(10, 8)
  }
}

export const displayVolume = (vol: number): string => {
  if (vol < 1000000000) {
    //less than a billion
    let inmillion = vol / 1000000 // divide by a million
    inmillion = Math.round(inmillion * 100) / 100 // round to 2 decimals
    return "$" + inmillion.toString() + "M"
  } else if (vol < 1000000000000) {
    //less than a trillion
    let inbillion = vol / 1000000000 // divide by a billion
    inbillion = Math.round(inbillion * 100) / 100 // round to 2 decimals
    return "$" + inbillion.toString() + "B"
  } else {
    let intrillion = vol / 1000000000000 // divide by a trillion
    intrillion = Math.round(intrillion * 100) / 100 // round to 2 decimals
    return "$" + intrillion.toString() + "T"
  }
}

export const percentageAsDelta = (i: number): string => {
  const asString = i.toString()
  return i >= 0 ? "+" + asString + "%" : asString + "%"
}

export const numberWithCommas = (i: number): string => {
  if (i < 1000) {
    return i.toString()
  } else {
    let j = i.toString()
    let k = j.split(".")
    let intpart = Number(k[0])
    let intAsString = intpart.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")
    if (k.length > 1) {
      let decimalpart = Number(k[1])
      return intAsString + "." + decimalpart.toString()
    } else {
      return intAsString.toString()
    }
  }
}

export const getCashRatioFromPortfolio = (
  postdata: CT_Wallet[],
  coindata: Coin[],
  seed: number
): number => {
  let totalAppreciation = seed
  for (let i = 0; i < postdata.length; i++) {
    let matchingCrypto = coindata.filter((j) => postdata[i].id === j.name)
    if (matchingCrypto.length > 0) {
      let data = matchingCrypto[0]
      let appreciation = postdata[i].quantity * data.current_price
      totalAppreciation += appreciation
    }
  }
  if (totalAppreciation) {
    return seed / totalAppreciation
  } else {
    if (seed) {
      return 1
    } else {
      return 0
    }
  }
}

export const getBiggestCapsFromPortfolio = (
  postdata: CT_Wallet[],
  coindata: Coin[],
  limit?: number
) => {
  let matchedCryptos: CT_Wallet[] = []
  postdata.forEach((i) => {
    let matchingCrypto = coindata.filter((j) => i.id === j.name)
    if (matchingCrypto.length > 0) {
      let data = matchingCrypto[0]
      let appreciation = i.quantity * data.current_price
      let symb = data.symbol
      matchedCryptos.push({
        ...i,
        appreciation: appreciation,
        symbol: symb.toUpperCase(),
        img: data.image,
        crntPrice: data.current_price,
        name: data.name,
        rank: data.market_cap_rank,
        url: data.id,
      })
    }
  })
  matchedCryptos = matchedCryptos.sort(
    (a, b) => b.appreciation! - a.appreciation!
  )
  if (!limit || matchedCryptos.length > limit) {
    matchedCryptos = matchedCryptos.slice(0, limit)
  }
  return matchedCryptos
}

// portfolio_screen
const sliceColor = [
  "#3684CB",
  "#3FB2AB",
  "#6CD293",
  "#C7F5D6",
  "#CBD5E0",
  "#FFFFFF",
]

export const post_to_portfolio = (
  mainContext: MainContextInterface,
  darkmode: boolean
): TotalPortfolio => {
  const pieSeries = []
  const completeData: CT_Wallet[] = []
  let desc = []
  const delistedData: CT_Wallet[] = []
  let delisted_desc = []
  let thesum = mainContext.user.seed
  mainContext.postdata.forEach((i) => {
    let matchingCrypto = mainContext.coindata.filter((j) => i.id === j.name)
    if (matchingCrypto.length > 0) {
      let data = matchingCrypto[0]
      let subsum = i.quantity * data.current_price
      let symb = data.symbol
      thesum += subsum
      completeData.push({
        ...i,
        appreciation: subsum,
        symbol: symb.toUpperCase(),
        img: data.image,
        crntPrice: data.current_price,
        name: data.name,
        rank: data.market_cap_rank,
        url: data.id,
      })
    } else {
      delistedData.push({
        ...i,
        appreciation: 0,
        symbol: i.symbol,
        img: Env.delistedIcon,
        crntPrice: 0,
        name: i.id,
        rank: 9999,
      })
    }
  })
  completeData.push({
    id: "VUSD",
    symbol: "VUSD",
    name: "VUSD",
    appre: mainContext.user.seed,
    appreciation: mainContext.user.seed,
    avg_price: 1,
    img: Env.fiatCoinIcon,
    crntPrice: 1,
    rank: 9999,
    url: "usdt",
    quantity: mainContext.user.seed,
  })
  delisted_desc = delistedData.sort((a, b) => b.quantity - a.quantity)
  desc = completeData.sort((a, b) => b.appreciation! - a.appreciation!)
  let t = 5
  let etcsum = 0
  for (let j = 0; j < desc.length; j++) {
    if (t > 0) {
      t--
      pieSeries.push({
        name: completeData[j].symbol.toUpperCase(),
        appreciation: completeData[j].appreciation,
        color: sliceColor[4 + t * -1],
        legendFontColor: textColor(darkmode),
        legendFontSize: 15,
      })
    } else {
      etcsum += completeData[j].appreciation!
    }
  }
  if (etcsum > 0) {
    pieSeries.push({
      name: I18n.t("other"),
      appreciation: etcsum,
      color: sliceColor[5],
      legendFontColor: textColor(darkmode),
      legendFontSize: 15,
    })
  }
  const asso: Coin_Asso[] = []
  desc.forEach((i) => {
    asso.push({
      id: i.symbol,
      avg_price: i.avg_price,
      index: t,
      quantity: i.quantity,
      img: i.img!,
      crntPrice: i.crntPrice!,
      name: i.name!,
      rank: i.rank!,
      url: i.url!,
    })
  })
  const total = dynamicRound(thesum, 2)
  const normalpnl = returnPNL(total, mainContext.user.totalbuyin)
  const constpnl = returnPNL(total, mainContext.user.totalbuyin_const)
  const obj: TotalPortfolio = {
    piedata: pieSeries,
    associatedData: asso,
    totalAppreciation: total,
    pnl: normalpnl,
    pnl_const: constpnl,
    delisted: delisted_desc,
  }
  return obj
}

// Trader

export const lengthOfDecimal = (i: number | string): number => {
  let asStr = i.toString()
  if (char_count(asStr, ".") < 1 || asStr[asStr.length - 1] === ".") {
    return 0
  } else {
    let j = i.toString()
    let k = j.split(".")
    let decimalpart = k[1].toString()
    return decimalpart.length
  }
}

export const char_count = (str: string, letter: string): number => {
  var letter_Count = 0
  for (var position = 0; position < str.length; position++) {
    if (str.charAt(position) == letter) {
      letter_Count += 1
    }
  }
  return letter_Count
}

// global_details
const _sliceColor = [
  "#303f9f",
  "#1976d2",
  "#0288d1",
  "#0097a7",
  "#009688",
  "#4caf50",
  "#8bc34a",
  "#aed581",
  "#009688",
  "#4caf50",
]

export const cal_global_details = (
  darkmode: boolean,
  bigcaps: any,
  coindata: Coin[]
): { desc: Coin[]; pie: PieData[] } => {
  const symbols = Object.keys(bigcaps)
  let _coinData = []
  let _allData: Coin[] = []
  let pie: PieData[] = []
  let percentage = 100
  let limit = 7
  for (let i = 0; i < symbols.length; i++) {
    let symb = symbols[i]
    let coin = coindata.find(
      (i) => i.symbol.toLowerCase() === symb.toLowerCase()
    )
    if (coin) {
      percentage -= bigcaps[symb]
      _coinData.push({
        name: coin!.symbol.toUpperCase(),
        dominance: fastRound(bigcaps[symb]),
        legendFontColor: textColor(darkmode),
        legendFontSize: 15,
      })
      _allData.push(coin!)
    }
  }
  let desc = _allData.sort((a, b) => b!.market_cap! - a!.market_cap!)
  _coinData.sort((a, b) => b.dominance - a.dominance)
  for (let i = 0; i < limit; i++) {
    pie.push(_coinData[i])
    pie[i]["color"] = _sliceColor[i]
  }
  pie.push({
    name: I18n.t("other"),
    dominance: percentage,
    color: "#d9e3f0",
    legendFontColor: textColor(darkmode),
    legendFontSize: 15,
  })
  return { desc: desc, pie: pie }
}

export async function registerForPushNotificationsAsync(userEmail: string) {
  let _token = null
  let included = false
  const { status: existingStatus } = await Notifications.getPermissionsAsync()
  let finalStatus = existingStatus
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }
  _token = (await Notifications.getExpoPushTokenAsync()).data
  console.log("Notification token : ", _token, "with status", finalStatus)
  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    })
  }
  if (userEmail && finalStatus === "granted" && typeof _token === "string") {
    const ref = db.collection("users").doc(userEmail)
    const ref_data = await ref.get()
    const data = ref_data.data()!
    const field = data.push_notif_tokens ?? []
    const un_field = data.push_notif_tokens_unsubscribed ?? []
    let unsubscribed = un_field.includes(_token)
    included = field.includes(_token)
    if (!unsubscribed && !included) {
      included = true
      let newField = [...field, _token]
      await ref.update({ push_notif_tokens: newField })
    }
  }
  return { token: _token, subscribed: included }
}

export const canAccessCameraRoll = async () => {
  if (Platform.OS !== "web") {
    const pres = await ImagePicker.getMediaLibraryPermissionsAsync()
    if (pres.status === "granted") {
      return true
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (status === "granted") {
        return true
      } else {
        return false
      }
    }
  } else {
    return false
  }
}
export const canAccessCamera = async () => {
  if (Platform.OS !== "web") {
    const pres = await ImagePicker.getCameraPermissionsAsync()
    if (pres.status === "granted") {
      return true
    } else {
      const { status } = await ImagePicker.requestCameraPermissionsAsync()
      if (status === "granted") {
        return true
      } else {
        return false
      }
    }
  } else {
    return false
  }
}

export const joinDiscord = () => {
  Linking.openURL(`https://----redacted----`)
}
export const followTwitter = () => {
  Linking.openURL(`https://----redacted----`)
}
export const viewGit = () => {
  Linking.openURL(`https://----redacted----`)
}

export const inAppReview = () => {
  if (Platform.OS === "ios") {
    Linking.openURL(
      `itms-apps://itunes.apple.com/app/viewContentsUserReviews/id${Env.itunesItemId}?action=write-review`
    )
  } else {
    Linking.openURL(
      `market://details?id=${Env.androidPackageName}&showAllReviews=true`
    )
  }
}

export const visitAppStore = () => {
  if (Platform.OS === "ios") {
    Linking.openURL(
      `itms-apps://itunes.apple.com/app/viewContentsUserReviews/id${Env.itunesItemId}`
    )
  } else {
    Linking.openURL(`market://details?id=${Env.androidPackageName}`)
  }
}

export const extractKeywordsFromEmail = (
  str: string[],
  separators: string[]
): string[] => {
  let res: string[] = []
  for (let i = 0; i < str.length; i++) {
    let temp: string | string[] = str[i]
    if (separators.length > 0) {
      for (let j = 0; j < separators.length; j++) {
        temp = temp.split(separators[j]).join(" ")
      }
    }
    temp = temp.split(" ")
    temp = temp.filter((e) => e) //every non null elements
    temp.forEach((e) => {
      res.push(e)
    })
  }
  return res
}

export const isNewbie = (initialDate: number | string): boolean => {
  if (typeof initialDate !== "number") {
    return false
  } else {
    return Boolean((new Date().getTime() - initialDate) / 1000 / 3600 / 24 < 7)
  }
}

export const bannerAdId = (test: boolean) => {
  if (test) {
    return Platform.OS === "ios" ? Env.ios_banner_test : Env.android_banner_test
  } else {
    return Platform.OS === "ios" ? Env.ios_banner : Env.android_banner
  }
}

export const _getAPI = (api: string) => {
  return new Promise((resolve, reject) => {
    axios
      .get(api)
      .then((result) => {
        resolve(result.data)
      })
      .catch(reject)
  })
}

export const baseapi = (params: {
  page: number
  useFullData?: boolean
  extended?: boolean
}): string => {
  return `${Env.cgapi_markets + params.page}${
    Boolean(params.useFullData || params.extended) &&
    "&price_change_percentage=1h%2C7d%2C14d%2C30d%2C200d%2C1y"
  }`
}

export const range = (n: number) => {
  return n >= 0 ? Array.from(Array(n), (_, i) => i + 1) : []
}
export const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms))

/**
 *
 * @param proba float between 0-1
 */
export const requestReview = async (proba: number) => {
  let threshold = Math.random()
  if (threshold < proba) {
    try {
      let _1 = await StoreReview.isAvailableAsync()
      let _2 = await StoreReview.hasAction()
      let _3 = StoreReview.storeUrl() ?? ""
      if (_1 && _2 && _3 !== "") {
        await StoreReview.requestReview()
      } else {
      }
    } catch (e) {}
  } else {
  }
}

/**
 *
 * @param n number of referrals
 */
export const referralDiscountCoefficient = (n: number) => {
  if (n <= 0) {
    return 1
  }
  return 1 / Math.log(n + 2.718)
}

export const amount_decimalHandler = (i: string) => {
  let cut = i.substring(0, i.length - 1)
  let replaced = cut.replaceAt(cut.length - 1, i[i.length - 1])
  let asNum = Number(replaced)
  return { replaced: replaced, asNum: asNum }
}

export const Separator = (
  str: string,
  prefixSeparator = "",
  suffixSeparator = ""
) => {
  if (prefixSeparator) {
    const _str = str.split(prefixSeparator)
    if (_str.length !== 2) {
      return ""
    }
    str = _str[1]
  }
  if (suffixSeparator) {
    const _str = str.split(suffixSeparator)
    if (_str.length !== 2) {
      return ""
    }
    str = _str[0]
  }
  return str
}

interface amountObject {
  asString: string
  asNumber: number
}

export const decimalHandler = (str: string): amountObject | null => {
  if (str === "." || str === ",") {
    return { asString: "0.", asNumber: 0 }
  }
  if (str.includes(",")) {
    str = str.replace(",", ".")
  }
  if (char_count(str, ".") > 1) {
    return null
  }
  if (str[str.length - 1] === ".") {
    let num = Number(str.substring(0, str.length - 1))
    if (isNaN(num)) {
      return null
    }
    return {
      asString: str,
      asNumber: num,
    }
  } else {
    let num = Number(str)
    if (isNaN(num)) {
      return null
    }
    if (str.length > 13) {
      return null
    }
    if (lengthOfDecimal(str) > 10) {
      if (lengthOfDecimal(str) > 11) {
        const { replaced, asNum } = amount_decimalHandler(
          dynamicRound(num, 11).toString()
        )
        return {
          asString: replaced,
          asNumber: asNum,
        }
      }
      if (str[str.length - 1] === "0") {
        return null
      } else {
        const { replaced, asNum } = amount_decimalHandler(str)
        return {
          asString: replaced,
          asNumber: asNum,
        }
      }
    } else {
      return {
        asString: str,
        asNumber: num,
      }
    }
  }
}

export const amountValidator = (str: string): amountObject | null => {
  if (str === "." || str === ",") {
    return { asString: "0.", asNumber: 0 }
  }
  if (str.includes(",")) {
    str = str.replace(",", ".")
  }
  if (char_count(str, ".") > 1) {
    return null
  }
  if (str[str.length - 1] === ".") {
  }
  if (str) {
    if (isNaN(Number(str))) {
      return null
    } else {
      return null
    }
  } else {
    return null
  }
}

export const uploadProfileImage = async (uri: string, email: string) => {
  try {
    let start = new Date().getTime()
    const response = await fetch(uri)
    const blob = await response.blob()
    const ref = strg.ref("users").child(email)
    await ref.put(blob)
    // later part handled from the backend.
  } catch (e) {}
}

export const pickImage = async (openCamera: boolean): Promise<string> => {
  let accessGranted
  try {
    if (openCamera) {
      accessGranted = await canAccessCamera()
    } else {
      accessGranted = await canAccessCameraRoll()
    }
    if (accessGranted) {
      let result
      if (openCamera) {
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 1,
          allowsMultipleSelection: false,
        })
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 1,
          allowsMultipleSelection: false,
        })
      }
      if (!result.cancelled && result?.uri) {
        const manipResult = await manipulateAsync(
          result.uri,
          [{ resize: { width: 400, height: 400 } }],
          {
            compress: 1,
            format: SaveFormat.PNG,
          }
        )
        return manipResult.uri
      } else {
        return "cancelled"
      }
    } else {
      return "error_permission"
    }
  } catch (e) {
    return "error"
  }
}

export const referralsToTier = (refs: number | undefined) => {
  if (!refs || refs < 2) {
    return 0
  } else if (refs < 5) {
    return 1
  } else if (refs < 10) {
    return 2
  } else if (refs < 20) {
    return 3
  } else {
    return 4
  }
}

export const referralsToDiscountRate = (refs: number | undefined) => {
  if (!refs || refs <= 0) {
    return 1
  } else {
    return 1 / Math.log(refs + Math.exp(1))
  }
}

export const tierToDiscountRate = (tier: number | undefined) => {
  if (!tier || tier <= 0) {
    return 1
  } else if (tier === 1) {
    return 0.9
  } else if (tier === 2) {
    return 0.8
  } else if (tier === 3) {
    return 0.666
  } else {
    return 0.5
  }
}

export const tierToReferrals = (tier: number | undefined) => {
  if (!tier || tier <= 0) {
    return 0
  } else if (tier === 1) {
    return 2
  } else if (tier === 2) {
    return 5
  } else if (tier === 3) {
    return 10
  } else {
    return 20
  }
}

export const subscriptionsPerTier = (tier: number | undefined) => {
  if (!tier || tier <= 0) {
    return 3
  } else if (tier === 1) {
    return 5
  } else if (tier === 2) {
    return 10
  } else if (tier === 3) {
    return 20
  } else {
    return 1000
  }
}
const removeFromArray = (arr: any, value: any) => {
  const index = arr.indexOf(value)
  if (index > -1) {
    arr.splice(index, 1)
  }
  return arr
}
export const toggleRegisterFavorite = async (
  email: string,
  tempo: any,
  num_of_referrals: number,
  name: string
) => {
  if (isInList(tempo, name)) {
    tempo = removeFromArray(tempo, name)
  } else {
    if (
      tempo.length < subscriptionsPerTier(referralsToTier(num_of_referrals))
    ) {
      tempo.push(name)
    } else {
      Alert.alert(
        I18n.t("information"),
        `${I18n.t("subscription_exceeded")} : ${tempo.length}`,
        [{ text: I18n.t("ok") }]
      )
    }
  }
  await db.collection("users").doc(email).update({ favorites: tempo })
}
export const timeDifference = (date1: number, date2: number) => {
  let diff = date1 - date2
  let daysDiff = Math.floor(diff / 1000 / 60 / 60 / 24)
  diff -= daysDiff * 1000 * 60 * 60 * 24
  let hoursDiff = Math.floor(diff / 1000 / 60 / 60)
  diff -= hoursDiff * 1000 * 60 * 60
  let minutesDiff = Math.floor(diff / 1000 / 60)
  diff -= minutesDiff * 1000 * 60
  return {
    days: daysDiff,
    hours: hoursDiff,
    minutes: minutesDiff,
  }
}
