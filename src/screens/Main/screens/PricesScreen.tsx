import React, { useContext } from "react"
import { createStackNavigator } from "@react-navigation/stack"
import Prices from "../../../components/Prices"
import GlobalDetails from "../../../components/GlobalDetails"
import i18n from "i18n-js"
import {
  GlobalContext,
  GlobalContextInterfaceAsReducer,
} from "../../../ContextManager"
import { textColor } from "../../../lib/StyleLib"

const Stack = createStackNavigator()

const PricesScreen: React.FC = () => {
  const gc = useContext(GlobalContext) as GlobalContextInterfaceAsReducer

  return (
    <Stack.Navigator
      initialRouteName="Stack_Prices"
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
      <Stack.Screen
        name="Stack_Prices"
        options={{ headerShown: false }}
        component={Prices}
      />
      <Stack.Screen
        name="Stack_Prices_Global"
        options={{
          title: i18n.t("global_details"),
          headerBackTitle: i18n.t("cancel"),
        }}
        component={GlobalDetails}
      />
    </Stack.Navigator>
  )
}

export default PricesScreen
