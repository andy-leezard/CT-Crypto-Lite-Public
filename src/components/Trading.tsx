import React, { useState, useEffect, useContext } from "react"
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  Dimensions,
  Platform,
  ScrollView,
} from "react-native"
import { KeyboardAvoidingView } from "react-native"
import * as Linking from "expo-linking"
import Env from "../env.json"
import i18n from "i18n-js"
import axios from "axios"
import {
  GlobalContext,
  GlobalContextInterfaceAsReducer,
  MainContext,
  MainContextInterface,
  TradingContext,
  TradingContextInterfaceAsReducer,
} from "../ContextManager"
import * as StyleLib from "../lib/StyleLib"
import {
  avoidScientificNotation,
  isInList,
  toggleRegisterFavorite,
} from "../lib/FuncLib"
import LineChartComponent from "./trading/LineChartComponent"
import TraderV2 from "./TraderV2"

const Intervals = {
  SIX_HOURS: "6H",
  DAY: "1D",
  WEEK: "7D",
  MONTH: "30D",
  QUARTER: "90D",
}

const trading_dataIntervalListTab = [
  Intervals.SIX_HOURS,
  Intervals.DAY,
  Intervals.WEEK,
  Intervals.MONTH,
  Intervals.QUARTER,
]

interface ChartCallbackElements {
  percentage: string
  color: string
}

const screenWidth =
  Platform.OS === "android"
    ? Dimensions.get("window").width * 0.95
    : Dimensions.get("window").width
const screenHeight = Dimensions.get("window").height

const Trading: React.FC = () => {
  const gc = useContext(GlobalContext) as GlobalContextInterfaceAsReducer
  const mc = useContext(MainContext) as MainContextInterface
  const tc = useContext(TradingContext) as TradingContextInterfaceAsReducer
  const [tradingdatainterval, settradingdatainterval] = useState<any>("1D") //linechart
  const [sparkline, setSparkline] = useState<any>(null)
  const [scope, setScope] = useState<number>(1)
  const [processing, setProcessing] = useState<boolean>(false)
  const [dynamicPercentage, setDynamicPercentage] =
    useState<ChartCallbackElements | null>(null)

  useEffect(() => {
    let mounted = true
    if (!processing) {
      if (mounted) {
        setProcessing(true)
      }
      getSparkline(scope).then((data) => {
        if (mounted && data) {
          setSparkline(data)
          setProcessing(false)
        }
      })
    }
    return () => {
      mounted = false
    }
  }, [scope])

  const getSparkline = async (param: number) => {
    const rightnow = Math.round(new Date().getTime() / 1000)
    let interval = param
    if (interval < 1) {
      interval = 0.5
    }
    interval *= 86400
    const ago = Math.round(
      new Date((rightnow - interval) * 1000).getTime() / 1000
    )
    const currency = "usd"
    const id = tc.state?.id === "feel" ? "celo" : tc.state?.id
    try {
      let result = await axios.get(
        `https://api----redacted----${id}${currency}${ago}${rightnow}`
      )
      let res = result.data.prices
      let only_prices = []
      for (let i = 0; i < res.length; i++) {
        only_prices.push(res[i][1])
      }
      while (only_prices.length > 48) {
        if (only_prices.length > 128) {
          for (let i = 0; i < only_prices.length - 6; i++) {
            only_prices.splice(i + 1, 3)
          }
        } else {
          for (let i = 0; i < only_prices.length - 4; i++) {
            if (only_prices.length > 48) {
              only_prices.splice(i + 1, 1)
            }
          }
        }
      }
      only_prices.push(tc.state!.current_price)
      return only_prices
    } catch (e) {
      return null
    }
  }

  const _openURL = () => {
    tc.state?.id === "feel"
      ? Linking.openURL(Env.feelcoinUrl)
      : Linking.openURL(`https://api----redacted----${tc.state?.id}`)
  }

  const setTradingIntervalFilter = (i: string) => {
    if (processing) {
      return
    }
    switch (i) {
      case Intervals.SIX_HOURS:
        setScope(0.25)
        break
      case Intervals.DAY:
        setScope(1)
        break
      case Intervals.WEEK:
        setScope(7)
        break
      case Intervals.MONTH:
        setScope(30)
        break
      case Intervals.QUARTER:
        setScope(90)
        break
    }
    settradingdatainterval(i)
  }

  const parseLegend = (): string => {
    switch (tradingdatainterval) {
      case Intervals.SIX_HOURS:
        return tc.state?.name + " " + i18n.t("since_6h")
      case Intervals.DAY:
        return tc.state?.name + " " + i18n.t("since_d")
      case Intervals.WEEK:
        return tc.state?.name + " " + i18n.t("since_w")
      case Intervals.MONTH:
        return tc.state?.name + " " + i18n.t("since_m")
      case Intervals.QUARTER:
        return tc.state?.name + " " + i18n.t("since_3m")
      default:
        return tc.state?.name + " since " + tradingdatainterval
    }
  }

  const commonItem = (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        width: screenWidth,
        justifyContent: "space-between",
        marginBottom: 5,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginLeft: Platform.OS === "android" ? 5 : 10,
        }}
      >
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 6,
            backgroundColor: "white",
            marginLeft: 5,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Image
            source={{ uri: tc.state!.image }}
            style={{ width: 18, height: 18, borderRadius: 4 }}
          />
        </View>
        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
            color: StyleLib.textColor(gc.state.env.darkmode!),
            marginLeft: 5,
          }}
        >
          {tc.state?.name}
        </Text>
        <Text
          style={{
            fontSize: 14,
            fontWeight: "bold",
            color: StyleLib.subTextColor_bis(gc.state.env.darkmode!),
            marginLeft: 3,
            alignSelf: "flex-start",
            paddingTop: 2,
          }}
        >
          {i18n.t("rank")} #{tc.state?.market_cap_rank}
        </Text>
      </View>
      <View>
        <TouchableOpacity
          onPress={() =>
            toggleRegisterFavorite(
              gc.state.auth.userEmail!,
              [...mc.user.fav],
              mc.user.referrals.length,
              tc.state!.name
            )
          }
          style={[
            {
              width: 24,
              height: 24,
              borderRadius: 5,
              borderWidth: 2,
              justifyContent: "center",
              alignItems: "center",
              marginRight: 10,
            },
            isInList(mc.user.fav, tc.state!.name)
              ? { borderColor: "#BCAB34" }
              : { borderColor: "#519ABA" },
          ]}
        >
          {isInList(mc.user.fav, tc.state!.name) ? (
            <Image
              source={require("../assets/icons/1x/bell_on.png")}
              style={{ width: 18, height: 18, tintColor: "#BCAB34" }}
            />
          ) : (
            <Image
              source={require("../assets/icons/1x/bell_off.png")}
              style={{ width: 18, height: 18, tintColor: "#519ABA" }}
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  )

  const wrappedItem = (
    <View
      style={{
        paddingBottom: Platform.OS === "ios" ? 30 : 70,
        paddingHorizontal: 5,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View style={{ marginLeft: 5, flexDirection: "row" }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
              color: StyleLib.textColor(gc.state.env.darkmode!),
            }}
          >
            ${avoidScientificNotation(tc.state!.current_price)}
          </Text>
          {Boolean(dynamicPercentage) && (
            <Text
              style={{
                fontSize: 12,
                fontWeight: "bold",
                color: dynamicPercentage!.color,
              }}
            >
              {dynamicPercentage!.percentage}
            </Text>
          )}
        </View>
        <Text
          style={{
            fontSize: 14,
            fontWeight: "bold",
            color: StyleLib.containerRadiusColor(gc.state.env.darkmode!),
            marginRight: 5,
          }}
        >
          {i18n.t("crnt_avg_m_price")}{" "}
        </Text>
      </View>
      <LineChartComponent
        str_legend={parseLegend()}
        sparkline={sparkline}
        intervalListTab={trading_dataIntervalListTab}
        callback_IntervalFilter={(e: string) => setTradingIntervalFilter(e)}
        callback_percentage={(e: ChartCallbackElements) =>
          setDynamicPercentage(e)
        }
        data_interval={tradingdatainterval}
        decimalAnchor={tc.state?.current_price ?? 0}
        overrideDecimal={false}
      />
      <TraderV2
        coinname={tc.state!.name}
        coinprice={tc.state!.current_price}
        coinsymbol={tc.state!.symbol.toUpperCase()}
        coinIcon={tc.state!.image}
      />
      {mc.rewarded_ad_available ? (
        <TouchableOpacity
          onPress={() => mc.show_ad()}
          style={{
            width: screenWidth - 20,
            height: 60,
            marginVertical: 5,
            padding: 5,
            borderRadius: 5,
            backgroundColor: StyleLib.rewarded_ad_btn_dynamicColor(true),
            justifyContent: "center",
            alignItems: "center",
            alignSelf: "center",
          }}
        >
          <Image
            source={require("../assets/icons/1x/gift3.png")}
            style={{
              width: 20,
              height: 20,
              alignSelf: "center",
              marginBottom: 5,
            }}
          />
          <Text
            style={{
              fontSize: 17,
              fontWeight: "700",
              color: StyleLib.rewarded_ad_btn_dynamicTextColor(true),
            }}
          >
            {i18n.t("random_reward_pre") + " " + i18n.t("random_reward_suf")}
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={() => mc.show_rewarded_ad_error_message()}
          style={{
            width: screenWidth - 20,
            height: 45,
            marginVertical: 5,
            padding: 5,
            borderRadius: 5,
            backgroundColor: StyleLib.rewarded_ad_btn_dynamicColor(false),
            justifyContent: "center",
            alignItems: "center",
            alignSelf: "center",
          }}
        >
          <Text
            style={{
              fontSize: 17,
              fontWeight: "700",
              color: StyleLib.rewarded_ad_btn_dynamicTextColor(false),
            }}
          >
            {i18n.t("reward_er1")}
          </Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={{
          width: screenWidth - 20,
          backgroundColor: "#E2E6E8",
          height: 50,
          borderRadius: 5,
          alignItems: "center",
          flexDirection: "row",
          paddingHorizontal: 10,
          justifyContent: "center",
          alignSelf: "center",
        }}
        onPress={() => _openURL()}
      >
        <Text style={{ color: "#289c48", fontSize: 18, fontWeight: "bold" }}>
          {i18n.t("more_about_pre")} {tc.state!.name} {i18n.t("more_about_suf")}
        </Text>
      </TouchableOpacity>
    </View>
  )

  if (!tc.state) {
    return <></>
  }

  if (Platform.OS === "ios") {
    return (
      <View
        style={{
          flex: 1,
          paddingTop: 10,
          backgroundColor: StyleLib.bgColor(gc.state.env.darkmode!),
        }}
      >
        {commonItem}
        {wrappedItem}
      </View>
    )
  } else if (Platform.OS === "android") {
    return (
      <View
        style={{
          flex: 1,
          paddingTop: 10,
          backgroundColor: StyleLib.bgColor(gc.state.env.darkmode!),
        }}
      >
        <View
          style={{
            height: screenHeight - StyleLib.bottom_tab_nav_Height(),
            alignItems: "center",
            justifyContent: "flex-start",
          }}
        >
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            keyboardVerticalOffset={160}
            behavior={"height"}
          >
            <ScrollView>
              {commonItem}
              {wrappedItem}
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </View>
    )
  } else {
    return <></>
  }
}

export default Trading
