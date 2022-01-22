import React, { useEffect, useMemo, useReducer, useState } from "react"
import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context"
import { GlobalContext } from "./src/ContextManager"
import { app_reducer, Enum_app_actions, app_reducer_init, fallback_serverside_variables } from "./src/lib/Reducers"
import { User } from "@firebase/auth-types"
import { DocumentSnapshot } from "@firebase/firestore-types"
import { storeTheme, themeToBoolean, themeToString } from "./src/lib/StyleLib"

import { StatusBar } from "expo-status-bar"
import { setTestDeviceIDAsync } from "expo-ads-admob"
import * as Device from "expo-device"
import * as Localization from "expo-localization"

import "react-native-gesture-handler"
import { Platform, Alert } from "react-native"
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import AsyncStorage from "@react-native-async-storage/async-storage"

import LoadingScreen from "./src/screens/Auth/LoadingScreen"
import LoginScreen from "./src/screens/Auth/LoginScreen"
import ApprovalScreen from "./src/screens/Auth/ApprovalScreen"
import RegisterScreen from "./src/screens/Auth/RegisterScreen"
import Reset_PW_Screen from "./src/screens/Auth/Reset_PW_Screen"

import MainController from "./src/screens/Main/MainController"
import NotificationManager from "./src/components/NotificationManager"

import I18n from "i18n-js"
import Translations from "./src/translations.json"

import { db, auth } from "./firebase"

import Env from "./src/env.json"
import { storeLanguage, visitAppStore } from "./src/lib/FuncLib"
import { requestTracking } from "./src/lib/JSFuncLib"

const debug = false

const Stack = createStackNavigator()
const globalScreenOptions = { headerShown: false }

I18n.translations = {
  en: Translations.en,
  fr: Translations.fr,
  ko: Translations.ko,
}
I18n.fallbacks = true

declare global {
  interface String {
    replaceAt: (index: number, replacement: string) => string
  }
}

String.prototype.replaceAt = function (index, replacement): string {
  return this.substr(0, index) + replacement + this.substr(index + replacement.length)
}

const App: React.FC = () => {
  const [appState, appDispatch] = useReducer(app_reducer, app_reducer_init)
  const [initialized, setInitialized] = useState(false)

  const loaded = useMemo<boolean>(() => {
    return !Boolean(
      !initialized ||
        appState.env.isTablet === null ||
        appState.env.darkmode === null ||
        appState.env.trackingPermitted === null ||
        appState.serverSide.maintenance ||
        appState.serverSide.currentVersion > Env.currentVersion_incremental
    )
  }, [appState, initialized])

  const _updateLog = async (mail: string): Promise<void> => {
    await db
      .collection("users")
      .doc(mail)
      .update({ lastActivity: new Date().toUTCString(), lastActivityUnix: new Date().getTime(), platform: Platform.OS })
  }

  const setTestDevice = async (): Promise<void> => {
    await setTestDeviceIDAsync("EMULATOR")
    debug && console.log("App.tsx - Emulator setTestDevice - App.Js")
  }

  const detectDeviceType = async (): Promise<void> => {
    try {
      let _res: any = await Device.getDeviceTypeAsync()
      debug && console.log("App.tsx - Device type : ", _res)
      appDispatch({ type: Enum_app_actions.SET_TABLET_MODE, payload: Boolean(_res === 2) })
    } catch (e) {
      debug && console.log("App.tsx - Error fetching device type ! : ", e)
      appDispatch({ type: Enum_app_actions.SET_TABLET_MODE, payload: false })
    }
  }

  const server_fallback = (): void => {
    appDispatch({
      type: Enum_app_actions.SYNCHRONIZE,
      payload: fallback_serverside_variables,
    })
  }

  const retrieveAsyncStorage = async (): Promise<void> => {
    debug && console.log("App.tsx - Localization.locale :", Localization.locale)
    try {
      const lang = await AsyncStorage.getItem("language")
      const _theme = await AsyncStorage.getItem("theme")
      if (lang) {
        appDispatch({ type: Enum_app_actions.SET_LANG, payload: lang })
        debug && console.log("App.tsx - lang : ", lang)
        I18n.locale = lang
      } else {
        debug && console.log("App.tsx - language not found, trying to store language value ... : ")
        appDispatch({ type: Enum_app_actions.SET_LANG, payload: Localization.locale })
        storeLanguage(Localization.locale)
      }
      if (_theme) {
        appDispatch({ type: Enum_app_actions.SET_THEME, payload: themeToBoolean(_theme) })
      } else {
        debug && console.log("App.tsx - theme not found, trying to initialize theme value ... : ")
        storeTheme("dark")
        appDispatch({ type: Enum_app_actions.SET_THEME, payload: themeToBoolean("dark") })
      }
    } catch (e) {
      debug && console.log("App.tsx - Error fetching language value : ", e)
      I18n.locale = Localization.locale
    }
  }

  useEffect(() => {
    Boolean(Env.Test_ads === true) && setTestDevice()
    debug && console.log("App.tsx - Env.Test_ads is [", Env.Test_ads, "] !")
    detectDeviceType()
    retrieveAsyncStorage()
    const authListener = auth.onAuthStateChanged((authUser: User | null) => {
      debug && console.log("App.tsx - defining user status...")
      appDispatch({ type: Enum_app_actions.SET_USER, payload: authUser })
      if (authUser) {
        appDispatch({ type: Enum_app_actions.SET_USEREMAIL, payload: authUser.email })
        authUser.email && _updateLog(authUser.email)
      } else {
        appDispatch({ type: Enum_app_actions.SET_USEREMAIL, payload: null })
      }
      setInitialized(true)
    })
    requestTracking(Boolean(Platform.OS === "android")).then((permission) => {
      appDispatch({ type: Enum_app_actions.PERMIT_TRACKING, payload: permission })
    })

    const ref = db.collection("globalEnv").doc("variables")
    const unsubscribe = ref.onSnapshot(
      (doc: DocumentSnapshot) => {
        if (doc.exists) {
          const fields = doc.data()!
          debug && console.log("App.tsx - global env snapshot triggered at", new Date().toLocaleString())
          //refresh_interval
          let ri = fields.refresh_interval ?? Env.default_RI
          //refresh_interval_global
          let rig = fields.refresh_interval_g ?? Env.default_RIG
          if (ri < 30000) {
            ri = 30000
          } //minimum interval
          const fcr = fields.force_client_render ?? true
          const server_maintenance = fields.server_maintenance ?? false
          const crnt_version = fields.currentVersion ?? 1
          if (fcr) {
            debug && console.log("App.tsx - forcing client-side rendering with interval : ", ri)
          } else {
            debug && console.log("App.tsx - using server-side rendering.")
          }
          if (server_maintenance) {
            Alert.alert(I18n.t("server_maintenance"), I18n.t("msg_maintenance"), [{ text: I18n.t("ok") }])
          } else if (crnt_version > Env.currentVersion_incremental) {
            Alert.alert(I18n.t("new_version_available"), I18n.t("msg_new_version"), [
              { text: I18n.t("ok"), onPress: () => visitAppStore() },
            ])
          }
          appDispatch({
            type: Enum_app_actions.SYNCHRONIZE,
            payload: {
              currentVersion: crnt_version,
              r_interval: ri,
              r_interval_g: rig,
              f_c_render: fcr,
              maintenance: server_maintenance,
            },
          })
        } else {
          debug && console.log("App.tsx - Tried global env snapshot but the document does not exist")
          server_fallback()
        }
      },
      (e: any) => {
        debug && console.log("App.tsx - Global env snapshot caught an error : ", e)
        server_fallback()
      }
    )
    return () => {
      authListener()
      unsubscribe()
    }
  }, [])

  if (!loaded) {
    return (
      <GlobalContext.Provider value={{ state: appState, dispatch: appDispatch }}>
        <LoadingScreen
          darkmode={appState.env.darkmode!}
          maintenance={appState.serverSide.maintenance}
          newVersionRequired={appState.serverSide.currentVersion > Env.currentVersion_incremental}
          reloadable={false}
        />
        <StatusBar style={themeToString(!appState.env.darkmode)} />
      </GlobalContext.Provider>
    )
  }

  if (appState.auth.user === null || appState.auth.userEmail === null) {
    return (
      <GlobalContext.Provider value={{ state: appState, dispatch: appDispatch }}>
        <NavigationContainer theme={appState.env.darkmode ? DarkTheme : DefaultTheme}>
          <Stack.Navigator initialRouteName="Login" screenOptions={globalScreenOptions}>
            <Stack.Screen name="Loading" component={LoadingScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Approval" component={ApprovalScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="PW" component={Reset_PW_Screen} />
          </Stack.Navigator>
        </NavigationContainer>
        <StatusBar style={themeToString(!appState.env.darkmode)} />
      </GlobalContext.Provider>
    )
  }

  return (
    <GlobalContext.Provider value={{ state: appState, dispatch: appDispatch }}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <NavigationContainer theme={appState.env.darkmode ? DarkTheme : DefaultTheme}>
          <MainController />
        </NavigationContainer>
        <StatusBar style={themeToString(!appState.env.darkmode)} />
      </SafeAreaProvider>
      <NotificationManager />
    </GlobalContext.Provider>
  )
}

export default App
