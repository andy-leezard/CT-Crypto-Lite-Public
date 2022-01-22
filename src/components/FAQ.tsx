import React, { useEffect, useState, useContext } from "react"
import { Text, View, ScrollView } from "react-native"
import { db } from "../../firebase"
import Env from "../env.json"
import I18n from "i18n-js"
import { GlobalContext, GlobalContextInterfaceAsReducer, MainContext, MainContextInterface } from "../ContextManager"
import { DocumentSnapshot } from "@firebase/firestore-types"
import { bgColor, containerColor, textColor } from "../lib/StyleLib"
import { bottom_tab_nav_Height } from "../lib/Constants"

interface Props {
  route: any
  navigation: any
}

const FAQ: React.FC<Props> = ({ route, navigation }) => {
  const gc = useContext(GlobalContext) as GlobalContextInterfaceAsReducer
  const mc = useContext(MainContext) as MainContextInterface
  const [proCommission, setProCommission] = useState<number>(0.3)
  const [defaultCommission, setDefaultCommission] = useState<number>(1)
  const [supported_cryptos, setSupportedCryptos] = useState<number>(1000)

  useEffect(() => {
    db.collection("globalEnv")
      .doc("commission")
      .get()
      .then((doc: DocumentSnapshot) => {
        const data = doc.data()!
        setDefaultCommission(data.as_percentage_default ?? 1)
        setProCommission(data.as_percentage_pro ?? 0.3)
        setSupportedCryptos(data.supported_cryptos ?? 1000)
      })
      .catch(() => {
        setDefaultCommission(1)
        setProCommission(0.3)
        setSupportedCryptos(1000)
      })
  }, [])

  return (
    <ScrollView style={{ backgroundColor: bgColor(gc.state.env.darkmode!) }}>
      <View
        style={{
          alignItems: "center",
          flex: 1,
          marginBottom: bottom_tab_nav_Height + mc.bottomInset + mc.banner_ad_height,
          paddingHorizontal: 10,
          paddingVertical: 10,
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
            {I18n.t("p_faq.q1")}
          </Text>
          <Text
            style={{
              color: textColor(gc.state.env.darkmode!),
              fontSize: 15,
              fontWeight: "500",
              marginLeft: 10,
            }}
          >
            - {I18n.t("p_faq.a1_1")}
          </Text>
          <Text
            style={{
              color: textColor(gc.state.env.darkmode!),
              fontSize: 15,
              fontWeight: "500",
              marginLeft: 10,
            }}
          >
            - {I18n.t("p_faq.a1_2")}
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
            {I18n.t("p_faq.q2")}
          </Text>
          <Text
            style={{
              color: textColor(gc.state.env.darkmode!),
              fontSize: 15,
              fontWeight: "500",
              marginLeft: 10,
            }}
          >
            - {I18n.t("p_faq.a2")}
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
            {I18n.t("p_faq.q3")}
          </Text>
          <Text
            style={{
              color: textColor(gc.state.env.darkmode!),
              fontSize: 15,
              fontWeight: "500",
              marginLeft: 10,
            }}
          >
            - {I18n.t("p_faq.a3")}
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
            {I18n.t("p_faq.q4")}
          </Text>
          <Text
            style={{
              color: textColor(gc.state.env.darkmode!),
              fontSize: 15,
              fontWeight: "500",
              marginLeft: 10,
            }}
          >
            - {I18n.t("p_faq.a4_1")}
          </Text>
          <Text
            style={{
              color: textColor(gc.state.env.darkmode!),
              fontSize: 15,
              fontWeight: "500",
              marginLeft: 10,
            }}
          >
            - {I18n.t("p_faq.a4_2")}
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
            {I18n.t("p_faq.q5")}
          </Text>
          <Text
            style={{
              color: textColor(gc.state.env.darkmode!),
              fontSize: 15,
              fontWeight: "500",
              marginLeft: 10,
            }}
          >
            - {I18n.t("p_faq.a5_1")}
          </Text>
          <Text
            style={{
              color: textColor(gc.state.env.darkmode!),
              fontSize: 15,
              fontWeight: "500",
              marginLeft: 15,
            }}
          >
            - {I18n.t("p_faq.a5_2")}
          </Text>
          <Text
            style={{
              color: textColor(gc.state.env.darkmode!),
              fontSize: 15,
              fontWeight: "500",
              marginLeft: 15,
            }}
          >
            - {I18n.t("p_faq.a5_3")}
          </Text>
          <Text
            style={{
              color: textColor(gc.state.env.darkmode!),
              fontSize: 15,
              fontWeight: "500",
              marginLeft: 15,
            }}
          >
            - {I18n.t("p_faq.a5_4")}
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
            {I18n.t("p_faq.q6")}
          </Text>
          <Text
            style={{
              color: textColor(gc.state.env.darkmode!),
              fontSize: 15,
              fontWeight: "500",
              marginLeft: 10,
            }}
          >
            - {I18n.t("p_faq.a6_1")}
          </Text>
          <Text
            style={{
              color: textColor(gc.state.env.darkmode!),
              fontSize: 15,
              fontWeight: "500",
              marginLeft: 10,
            }}
          >
            - {I18n.t("p_faq.a6_2")}
          </Text>
          <Text
            style={{
              color: textColor(gc.state.env.darkmode!),
              fontSize: 15,
              fontWeight: "500",
              marginLeft: 10,
            }}
          >
            - {I18n.t("p_faq.a6_3")}
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
            {I18n.t("p_faq.q7")}
          </Text>
          <Text
            style={{
              color: textColor(gc.state.env.darkmode!),
              fontSize: 15,
              fontWeight: "500",
              marginLeft: 10,
            }}
          >
            - {I18n.t("p_faq.a7_1_pre")}
            {Env.currentVersion}
            {I18n.t("p_faq.a7_1_suf")}
          </Text>
          <Text
            style={{
              color: textColor(gc.state.env.darkmode!),
              fontSize: 15,
              fontWeight: "500",
              marginLeft: 10,
            }}
          >
            - {I18n.t("p_faq.a7_2")}
          </Text>
          <Text
            style={{
              color: textColor(gc.state.env.darkmode!),
              fontSize: 15,
              fontWeight: "500",
              marginLeft: 10,
            }}
          >
            - {I18n.t("p_faq.a7_3")}
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
            {I18n.t("p_faq.q8")}
          </Text>
          <Text
            style={{
              color: textColor(gc.state.env.darkmode!),
              fontSize: 15,
              fontWeight: "500",
              marginLeft: 10,
            }}
          >
            - {I18n.t("p_faq.a8_1")}
          </Text>
          <Text
            style={{
              color: textColor(gc.state.env.darkmode!),
              fontSize: 15,
              fontWeight: "500",
              marginLeft: 10,
            }}
          >
            - {I18n.t("p_faq.a8_2")}
          </Text>
          <Text
            style={{
              color: textColor(gc.state.env.darkmode!),
              fontSize: 15,
              fontWeight: "500",
              marginLeft: 10,
            }}
          >
            - {I18n.t("p_faq.a8_3")}
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
            {I18n.t("p_faq.q9")}
          </Text>
          <Text
            style={{
              color: textColor(gc.state.env.darkmode!),
              fontSize: 15,
              fontWeight: "500",
              marginLeft: 10,
            }}
          >
            - {I18n.t("p_faq.a9_1")}
          </Text>
          <Text
            style={{
              color: textColor(gc.state.env.darkmode!),
              fontSize: 15,
              fontWeight: "500",
              marginLeft: 10,
            }}
          >
            - {I18n.t("p_faq.a9_2")}
          </Text>
          <Text
            style={{
              color: textColor(gc.state.env.darkmode!),
              fontSize: 15,
              fontWeight: "500",
              marginLeft: 10,
            }}
          >
            - {I18n.t("p_faq.a9_3")}
          </Text>
          <Text
            style={{
              color: textColor(gc.state.env.darkmode!),
              fontSize: 15,
              fontWeight: "500",
              marginLeft: 10,
            }}
          >
            - {I18n.t("p_faq.a9_4")} : {defaultCommission}%
          </Text>
          <Text
            style={{
              color: textColor(gc.state.env.darkmode!),
              fontSize: 15,
              fontWeight: "500",
              marginLeft: 10,
            }}
          >
            - {I18n.t("p_faq.a9_5")} : {proCommission}%
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
            {I18n.t("p_faq.q10")}
          </Text>
          <Text
            style={{
              color: textColor(gc.state.env.darkmode!),
              fontSize: 15,
              fontWeight: "500",
              marginLeft: 10,
            }}
          >
            - {I18n.t("p_faq.a10_1_pre")} {supported_cryptos} {I18n.t("p_faq.a10_1_mid")} {supported_cryptos}.{" "}
            {I18n.t("p_faq.a10_1_suf")}
          </Text>
          <Text
            style={{
              color: textColor(gc.state.env.darkmode!),
              fontSize: 15,
              fontWeight: "500",
              marginLeft: 10,
            }}
          >
            - {I18n.t("p_faq.a10_2")}
          </Text>
          <Text
            style={{
              color: textColor(gc.state.env.darkmode!),
              fontSize: 15,
              fontWeight: "500",
              marginLeft: 10,
            }}
          >
            - {I18n.t("p_faq.a10_3_pre")} {supported_cryptos} {I18n.t("p_faq.a10_3_suf")}
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
            {I18n.t("p_faq.q11")}
          </Text>
          <Text
            style={{
              color: textColor(gc.state.env.darkmode!),
              fontSize: 15,
              fontWeight: "500",
              marginLeft: 10,
            }}
          >
            - {I18n.t("p_faq.a11")}
          </Text>
        </View>
      </View>
    </ScrollView>
  )
}

export default FAQ
