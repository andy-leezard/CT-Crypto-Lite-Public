import React, { useContext } from "react"
import I18n from "i18n-js"
import { Text, View, TouchableOpacity, ScrollView, Image } from "react-native"
import TNC from "./TNC"
import { GlobalContext, GlobalContextInterfaceAsReducer, MainContext, MainContextInterface } from "../ContextManager"
import {} from "../lib/Types"
import { bgColor, containerColor, textColor } from "../lib/StyleLib"
import { bottom_tab_nav_Height } from "../lib/Constants"

interface Props {
  route: any
  navigation: any
}

const TNCPhase: React.FC<Props> = ({ route, navigation }) => {
  const gc = useContext(GlobalContext) as GlobalContextInterfaceAsReducer
  const mc = useContext(MainContext) as MainContextInterface

  return (
    <View
      style={{
        paddingHorizontal: 20,
        flex: 1,
        paddingVertical: 10,
        marginBottom: bottom_tab_nav_Height + mc.bottomInset + mc.banner_ad_height,
        backgroundColor: bgColor(gc.state.env.darkmode!),
      }}
    >
      <TouchableOpacity onPress={() => navigation.navigate("Stack_Settings_AR")}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 15 }}>
          <Text
            style={{
              flexWrap: "wrap",
              fontSize: 18,
              fontWeight: "bold",
              letterSpacing: 0.5,
              color: textColor(gc.state.env.darkmode!),
            }}
          >
            {I18n.t("delete_acc")}
          </Text>
          <Image
            source={require("../assets/icons/1x/arrow_darkmode.png")}
            style={[{ width: 10, height: 10 }, !gc.state.env.darkmode! && { tintColor: "#000000" }]}
          />
        </View>
      </TouchableOpacity>
      <View style={{ flex: 1 }}>
        <ScrollView
          style={{
            borderRadius: 10,
            backgroundColor: containerColor(gc.state.env.darkmode!),
            paddingHorizontal: 10,
            paddingVertical: 5,
          }}
        >
          <TNC textColor={textColor(gc.state.env.darkmode!)} />
          <View style={{ height: 20 }} />
        </ScrollView>
      </View>
    </View>
  )
}

export default TNCPhase
