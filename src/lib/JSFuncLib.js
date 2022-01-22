import { dynamicColor_marketChange } from "./StyleLib"
import { fastRound, addZeroes } from "./FuncLib"
import stablecoins from "../stablecoins.json"
import { requestTrackingPermissionsAsync, getTrackingPermissionsAsync } from "expo-tracking-transparency"

export const min_threshold = (i) => {
  return i < 0.000001 ? 0 : i
}

export const min_threshold_sell = (i) => {
  return i < 0.00000001 ? 0 : i
}

export const sumValues = (obj) => Object.values(obj).reduce((a, b) => a + b)
export const extract = (n, obj) => {
  let arr = []
  for (let i = 0; i < n; i++) {
    let key = Object.keys(obj)[i]
    let _key = key.toUpperCase()
    let value = addZeroes(fastRound(Object.values(obj)[i])) + "%"
    arr.push({ [_key]: value })
  }
  return arr
}
export const removeFromArray = (arr, value) => {
  const index = arr.indexOf(value)
  if (index > -1) {
    arr.splice(index, 1)
  }
  return arr
}
export const objectToArrayByKey = (obj, key) => {
  let target = []
  for (let i = 0; i < obj.length; i++) {
    target.push(obj[i][key])
  }
  return target
}
// Main Controller
export const parse_global_data = (_res) => {
  const asString = (i) => {
    return i >= 0 ? "+" + addZeroes(i) + "%" : addZeroes(i) + "%"
  }
  let percentage = _res.market_cap_change_percentage_24h_usd
  let caps = _res.market_cap_percentage
  const list = objectToArrayByKey(stablecoins, "symbol")
  const only_stablecoins = Object.keys(caps)
    .filter((key) => list.includes(key))
    .reduce((obj, key) => {
      obj[key] = caps[key]
      return obj
    }, {})
  const sum_stablecoins = sumValues(only_stablecoins)
  let tops = extract(3, caps)
  let obj = {
    data: _res,
    color: dynamicColor_marketChange(percentage),
    market: asString(fastRound(percentage)),
    stabd: addZeroes(fastRound(sum_stablecoins)) + "%",
    _no1: tops[0],
    _no2: tops[1],
    _no3: tops[2],
  }
  return obj
}

export const requestTracking = async (isAndroid) => {
  if (isAndroid) {
    return true
  } else {
    const { granted } = await getTrackingPermissionsAsync()
    if (!granted) {
      const { status } = await requestTrackingPermissionsAsync()
      return Boolean(status === "granted")
    } else {
      return Boolean(granted === true)
    }
  }
}

export const clamp = (i, max = 0, min = 0) => {
  return i > max ? max : i < min ? min : i
}
