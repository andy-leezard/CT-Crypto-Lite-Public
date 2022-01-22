import React, { useEffect, useState, useContext, useMemo } from "react"
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Alert,
  Platform,
} from "react-native"
import { db } from "../../firebase"
import { Button } from "react-native-elements"
import Slider from "@react-native-community/slider"
import stablecoins from "../stablecoins.json"
import i18n from "i18n-js"
import {
  GlobalContext,
  GlobalContextInterfaceAsReducer,
  MainContext,
  MainContextInterface,
} from "../ContextManager"
import {
  numberWithCommas,
  dynamicRound,
  determineDecimals,
  lengthOfDecimal,
  char_count,
  avoidScientificNotation_andRound,
  requestReview,
  referralDiscountCoefficient,
  Separator,
  decimalHandler,
} from "../lib/FuncLib"
import { min_threshold, min_threshold_sell } from "../lib/JSFuncLib"
import * as StyleLib from "../lib/StyleLib"
import { DocumentSnapshot } from "@firebase/firestore-types"

const width =
  (Platform.OS === "android"
    ? Dimensions.get("window").width * 0.95
    : Dimensions.get("window").width) - 20

enum actions {
  BUY = "Buy",
  SELL = "Sell",
}

enum history_action {
  BOUGHT = "Bought",
  SOLD = "Sold",
}

enum order_mode {
  MARKET = "market",
  ORDER = "order",
}

const actionListTab = [actions.BUY, actions.SELL]

const orderModeListTab = [order_mode.MARKET, order_mode.ORDER]

const actionColors = {
  BUY: {
    DARK: "#42B95D",
    LIGHT: "#36eb5f",
  },
  SELL: {
    DARK: "#FF5A4A",
    LIGHT: "#ff6161",
  },
}

interface Props {
  coinname: string
  coinprice: number
  coinsymbol: string
  coinIcon: string
}

const TraderV2: React.FC<Props> = ({
  coinname,
  coinprice,
  coinsymbol,
  coinIcon,
}) => {
  const gc = useContext(GlobalContext) as GlobalContextInterfaceAsReducer
  const mc = useContext(MainContext) as MainContextInterface
  const inputRef = React.createRef<TextInput>()
  const [takerFee, setTakerFee] = useState(2)
  const [makerFee, setMakerFee] = useState(1)
  const [loaded, setLoaded] = useState(false)

  // for display purpose only
  const [discountRate, setDiscountRate] = useState(0)
  const [orderMode, setOrderMode] = useState(order_mode.MARKET)

  const unitmodes = useMemo(() => {
    return { FIAT: "Fiat", CRYPTO: coinsymbol }
  }, [coinsymbol])

  const [quantity, setquantity] = useState<number>(0)
  const [action, setAction] = useState<string>(actions.BUY)
  const [actionColor, setActionColor] = useState<string>(actionColors.BUY.LIGHT)
  const [unitmode, setUnitmode] = useState<string>(unitmodes.FIAT)

  const [percentage, setPercentage] = useState<number>(0)
  const [actionQuantity, setActionQuantity] = useState<number>(0)
  const [actionQuantity_crypto, setActionQuantity_crypto] = useState<number>(0)
  const [actionQuantity_fiat, setActionQuantity_fiat] = useState<number>(0)
  const [actionQuantity_str, setActionQuantity_str] = useState<string>("")
  const [limit, setLimit] = useState<number>(0)
  const [processing, setProcessing] = useState<boolean>(false)
  const [appreciation, setAppreciation] = useState<number>(0)

  const [orderPrice, setOrderPrice] = useState(coinprice)
  const [orderPrice_str, setOrderPrice_str] = useState(coinprice.toString())

  const buyPrice = useMemo(() => {
    if (orderMode === order_mode.MARKET) {
      return coinprice * (1 + takerFee / 100)
    } else {
      return orderPrice
    }
  }, [coinprice, loaded, takerFee, orderMode, orderPrice])

  const sellPrice = useMemo(() => {
    if (orderMode === order_mode.MARKET) {
      return coinprice * (1 - takerFee / 100)
    } else {
      return orderPrice
    }
  }, [coinprice, loaded, takerFee, orderMode, orderPrice])

  const stableCoinAlert = () => {
    const message =
      coinname + ` ${i18n.t("warn_stable_pre")}\n${i18n.t("warn_stable_suf")}`
    Alert.alert(i18n.t("information"), message, [{ text: i18n.t("ok") }])
  }
  const fetchFees = async () => {
    try {
      const doc = await db.collection("globalEnv").doc("commission").get()
      if (doc.exists) {
        const data = doc.data()!
        const number_of_referrals = mc.user?.referrals?.length ?? 0
        const coeff = referralDiscountCoefficient(number_of_referrals)
        setDiscountRate((1 - coeff) * 100)
        const taker_fee = (data.taker_fee ?? 2) * coeff
        const maker_fee = (data.maker_fee ?? 1) * coeff
        setTakerFee(taker_fee)
        setMakerFee(maker_fee)
        setLoaded(true)
      }
    } catch (e) {}
  }
  const createWallet = async () => {
    await db
      .collection("users")
      .doc(gc.state.auth.userEmail!)
      .collection("wallet")
      .doc(coinname)
      .set({ quantity: 0, symbol: coinsymbol, avg_price: 0, appre: 0 })
  }

  useEffect(() => {
    const ref = db
      .collection("users")
      .doc(gc.state.auth.userEmail!)
      .collection("wallet")
      .doc(coinname)
    const unsubscribe = ref.onSnapshot((doc: DocumentSnapshot) => {
      if (doc.exists) {
        const data = doc.data()!
        let _quantity = data.quantity
        let _appre = data.appre ?? 0
        setquantity(_quantity)
        setAppreciation(_appre)
      } else {
        stablecoins.some((item) => item.name === coinname) && stableCoinAlert()
        createWallet()
      }
    })
    return () => {
      unsubscribe()
    }
  }, [mc])

  useEffect(() => {
    if (gc.state.env.darkmode) {
      setActionColor(actionColors.BUY.DARK)
    } else {
      setActionColor(actionColors.BUY.LIGHT)
    }
    fetchFees()
  }, [])

  useEffect(() => {
    if (orderMode === order_mode.MARKET || orderPrice) {
      updateLimit()
    }
  }, [mc, orderMode, action, unitmode, quantity, orderPrice])

  const regardingCommissionFees = () => {
    Alert.alert(i18n.t("notification"), i18n.t("regarding_fees"), [
      { text: i18n.t("ok") },
    ])
  }

  const updateLimit = () => {
    if (action === actions.BUY) {
      if (unitmode === unitmodes.FIAT) {
        setLimit(mc.user.seed)
      } else {
        if (buyPrice <= 0) {
          setLimit(0)
        } else {
          let temp = dynamicRound(mc.user.seed / buyPrice, 8)
          setLimit(temp)
        }
      }
    } else {
      if (unitmode === unitmodes.FIAT) {
        let temp = dynamicRound(mc.user.seed * sellPrice, 2)
        setLimit(temp)
      } else {
        setLimit(quantity)
      }
    }
  }

  const amount_decimalHandler = (i: string) => {
    let cut = i.substring(0, i.length - 1)
    let replaced = cut.replaceAt(cut.length - 1, i[i.length - 1])
    let asNum = Number(replaced)
    return { replaced: replaced, asNum: asNum }
  }

  const amountHandler = (i: string) => {
    if (processing) {
      return
    }
    if (unitmode === unitmodes.FIAT) {
      if (lengthOfDecimal(i) > 2) {
        if (lengthOfDecimal(i) > 3) {
          const { replaced, asNum } = amount_decimalHandler(
            dynamicRound(Number(i), 3).toString()
          )
          setActionQuantity_str(replaced)
          trigger_handleAmount(asNum)
          return
        }
        if (i[i.length - 1] === "0") {
          return
        } else {
          const { replaced, asNum } = amount_decimalHandler(i)
          setActionQuantity_str(replaced)
          trigger_handleAmount(asNum)
          return
        }
      }
    } else {
      if (lengthOfDecimal(i) > 8) {
        if (lengthOfDecimal(i) > 9) {
          const { replaced, asNum } = amount_decimalHandler(
            dynamicRound(Number(i), 9).toString()
          )
          setActionQuantity_str(replaced)
          trigger_handleAmount(asNum)
          return
        }
        if (i[i.length - 1] === "0") {
          return
        } else {
          const { replaced, asNum } = amount_decimalHandler(i)
          setActionQuantity_str(replaced)
          trigger_handleAmount(asNum)
          return
        }
      }
    }
    if (i === "") {
      setActionQuantity_str("")
      setActionQuantity(0)
      setActionQuantity_crypto(0)
      setActionQuantity_fiat(0)
      setPercentage(0)
      return
    }
    if (i === "." || i === ",") {
      setActionQuantity_str("0.")
      return
    }
    if (i[i.length - 1] === ",") {
      if (char_count(i, ".") === 0) {
        setActionQuantity_str(i.replace(",", "."))
        return
      } else {
        return
      }
    }
    if (char_count(i, ".") > 1) {
      return
    }
    if (i[i.length - 1] !== ".") {
      let param = Number(i)
      if (param === 0 && i.length < 2) {
        setActionQuantity_str("0")
        setActionQuantity(0)
        setActionQuantity_crypto(0)
        setActionQuantity_fiat(0)
        setPercentage(0)
        return
      }
      if (char_count(i, ".") < 1) {
        setActionQuantity_str(param.toString())
      } else {
        setActionQuantity_str(i)
      }
      if (param > limit) {
        setActionQuantity(limit)
        slideHandler_justCrypto(1)
        slideHandler_justFiat(1)
        setPercentage(1)
        setActionQuantity_str(limit.toString())
      } else {
        trigger_handleAmount(param)
      }
    } else {
      setActionQuantity_str(i)
    }
  }

  const orderPriceHandler = (str: string) => {
    if (processing) {
      return
    }
    str = Separator(str, " ")
    if (str) {
      let decimal_processed = decimalHandler(str)
      if (decimal_processed) {
        setOrderPrice_str(decimal_processed.asString)
        setOrderPrice(decimal_processed.asNumber)
      }
    } else {
      setOrderPrice_str("")
      setOrderPrice(0)
    }
  }

  const toggleOrderMode = () => {
    let ordermode = Boolean(orderMode === order_mode.MARKET)
      ? order_mode.ORDER
      : order_mode.MARKET
    if (ordermode === order_mode.MARKET) {
      setOrderPrice_str(coinprice.toString())
      setOrderPrice(coinprice)
    }
    setOrderMode(ordermode)
  }

  const trigger_handleAmount = (param: number) => {
    let asPercentage = param / limit
    asPercentage = dynamicRound(asPercentage, 3)
    setPercentage(asPercentage)
    setActionQuantity(param)
    if (unitmode === unitmodes.FIAT) {
      setActionQuantity_fiat(param)
      if (action === actions.BUY) {
        setActionQuantity_crypto(
          min_threshold(dynamicRound(param / buyPrice, 8))
        )
      } else {
        setActionQuantity_crypto(
          min_threshold(dynamicRound(param / sellPrice, 8))
        )
      }
    } else {
      if (action === actions.BUY) {
        setActionQuantity_fiat(buyPrice * param)
        if (buyPrice * param < 0.01) {
          setActionQuantity_crypto(0)
        } else {
          setActionQuantity_crypto(min_threshold_sell(param))
        }
      } else {
        setActionQuantity_fiat(sellPrice * param)
        if (sellPrice * param < 0.01) {
          setActionQuantity_crypto(0)
        } else {
          setActionQuantity_crypto(min_threshold_sell(param))
        }
      }
    }
  }

  const slideHandler_justCrypto = (i: number) => {
    if (i === 0) {
      setActionQuantity_crypto(0)
      return
    }
    if (action === actions.BUY) {
      let tempseed = dynamicRound(mc.user.seed * i, 2)
      if (buyPrice <= 0) {
        setActionQuantity_crypto(0)
        return
      }
      let tempcrypto = dynamicRound(tempseed / buyPrice, 8)
      setActionQuantity_crypto(tempcrypto)
    } else {
      let tempquantity = dynamicRound(quantity * i, 8)
      setActionQuantity_crypto(tempquantity)
    }
  }

  const slideHandler_justFiat = (i: number) => {
    if (i === 0) {
      setActionQuantity_fiat(0)
      return
    }
    if (action === actions.BUY) {
      if (buyPrice <= 0) {
        setActionQuantity_fiat(0)
        return
      }
      let tempfiat = dynamicRound(mc.user.seed * i, 2)
      setActionQuantity_fiat(tempfiat)
    } else {
      let tempquantity = dynamicRound(quantity * i, 8)
      let tempfiat = dynamicRound(tempquantity * sellPrice, 2)
      setActionQuantity_fiat(tempfiat)
    }
  }

  const slideHandler = (param: number, only_string = false) => {
    if (processing) {
      return
    }
    setPercentage(param)
    if (param === 0) {
      setActionQuantity_str("")
      setActionQuantity(0)
      setActionQuantity_crypto(0)
      setActionQuantity_fiat(0)
      return
    }
    if (action === actions.BUY) {
      if (buyPrice <= 0) {
        setActionQuantity(0)
        setActionQuantity_str("")
        setActionQuantity_crypto(0)
        setActionQuantity_fiat(0)
        return
      }
      let tempfiat = dynamicRound(mc.user.seed * param, 2)
      setActionQuantity_fiat(tempfiat)
      let tempcrypto = dynamicRound(tempfiat / buyPrice, 8)
      setActionQuantity_crypto(tempcrypto)
      if (unitmode === unitmodes.FIAT) {
        setActionQuantity(tempfiat)
        setActionQuantity_str(tempfiat.toString())
      } else {
        setActionQuantity(tempcrypto)
        setActionQuantity_str(tempcrypto.toString())
      }
    } else {
      let tempquantity = dynamicRound(quantity * param, 8)
      setActionQuantity_crypto(tempquantity)
      let tempfiat = dynamicRound(tempquantity * sellPrice, 2)
      setActionQuantity_fiat(tempfiat)
      if (unitmode === unitmodes.FIAT) {
        setActionQuantity(tempfiat)
        setActionQuantity_str(tempfiat.toString())
      } else {
        setActionQuantity(tempquantity)
        setActionQuantity_str(tempquantity.toString())
      }
    }
  }

  const setActionFilter = (i: string) => {
    if (processing) {
      return
    }
    if (action === i) {
      if (actionQuantity > 0) {
        triggerTrade()
        return
      } else {
        alert_noAmount()
        return
      }
    }
    if (i === actions.BUY) {
      gc.state.env.darkmode
        ? setActionColor(actionColors.BUY.DARK)
        : setActionColor(actionColors.BUY.LIGHT)
    } else {
      gc.state.env.darkmode
        ? setActionColor(actionColors.SELL.DARK)
        : setActionColor(actionColors.SELL.LIGHT)
    }
    setAction(i)
    setPercentage(0)
    setActionQuantity(0)
    setActionQuantity_str("")
    setActionQuantity_fiat(0)
    setActionQuantity_crypto(0)
  }

  const setUnitFilter = (i: string) => {
    if (processing) {
      return
    }
    if (i === unitmode) {
      if (actionQuantity > 0) {
        triggerTrade()
        return
      } else {
        alert_noAmount()
        return
      }
    }
    setUnitmode(i)
    if (actionQuantity_str === "") {
      return
    }
    if (action === actions.BUY) {
      if (i === unitmodes.FIAT) {
        let temp = dynamicRound(mc.user.seed * percentage, 2)
        setActionQuantity(temp)
        setActionQuantity_fiat(temp)
        setActionQuantity_str(temp.toString())
      } else {
        if (buyPrice <= 0) {
          setActionQuantity(0)
          setActionQuantity_str("")
          setActionQuantity_crypto(0)
          setActionQuantity_fiat(0)
        } else {
          let temp = dynamicRound(mc.user.seed / buyPrice, 8)
          let temp2 = dynamicRound(temp * percentage, 8)
          setActionQuantity(temp2)
          setActionQuantity_str(temp2.toString())
          setActionQuantity_crypto(temp2)
        }
      }
    } else {
      if (i === unitmodes.FIAT) {
        let temp = dynamicRound(quantity * sellPrice, 2)
        let temp2 = dynamicRound(temp * percentage, 2)
        setActionQuantity(temp2)
        setActionQuantity_str(temp2.toString())
        setActionQuantity_fiat(temp2)
      } else {
        let temp = dynamicRound(quantity * percentage, 8)
        setActionQuantity(temp)
        setActionQuantity_str(temp.toString())
        setActionQuantity_crypto(temp)
      }
    }
  }

  const alert_noAmount = () => {
    const message =
      action === actions.BUY ? i18n.t("type_buy_q") : i18n.t("type_sell_q")
    Alert.alert(i18n.t("information"), message, [{ text: i18n.t("ok") }])
    inputRef.current!.focus()
  }

  const renderPlaceHolder = (only_fiat = false) => {
    if (action === actions.BUY || only_fiat) {
      return unitmode === unitmodes.FIAT
        ? `${i18n.t("amount_p")} ($)`
        : `${i18n.t("amount_p")} (${coinsymbol})`
    } else {
      return unitmode === unitmodes.FIAT
        ? `${i18n.t("amount_s")} ($)`
        : `${i18n.t("amount_s")} (${coinsymbol})`
    }
  }

  const triggerTrade = () => {
    action === actions.BUY ? trigger_buy() : trigger_sell()
  }

  const trigger_buy = async () => {
    setProcessing(true)
    promise_buy()
  }

  const trigger_sell = async () => {
    setProcessing(true)
    promise_sell()
  }

  const promise_buy = async () => {
    let nq = dynamicRound(quantity + actionQuantity_crypto, 8)
    let anchorPrice = coinprice
    let new_appre =
      appreciation === 0
        ? nq * anchorPrice
        : appreciation + actionQuantity_crypto * anchorPrice
    let avg_price = appreciation === 0 ? anchorPrice : new_appre / nq
    new_appre = dynamicRound(new_appre, determineDecimals(anchorPrice))
    avg_price = dynamicRound(avg_price, determineDecimals(anchorPrice))
    try {
      await Promise.all([
        addHistory(history_action.BOUGHT),
        updateQuantity(nq, new_appre, avg_price),
        _updateSeed(-actionQuantity_fiat),
      ])
      requestReview(0.25)
    } catch (e) {
    } finally {
      slideHandler(0)
      setProcessing(false)
    }
  }

  const promise_sell = async () => {
    let nq = dynamicRound(quantity - actionQuantity_crypto, 8)
    try {
      await Promise.all([
        addHistory(history_action.SOLD),
        updateQuantity(nq, nq * buyPrice),
        _updateSeed(actionQuantity_fiat),
      ])
      requestReview(0.25)
    } catch (e) {
    } finally {
      slideHandler(0)
      setProcessing(false)
    }
  }

  const _updateSeed = (modifier: number) => {
    return new Promise((resolve, reject) => {
      let newSeed = dynamicRound(mc.user.seed + modifier, 2)
      db.collection("users")
        .doc(gc.state.auth.userEmail!)
        .update({ seed: newSeed })
        .then(() => {
          resolve("_updateSeed - success")
        })
        .catch(reject)
    })
  }

  const updateQuantity = (
    newquantity: number,
    newappre: number,
    avg_price: number | null = null
  ) => {
    let payload: any = { quantity: newquantity, appre: newappre }
    if (avg_price) {
      payload = { ...payload, avg_price: avg_price }
    }
    return new Promise((resolve, reject) => {
      db.collection("users")
        .doc(gc.state.auth.userEmail!)
        .collection("wallet")
        .doc(coinname)
        .update(payload)
        .then(() => {
          setquantity(newquantity)
          resolve("sell_updateQuantity - success")
        })
        .catch(reject)
    })
  }

  const addHistory = (type: string) => {
    return new Promise((resolve, reject) => {
      const time = new Date()
      const price = type == history_action.BOUGHT ? buyPrice : sellPrice
      db.collection("users")
        .doc(gc.state.auth.userEmail!)
        .collection("history")
        .add({
          type: type,
          target: coinsymbol,
          targetName: coinname,
          quantity: actionQuantity_crypto,
          fiat: actionQuantity_fiat,
          price: price,
          imgsrc: coinIcon,
          orderNum: time.getTime(),
          paid_fee: Math.abs(coinprice - price),
        })
        .then(() => {
          resolve("sell_addHistory - success")
        })
        .catch(reject)
    })
  }

  const buttonHandler = (dir: boolean) => {
    /**
     * @param {boolean} dir = up or down ? (true : false)
     */
    dir ? increase() : decrease()
  }

  const increase = () => {
    percentage < 0.9 ? slideHandler(percentage + 0.1) : slideHandler(1)
  }

  const decrease = () => {
    percentage > 0.1 ? slideHandler(percentage - 0.1) : slideHandler(0)
  }

  const _parseAction = (i: string) => {
    return i === actions.BUY ? i18n.t("buy") : i18n.t("sell")
  }

  const wallets = (
    <>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          borderWidth: 2,
          borderRadius: 10,
          borderColor: StyleLib.containerRadiusColor_bis(
            gc.state.env.darkmode!
          ),
          backgroundColor: StyleLib.containerColor_bis(gc.state.env.darkmode!),
          width: width,
          minHeight: 40,
          padding: 5,
          marginTop: 5,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            width: width / 2 - 15,
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              backgroundColor: "white",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Image
              source={{ uri: coinIcon }}
              style={{ width: 24, height: 24, borderRadius: 6 }}
            />
          </View>
          <Text
            style={{
              fontSize: 13,
              fontWeight: "bold",
              color: StyleLib.textColor(gc.state.env.darkmode!),
              marginLeft: 10,
            }}
          >
            {i18n.t("my_wallet_pre")} {coinsymbol} {i18n.t("my_wallet_suf")}
          </Text>
        </View>
        <View
          style={{
            flexDirection: "column",
            width: width / 2 - 15,
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: "bold",
              color: StyleLib.textColor(gc.state.env.darkmode!),
              marginRight: 5,
              textAlign: "right",
            }}
          >
            ${numberWithCommas(dynamicRound(quantity * coinprice, 2))}
          </Text>
          <Text
            style={{
              fontSize: 10,
              fontWeight: "bold",
              color: StyleLib.subTextColor_ter(gc.state.env.darkmode!),
              marginRight: 5,
              textAlign: "right",
            }}
          >
            {quantity} {coinsymbol}
          </Text>
        </View>
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          borderWidth: 2,
          borderRadius: 10,
          borderColor: StyleLib.containerRadiusColor_bis(
            gc.state.env.darkmode!
          ),
          backgroundColor: StyleLib.containerColor_bis(gc.state.env.darkmode!),
          width: width,
          minHeight: 40,
          padding: 5,
          marginTop: 5,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            width: width / 2 - 15,
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              backgroundColor: "white",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Image
              source={require("../assets/icons/1x/usd_custom.png")}
              style={{ width: 24, height: 24 }}
            />
          </View>
          <Text
            style={{
              fontSize: 13,
              fontWeight: "bold",
              color: StyleLib.textColor(gc.state.env.darkmode!),
              marginLeft: 10,
            }}
          >
            {i18n.t("my_wallet_pre")} VUSD {i18n.t("my_wallet_suf")}
          </Text>
        </View>
        <View style={{ flexDirection: "column", width: width / 2 - 15 }}>
          <Text
            style={{
              fontSize: 12,
              fontWeight: "bold",
              color: StyleLib.textColor(gc.state.env.darkmode!),
              marginRight: 5,
              textAlign: "right",
            }}
          >
            ${numberWithCommas(mc.user.seed)}
          </Text>
          <Text
            style={{
              fontSize: 10,
              fontWeight: "bold",
              color: StyleLib.subTextColor_ter(gc.state.env.darkmode!),
              marginRight: 5,
              textAlign: "right",
            }}
          >
            = {dynamicRound(mc.user.seed / coinprice, 2)} {coinsymbol}
          </Text>
        </View>
      </View>
    </>
  )
  const actions_buttons = (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: StyleLib.containerColor_quinquies(
          gc.state.env.darkmode!
        ),
        borderRadius: 5,
        width: width,
        marginVertical: 5,
        height: 35,
      }}
    >
      {actionListTab.map((e, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.action_tab,
            action === e &&
              e === actions.SELL && {
                backgroundColor: StyleLib.sellColor(gc.state.env.darkmode!),
              },
            action === e &&
              e === actions.BUY && {
                backgroundColor: StyleLib.buyColor(gc.state.env.darkmode!),
              },
          ]}
          onPress={() => setActionFilter(e)}
        >
          <Text
            style={{
              color: "white",
              fontWeight: "bold",
              fontSize: 15,
              textAlign: "center",
            }}
          >
            {_parseAction(e)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  )
  const priceIndicator = (
    <View
      style={{
        backgroundColor: StyleLib.containerColor_quinquies(
          gc.state.env.darkmode!
        ),
        borderRadius: 5,
        width: width,
        marginBottom: 5,
        justifyContent: "center",
        height: 35,
      }}
    >
      <TouchableOpacity
        style={{
          position: "absolute",
          alignSelf: "flex-start",
          paddingLeft: 5,
          flexDirection: "column",
          justifyContent: "center",
          paddingBottom: 2,
          zIndex: 1,
        }}
        onPress={() => {
          Alert.alert(i18n.t("limit_order"), i18n.t("not_yet_implemented"), [
            { text: i18n.t("ok") },
          ])
        }}
      >
        <Text
          style={{
            color: "#FFFFFF",
            fontWeight: "bold",
            fontSize: 14,
          }}
        >
          {Boolean(orderMode === order_mode.MARKET)
            ? i18n.t("market_order")
            : i18n.t("limit_order")}
        </Text>
        {action === actions.BUY ? (
          <Text
            style={{
              color: "#F2F2F2",
              fontWeight: "bold",
              fontSize: 8,
            }}
          >
            {i18n.t("purchase_price")}
          </Text>
        ) : (
          <Text
            style={{
              color: "#F2F2F2",
              fontWeight: "bold",
              fontSize: 8,
            }}
          >
            {i18n.t("selling_price")}
          </Text>
        )}
      </TouchableOpacity>
      {orderMode === order_mode.MARKET ? (
        <>
          {action === actions.BUY ? (
            <Text
              style={{
                color: "white",
                fontWeight: "bold",
                fontSize: 15,
                textAlign: "center",
              }}
            >
              $ {avoidScientificNotation_andRound(buyPrice)}
            </Text>
          ) : (
            <Text
              style={{
                color: "white",
                fontWeight: "bold",
                fontSize: 15,
                textAlign: "center",
              }}
            >
              $ {avoidScientificNotation_andRound(sellPrice)}
            </Text>
          )}
        </>
      ) : (
        <>
          <TextInput
            style={{
              paddingHorizontal: 10,
              backgroundColor: StyleLib.containerColor_quinquies(
                gc.state.env.darkmode!
              ),
              color: actionColor,
              flex: 1,
              borderRadius: 5,
              fontSize: 18,
              fontWeight: "bold",
              textAlign: "center",
            }}
            value={`$ ${orderPrice_str}`}
            onChangeText={orderPriceHandler}
            placeholder={renderPlaceHolder(true)}
            placeholderTextColor="#CCCCCC"
            keyboardType="numeric"
          />
        </>
      )}
      <TouchableOpacity
        style={{
          position: "absolute",
          alignSelf: "flex-end",
          paddingRight: 5,
          flexDirection: "column",
          justifyContent: "space-evenly",
          zIndex: 1,
        }}
        onPress={() => {
          regardingCommissionFees()
        }}
      >
        <Text
          style={{
            color: "#F2F2F2",
            fontWeight: "bold",
            fontSize: 10,
            textAlign: "right",
          }}
        >
          {`${i18n.t("discount_rate")} : ${dynamicRound(discountRate, 5)}%`}
        </Text>
        <Text
          style={{
            color: "#F2F2F2",
            fontWeight: "bold",
            fontSize: 10,
            textAlign: "right",
          }}
        >
          {Boolean(orderMode === order_mode.MARKET)
            ? i18n.t("taker_fee")
            : i18n.t("maker_fee")}{" "}
          :{""}
          {Boolean(orderMode === order_mode.MARKET)
            ? dynamicRound(takerFee, 5)
            : dynamicRound(makerFee, 5)}
          %
        </Text>
      </TouchableOpacity>
    </View>
  )

  return (
    <View style={{ alignItems: "center" }}>
      {wallets}
      {actions_buttons}
      {loaded && priceIndicator}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          backgroundColor: StyleLib.containerColor_quinquies(
            gc.state.env.darkmode!
          ),
          borderRadius: 5,
          width: width,
          height: 35,
        }}
      >
        <TouchableOpacity
          style={[
            styles.unit_tab,
            unitmode === unitmodes.FIAT && {
              backgroundColor: StyleLib.unitContainerColor(
                gc.state.env.darkmode!
              ),
            },
          ]}
          onPress={() => setUnitFilter(unitmodes.FIAT)}
        >
          <Text
            style={[
              styles.unit_text,
              unitmode === unitmodes.FIAT && {
                color: StyleLib.unitTextColor(gc.state.env.darkmode!),
              },
            ]}
          >
            {i18n.t("fiat")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.unit_tab,
            unitmode === coinsymbol && {
              backgroundColor: StyleLib.unitContainerColor(
                gc.state.env.darkmode!
              ),
            },
          ]}
          onPress={() => setUnitFilter(coinsymbol)}
        >
          <Text
            style={[
              styles.unit_text,
              unitmode === coinsymbol && {
                color: StyleLib.unitTextColor(gc.state.env.darkmode!),
              },
            ]}
          >
            {coinsymbol}
          </Text>
        </TouchableOpacity>
      </View>
      <View
        style={{
          width: width,
          justifyContent: "center",
          alignItems: "center",
          height: 35,
          marginTop: 5,
          marginBottom: 5,
        }}
      >
        <TextInput
          ref={inputRef}
          style={{
            paddingHorizontal: 10,
            backgroundColor: StyleLib.containerColor_quinquies(
              gc.state.env.darkmode!
            ),
            color: actionColor,
            width: width,
            height: 35,
            borderRadius: 5,
            fontSize: 18,
            fontWeight: "bold",
            textAlign: "center",
          }}
          value={actionQuantity_str}
          onChangeText={amountHandler}
          placeholder={renderPlaceHolder()}
          placeholderTextColor="#CCCCCC"
          keyboardType="numeric"
        />
        <Text
          style={{
            color: actionColor,
            fontWeight: "bold",
            fontSize: 14,
            position: "absolute",
            alignSelf: "flex-start",
            paddingLeft: 5,
          }}
        >
          {" "}
          {dynamicRound(percentage * 100, 2)}%
        </Text>
        {unitmode === unitmodes.FIAT ? (
          <Text
            style={{
              color: actionColor,
              fontWeight: "bold",
              fontSize: 14,
              position: "absolute",
              alignSelf: "flex-end",
              paddingRight: 5,
            }}
          >
            ${" "}
          </Text>
        ) : (
          <Text
            style={{
              color: actionColor,
              fontWeight: "bold",
              fontSize: 14,
              position: "absolute",
              alignSelf: "flex-end",
            }}
          >
            {coinsymbol}{" "}
          </Text>
        )}
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: StyleLib.containerColor_quinquies(
            gc.state.env.darkmode!
          ),
          borderRadius: 5,
        }}
      >
        <TouchableOpacity
          style={[
            {
              width: 30,
              height: 30,
              borderRadius: 5,
              marginLeft: 5,
              justifyContent: "center",
              alignItems: "center",
            },
            actionQuantity <= 0
              ? { backgroundColor: "#CCCCCC" }
              : { backgroundColor: "white" },
          ]}
          onPress={() => buttonHandler(false)}
        >
          <Image
            source={require("../assets/icons/1x/minus.png")}
            style={[
              { width: 20, height: 20 },
              action === actions.BUY &&
                actionQuantity > 0 && {
                  tintColor: StyleLib.sellColor(gc.state.env.darkmode!),
                },
              action === actions.SELL &&
                actionQuantity > 0 && {
                  tintColor: StyleLib.buyColor(gc.state.env.darkmode!),
                },
            ]}
          />
        </TouchableOpacity>
        <View style={{ width: width - 110, marginHorizontal: 20 }}>
          <Slider
            value={percentage}
            onSlidingComplete={(value) => slideHandler(value)}
            step={0.05}
            thumbTintColor="white"
            minimumTrackTintColor={actionColor}
            style={{ height: 35 }}
          />
        </View>
        <TouchableOpacity
          style={[
            {
              width: 30,
              height: 30,
              backgroundColor: "white",
              borderRadius: 5,
              marginRight: 5,
              justifyContent: "center",
              alignItems: "center",
            },
            percentage >= 1
              ? { backgroundColor: "#CCCCCC" }
              : { backgroundColor: "white" },
          ]}
          onPress={() => buttonHandler(true)}
        >
          <Image
            source={require("../assets/icons/1x/plus.png")}
            style={[
              { width: 20, height: 20 },
              action === actions.BUY &&
                percentage < 1 && {
                  tintColor: StyleLib.buyColor(gc.state.env.darkmode!),
                },
              action === actions.SELL &&
                percentage < 1 && {
                  tintColor: StyleLib.sellColor(gc.state.env.darkmode!),
                },
            ]}
          />
        </TouchableOpacity>
      </View>

      {action === actions.SELL ? (
        <Button
          disabled={actionQuantity_crypto <= 0 || processing}
          buttonStyle={{
            backgroundColor: StyleLib.sellColor(gc.state.env.darkmode!),
            borderRadius: 5,
            marginTop: 5,
            width: width,
            height: 50,
          }}
          titleStyle={{ color: "#ffffff", fontSize: 16, fontWeight: "bold" }}
          title={
            processing
              ? i18n.t("s_processing")
              : i18n.t("sell") + " " + actionQuantity_crypto + " " + coinsymbol
          }
          onPress={triggerTrade}
        />
      ) : (
        <Button
          disabled={actionQuantity_crypto <= 0 || processing}
          buttonStyle={{
            backgroundColor: StyleLib.buyColor(gc.state.env.darkmode!),
            borderRadius: 5,
            marginTop: 5,
            width: width,
            height: 50,
          }}
          titleStyle={{ color: "#ffffff", fontSize: 16, fontWeight: "bold" }}
          title={
            processing
              ? i18n.t("s_processing")
              : i18n.t("buy") + " " + actionQuantity_crypto + " " + coinsymbol
          }
          onPress={triggerTrade}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  action_tab: {
    borderRadius: 5,
    paddingHorizontal: 8,
    width: width / 2,
    height: 35,
    justifyContent: "center",
  },
  unit_tab: {
    borderRadius: 5,
    paddingHorizontal: 8,
    width: width / 2,
    height: 35,
    justifyContent: "center",
  },
  unit_text: {
    color: "white",
    fontWeight: "bold",
    fontSize: 15,
    textAlign: "center",
  },
})

export default TraderV2
