import React, { useContext, useEffect, useState } from "react"
import { Text, View } from "react-native"
import {
  GlobalContext,
  GlobalContextInterfaceAsReducer,
} from "../../ContextManager"
import { ViewMode } from "../../lib/Types"
import i18n from "i18n-js"
import { avoidScientificNotation, displayVolume } from "../../lib/FuncLib"
import Loading from "../Loading"
import { buyColor, sellColor, subTextColor_bis } from "../../lib/StyleLib"

interface Props {
  i: any
  viewmode: string
  datainterval: any
}

interface Data {
  display: string
  activeColor24price: string
  asString24price: string
  data_unavailable: boolean
  loading: boolean
}

const PriceChange: React.FC<Props> = ({ i, datainterval, viewmode }) => {
  const gc = useContext(GlobalContext) as GlobalContextInterfaceAsReducer
  const [data, setData] = useState<Data>({
    display: "",
    activeColor24price: "#E2E2E2",
    asString24price: "",
    data_unavailable: false,
    loading: true,
  })

  useEffect(() => {
    let change1h =
      i.price_change_percentage_1h_in_currency ??
      (i.price_change_percentage_1h_in_currency !== null ? NaN : null)
    let change7d =
      i.price_change_percentage_7d_in_currency ??
      (i.price_change_percentage_7d_in_currency !== null ? NaN : null)
    let change14d =
      i.price_change_percentage_14d_in_currency ??
      (i.price_change_percentage_14d_in_currency !== null ? NaN : null)
    let change30d =
      i.price_change_percentage_30d_in_currency ??
      (i.price_change_percentage_30d_in_currency !== null ? NaN : null)
    let change200d =
      i.price_change_percentage_200d_in_currency ??
      (i.price_change_percentage_200d_in_currency !== null ? NaN : null)
    let change1y =
      i.price_change_percentage_1y_in_currency ??
      (i.price_change_percentage_1y_in_currency !== null ? NaN : null)
    let price = i.current_price
    let vol = i.market_cap
    let change = i.price_change_percentage_24h
    if (datainterval === i18n.t("inthepast_d")) {
    } else if (datainterval === i18n.t("inthepast_h")) {
      change = change1h
    } else if (datainterval === i18n.t("inthepast_w")) {
      change = change7d
    } else if (datainterval === i18n.t("inthepast_2w")) {
      change = change14d
    } else if (datainterval === i18n.t("inthepast_m")) {
      change = change30d
    } else if (datainterval === i18n.t("inthepast_200")) {
      change = change200d
    } else if (datainterval === i18n.t("inthepast_y")) {
      change = change1y
    }
    let display = ""

    if (viewmode === ViewMode.CAPS) {
      display = displayVolume(vol)
    } else {
      if (Math.round(price) >= 1000 && !gc.state.env.isTablet) {
        price = price / 1000
        price = Math.round(price * 100) / 100
        display = "$" + price.toString() + "K"
      } else {
        let asString = avoidScientificNotation(price)
        display = "$" + asString
      }
    }
    let loading = isNaN(change)
    let data_unavailable = change === null
    change = Math.round(change * 100) / 100
    let asString24price = change.toString()
    let activeColor24price = "#E2E2E2"
    if (data_unavailable || loading) {
      activeColor24price = subTextColor_bis(gc.state.env.darkmode!)
    } else if (change >= 0) {
      asString24price = "+" + asString24price + "%"
      activeColor24price = buyColor(gc.state.env.darkmode!)
    } else {
      asString24price = asString24price + "%"
      activeColor24price = sellColor(gc.state.env.darkmode!)
    }
    setData({
      display: display,
      activeColor24price: activeColor24price,
      asString24price: asString24price,
      data_unavailable: data_unavailable,
      loading: loading,
    })
  }, [i, datainterval, viewmode])

  if (gc.state.env.isTablet) {
    return (
      <View
        style={{
          flexDirection: "row",
          width: gc.state.env.screenWidth / 2,
          justifyContent: "space-between",
        }}
      >
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            marginRight: 15,
          }}
        >
          <Text
            style={{
              color: data.activeColor24price,
              fontWeight: "bold",
              fontSize: 20,
            }}
          >
            {!data.loading && data.display}
          </Text>
        </View>
        <View
          style={{
            backgroundColor: data.activeColor24price,
            borderRadius: 10,
            width: 85,
            height: 34,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {data.loading && <Loading width={15} height={15} />}
          {!data.loading && !data.data_unavailable && (
            <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>
              {data.asString24price}
            </Text>
          )}
          {data.data_unavailable && (
            <Text
              style={{
                fontSize: 12,
                fontWeight: "bold",
                color: subTextColor_bis(gc.state.env.darkmode!),
                textAlign: "right",
              }}
            >
              New
            </Text>
          )}
        </View>
      </View>
    )
  } else {
    return (
      <View style={{ width: gc.state.env.screenWidth / 2.55 }}>
        <Text
          style={{
            color: data.activeColor24price,
            fontSize: 17,
            fontWeight: "bold",
            textAlign: "right",
          }}
        >
          {!data.loading && data.display}
        </Text>
        {data.loading && (
          <View style={{ alignSelf: "flex-end", marginRight: 4 }}>
            <Loading width={15} height={15} />
          </View>
        )}
        {!data.loading && !data.data_unavailable && (
          <Text
            style={{
              fontSize: 12,
              fontWeight: "bold",
              color: data.activeColor24price,
              textAlign: "right",
            }}
          >
            {data.asString24price}
          </Text>
        )}
        {data.data_unavailable && (
          <Text
            style={{
              fontSize: 12,
              fontWeight: "bold",
              color: subTextColor_bis(gc.state.env.darkmode!),
              textAlign: "right",
            }}
          >
            New
          </Text>
        )}
      </View>
    )
  }
}

export default PriceChange
