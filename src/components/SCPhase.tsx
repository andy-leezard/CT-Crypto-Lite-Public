import React, { useContext } from "react"
import I18n from "i18n-js"
import { View, ScrollView, Text } from "react-native"
import Env from "../env.json"
import { GlobalContext, GlobalContextInterfaceAsReducer, MainContext, MainContextInterface } from "../ContextManager"
import { bgColor, containerColor, textColor } from "../lib/StyleLib"
import { bottom_tab_nav_Height } from "../lib/Constants"

interface Props {
  route: any
  navigation: any
}

const SCPhase: React.FC<Props> = ({ route, navigation }) => {
  const gc = useContext(GlobalContext) as GlobalContextInterfaceAsReducer
  const mc = useContext(MainContext) as MainContextInterface
  const locale = I18n.currentLocale()

  const displayDate = () => {
    try {
      let year = Env.lastUpdated_year
      let month = Env.lastUpdated_month
      let day = Env.lastUpdated_day
      return new Date(year, month - 1, day).toLocaleDateString(locale)
    } catch (e) {
      return new Date(2022, 1, 17).toLocaleDateString(locale)
    }
  }

  return (
    <ScrollView style={{ backgroundColor: bgColor(gc.state.env.darkmode!) }}>
      <View
        style={{
          alignItems: "center",
          flex: 1,
          marginBottom: bottom_tab_nav_Height + mc.bottomInset + mc.banner_ad_height,
          paddingHorizontal: 10,
        }}
      >
        <View
          style={{
            borderRadius: 10,
            backgroundColor: containerColor(gc.state.env.darkmode!),
            paddingHorizontal: 10,
            paddingVertical: 5,
          }}
        >
          <Text
            style={{
              color: textColor(gc.state.env.darkmode!),
              fontSize: 20,
              fontWeight: "700",
              marginBottom: 5,
            }}
          >
            {I18n.t("scphase._1")}
          </Text>
          <Text
            style={{
              color: textColor(gc.state.env.darkmode!),
              fontSize: 15,
              fontWeight: "500",
              marginLeft: 10,
            }}
          >
            {I18n.t("version")} {Env.currentVersion} ({displayDate()})
          </Text>
          <Text
            style={{
              color: textColor(gc.state.env.darkmode!),
              fontSize: 15,
              fontWeight: "500",
              marginLeft: 10,
            }}
          >
            {I18n.t("scphase._2")} :
          </Text>
          <Text
            style={{
              color: textColor(gc.state.env.darkmode!),
              fontSize: 15,
              fontWeight: "500",
              marginLeft: 15,
            }}
          >
            {" "}
            - {I18n.t("scphase._2_1")}
          </Text>
          <Text
            style={{
              color: textColor(gc.state.env.darkmode!),
              fontSize: 15,
              fontWeight: "500",
              marginLeft: 15,
            }}
          >
            {" "}
            - {I18n.t("scphase._2_2")}
          </Text>
          <Text
            style={{
              color: textColor(gc.state.env.darkmode!),
              fontSize: 20,
              fontWeight: "700",
              marginTop: 5,
              marginBottom: 5,
            }}
          >
            {I18n.t("scphase._3")}
          </Text>
          <Text
            style={{
              color: textColor(gc.state.env.darkmode!),
              fontSize: 16,
              fontWeight: "500",
              marginLeft: 10,
            }}
          >
            {I18n.t("scphase._3_1")}
          </Text>
          <Text
            style={{
              color: textColor(gc.state.env.darkmode!),
              fontSize: 15,
              fontWeight: "500",
              marginLeft: 10,
            }}
          >
            {I18n.t("scphase._3_2")}
          </Text>
          <Text
            style={{
              color: textColor(gc.state.env.darkmode!),
              fontSize: 20,
              fontWeight: "700",
              marginTop: 5,
              marginBottom: 5,
            }}
          >
            {I18n.t("contact")}
          </Text>
          <Text
            style={{
              color: textColor(gc.state.env.darkmode!),
              fontSize: 15,
              fontWeight: "500",
              marginLeft: 10,
            }}
          >
            {I18n.t("scphase._4")}
          </Text>
          <Text
            style={{
              color: textColor(gc.state.env.darkmode!),
              fontSize: 15,
              fontWeight: "500",
              marginLeft: 15,
            }}
          >
            {" "}
            - {I18n.t("scphase._4_1")}
          </Text>
          <Text
            style={{
              color: textColor(gc.state.env.darkmode!),
              fontSize: 15,
              fontWeight: "500",
              marginLeft: 15,
            }}
          >
            {" "}
            - {I18n.t("scphase._4_2")}
          </Text>
          <Text
            style={{
              color: textColor(gc.state.env.darkmode!),
              fontSize: 15,
              fontWeight: "500",
              marginLeft: 10,
            }}
          >
            {I18n.t("scphase._5")}
          </Text>
        </View>
      </View>
    </ScrollView>
  )
}

export default SCPhase
