import React, { useContext } from "react"
import { StyleSheet, View, Image } from "react-native"
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs"
import Chat from "./social/Chat"
import Friends from "./social/Friends"
import SocialSettings from "./social/SocialSettings"
import i18n from "i18n-js"
import { focusedColor, unfocusedColor } from "../lib/StyleLib"
import { GlobalContext, GlobalContextInterfaceAsReducer } from "../ContextManager"
const Tab = createMaterialTopTabNavigator()

const SocialController: React.FC<{}> = () => {
  const gc = useContext(GlobalContext) as GlobalContextInterfaceAsReducer
  return (
    <Tab.Navigator
      initialRouteName="Social_Friends"
      screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 45,
        },
      }}
    >
      <Tab.Screen
        name="Social_Friends"
        options={{
          title: i18n.t("social.connections"),
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <Image
                source={require("../assets/icons/1x/settings.png")}
                resizeMode="contain"
                style={{
                  width: 18,
                  height: 18,
                  tintColor: focused ? focusedColor(gc.state.env.darkmode!) : unfocusedColor(gc.state.env.darkmode!),
                }}
              />
            </View>
          ),
        }}
        component={Friends}
      />
      <Tab.Screen
        name="Social_Chat"
        options={{
          title: i18n.t("social.chatrooms"),
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <Image
                source={require("../assets/icons/1x/chat3.png")}
                resizeMode="contain"
                style={{
                  width: 18,
                  height: 18,
                  tintColor: focused ? focusedColor(gc.state.env.darkmode!) : unfocusedColor(gc.state.env.darkmode!),
                }}
              />
            </View>
          ),
        }}
        component={Chat}
      />
      <Tab.Screen
        name="Social_Settings"
        options={{
          title: i18n.t("settings"),
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <Image
                source={require("../assets/icons/1x/more.png")}
                resizeMode="contain"
                style={{
                  width: 18,
                  height: 18,
                  tintColor: focused ? focusedColor(gc.state.env.darkmode!) : unfocusedColor(gc.state.env.darkmode!),
                }}
              />
            </View>
          ),
        }}
        component={SocialSettings}
      />
    </Tab.Navigator>
  )
}

export default SocialController

const styles = StyleSheet.create({})
