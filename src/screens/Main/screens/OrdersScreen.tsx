import React, { useContext } from "react"
import { StyleSheet } from "react-native"
import { createStackNavigator } from "@react-navigation/stack"
import i18n from "i18n-js"
import { GlobalContext, GlobalContextInterfaceAsReducer } from "../../../ContextManager"
import { textColor } from "../../../lib/StyleLib"
import OrdersController from "../../../components/OrdersController"

const Stack = createStackNavigator()

const OrdersScreen: React.FC<{}> = () => {
  const gc = useContext(GlobalContext) as GlobalContextInterfaceAsReducer

  return (
    <Stack.Navigator
      initialRouteName="Stack_Settings"
      screenOptions={{
        headerTitleStyle: { color: textColor(gc.state.env.darkmode!) },
        headerTintColor: textColor(gc.state.env.darkmode!),
      }}
    >
      <Stack.Screen name="Stack_Settings" options={{ title: i18n.t("orders.title") }} component={OrdersController} />
    </Stack.Navigator>
  )
}

export default OrdersScreen

const styles = StyleSheet.create({})
