import React, { useEffect, useState, useContext } from "react"
import { Text } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { createStackNavigator } from "@react-navigation/stack"
import HistoryScreen from "./HistoryScreen"
import Portfolio from "../../../components/Portfolio"
import Loading from "../../../components/Loading"
import I18n from "i18n-js"
import {
  GlobalContext,
  GlobalContextInterfaceAsReducer,
  MainContext,
  MainContextInterface,
  PortfolioContext,
  TradingContext,
  TradingContextInterfaceAsReducer,
} from "../../../ContextManager"
import { textColor } from "../../../lib/StyleLib"
import { post_to_portfolio } from "../../../lib/FuncLib"
import { TotalPortfolio } from "../../../lib/Types"

const Stack = createStackNavigator()

const PortfolioScreen: React.FC = () => {
  const gc = useContext(GlobalContext) as GlobalContextInterfaceAsReducer
  const mc = useContext(MainContext) as MainContextInterface
  const tc = useContext(TradingContext) as TradingContextInterfaceAsReducer
  const [portfolio, setPortfolio] = useState<TotalPortfolio | null>(null)

  useEffect(() => {
    let pf = post_to_portfolio(mc, gc.state.env.darkmode!)
    setPortfolio(pf)
  }, [mc])

  if (portfolio === null) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: textColor(gc.state.env.darkmode!) }}>{I18n.t("s_processing")}...</Text>
        <Loading width={40} height={40} />
      </SafeAreaView>
    )
  }

  const dynamicTitle = () => {
    if (tc.state) {
      return I18n.t("trading")
    }
    if (I18n.currentLocale().includes("en")) {
      return Boolean(mc.user.username[mc.user.username.length - 1] !== "s")
        ? mc.user.username + "'s " + I18n.t("portfolio")
        : mc.user.username + "' " + I18n.t("portfolio")
    } else if (I18n.currentLocale().includes("fr")) {
      return Boolean(
        mc.user.username[0] !== "a" &&
          mc.user.username[0] !== "o" &&
          mc.user.username[0] !== "e" &&
          mc.user.username[0] !== "i" &&
          mc.user.username[0] !== "u"
      )
        ? I18n.t("portfolio") + " de " + mc.user.username
        : I18n.t("portfolio") + " d'" + mc.user.username
    } else {
      return mc.user.username + I18n.t("portfolio")
    }
  }

  return (
    <PortfolioContext.Provider value={{ portfolio: portfolio }}>
      <Stack.Navigator
        initialRouteName="Stack_Portfolio"
        screenOptions={{
          headerShown: true,
          headerStatusBarHeight: 0,
          headerStyle: {
            backgroundColor: gc.state.env.darkmode ? "#000000" : "#FFFFFF",
          },
          headerTitleStyle: { color: textColor(gc.state.env.darkmode!) },
          headerTintColor: textColor(gc.state.env.darkmode!),
        }}
      >
        <Stack.Screen name="Stack_Portfolio" options={{ title: `${dynamicTitle()}` }} component={Portfolio} />
        <Stack.Screen
          name="Stack_History"
          options={{ title: `${I18n.t("history")}`, headerBackTitle: I18n.t("cancel") }}
          component={HistoryScreen}
        />
      </Stack.Navigator>
    </PortfolioContext.Provider>
  )
}

export default PortfolioScreen
