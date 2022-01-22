import React, { useContext } from "react"
import { createStackNavigator } from "@react-navigation/stack"
import Settings from "../../../components/Settings"
import TNCPhase from "../../../components/TNCPhase"
import SCPhase from "../../../components/SCPhase"
import AccountRemover from "../../../components/AccountRemover"
import AdRemover from "../../../components/AdRemover"
import FAQ from "../../../components/FAQ"
import LanguageChanger from "../../../components/LanguageChanger"
import i18n from "i18n-js"
import { GlobalContext, GlobalContextInterfaceAsReducer } from "../../../ContextManager"
import { textColor } from "../../../lib/StyleLib"
import MyRewards from "../../../components/settings/anp/MyRewards"
import Referrals from "../../../components/settings/anp/Referrals"

const Stack = createStackNavigator()

const PricesScreen: React.FC = () => {
  const gc = useContext(GlobalContext) as GlobalContextInterfaceAsReducer

  return (
    <Stack.Navigator
      initialRouteName="Stack_Settings"
      screenOptions={{
        headerShown: true,
        headerStatusBarHeight: 0,
        headerStyle: {
          backgroundColor: gc.state.env.darkmode ? "#000000":"#FFFFFF"
        },
        headerTitleStyle: { color: textColor(gc.state.env.darkmode!) },
        headerTintColor: textColor(gc.state.env.darkmode!),
      }}
    >
      <Stack.Screen name="Stack_Settings" options={{ title: i18n.t("settings") }} component={Settings} />
      <Stack.Screen name="Stack_Settings_TNC" options={{ title: i18n.t("d_tnc") }} component={TNCPhase} />
      <Stack.Screen name="Stack_Settings_FAQ" options={{ title: i18n.t("faq") }} component={FAQ} />
      <Stack.Screen name="Stack_Settings_RF" options={{ title: i18n.t("tier_n_referrals") }} component={Referrals} />
      <Stack.Screen name="Stack_Settings_MR" options={{ title: i18n.t("my_rewards") }} component={MyRewards} />
      <Stack.Screen name="Stack_Settings_L" options={{ title: i18n.t("language") }} component={LanguageChanger} />
      <Stack.Screen name="Stack_Settings_SC" options={{ title: i18n.t("about") }} component={SCPhase} />
      <Stack.Screen
        name="Stack_Settings_AR"
        options={{ title: i18n.t("advanced_options"), headerBackTitle: i18n.t("cancel") }}
        component={AccountRemover}
      />
      <Stack.Screen name="Stack_Settings_UP" options={{ title: i18n.t("title_upgrade") }} component={AdRemover} />
    </Stack.Navigator>
  )
}

export default PricesScreen
