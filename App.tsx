
import React, { useEffect, useMemo, useReducer } from 'react';
import { GlobalContext } from './src/StateManager';
import { app_reducer, Enum_app_actions, app_reducer_init } from './src/lib/Reducers';
import { User } from '@firebase/auth-types'
import { DocumentSnapshot } from '@firebase/firestore-types'
import { storeTheme, themeToBoolean, themeToString } from './src/lib/StyleLib';

import { StatusBar } from 'expo-status-bar';
import { setTestDeviceIDAsync } from 'expo-ads-admob';
import * as Device from 'expo-device';
import * as Localization from 'expo-localization';

import 'react-native-gesture-handler';
import { Platform, Alert } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createStackNavigator } from "@react-navigation/stack";
import { useColorScheme } from "react-native-appearance"; //AppearanceProvider
import AsyncStorage from '@react-native-async-storage/async-storage';

import LoadingScreen from './src/screens/Auth/LoadingScreen';
import LoginScreen from './src/screens/Auth/LoginScreen';
import ApprovalScreen from './src/screens/Auth/ApprovalScreen';
import RegisterScreen from './src/screens/Auth/RegisterScreen';
import TestScreen from './src/screens/Auth/TestScreen';
import Reset_PW_Screen from './src/screens/Auth/Reset_PW_Screen';

import MainController from './src/screens/Main/MainController';

import I18n from 'i18n-js';
import Translations from './src/translations.json';

import { db, auth } from './firebase';

import Env from './src/env.json';
import { storeLanguage } from './src/lib/FuncLib';

const api_test = false;

const Stack = createStackNavigator();
const globalScreenOptions ={ headerShown: false }

I18n.translations = {
  en: Translations.en,
  fr: Translations.fr,
  ko: Translations.ko,
};
I18n.fallbacks = true;

declare global {
  interface String {
    replaceAt: (index:number,replacement:string) => string;
  }
}

String.prototype.replaceAt = function(index, replacement):string {
  return this.substr(0, index) + replacement + this.substr(index + replacement.length);
}

const App:React.FC = () => {
  const [appState, appDispatch] = useReducer(app_reducer, app_reducer_init);
  const scheme = useColorScheme();

  const loaded = useMemo<boolean>(()=>{
    return !Boolean(appState.env.isTablet === null || appState.env.darkmode === null || appState.serverSide.maintenance)
  }, [appState])
  
  const _updateLog = (mail:string|null):void => {
    if(mail){
      db.collection('users')
        .doc(mail)
        .update({lastActicity:new Date().toUTCString(),platform:Platform.OS})
        .then(()=>{console.log("APP.JS - user log updated"+new Date().toLocaleString());})
        .catch(()=>{console.log("Error updating timestamp for user :",mail)})
    }
  }

  const setTestDevice = async ():Promise<void> => {
    await setTestDeviceIDAsync('EMULATOR');
    console.log("emulator async setTestDevice - App.Js");
  }

  const detectDeviceType = async ():Promise<void> => {
    try{
      let _res:any = await Device.getDeviceTypeAsync()
      console.log("Device type : ", _res);
      appDispatch({type:Enum_app_actions.SET_TABLET_MODE,payload:Boolean(_res===2)})
    }catch(e){
      console.log("Error fetching device type ! : ", e);
      appDispatch({type:Enum_app_actions.SET_TABLET_MODE,payload:false})
    }
  }

  const server_fallback = ():void => {
    appDispatch({type:Enum_app_actions.SYNCHRONIZE,payload:{
      r_interval: Env.default_RI,
      r_interval_g: Env.default_RIG,
      f_c_render: true,
      maintenance: false,
    }})
  }

  const retrieveAsyncStorage = async ():Promise<void> => {
    console.log("Localization.locale :", Localization.locale);
    try{
      const lang = await AsyncStorage.getItem('language');
      const _theme = await AsyncStorage.getItem('theme');
      if(lang){
        appDispatch({type:Enum_app_actions.SET_LANG,payload:lang})
        console.log("lang : ",lang);
        I18n.locale = lang;
      }else{
        console.log("language not found, trying to store language value ... : ");
        appDispatch({type:Enum_app_actions.SET_LANG,payload:Localization.locale})
        storeLanguage(Localization.locale);
      }
      if(_theme){
        appDispatch({type:Enum_app_actions.SET_THEME,payload:themeToBoolean(_theme)})
      }else{
        console.log("theme not found, trying to initialize theme value ... : ");
        storeTheme(scheme);
        appDispatch({type:Enum_app_actions.SET_THEME,payload:themeToBoolean(scheme)})
      }
    }catch(e){
        console.log("Error fetching language value : ",e);
        I18n.locale = Localization.locale;
    }
  }

  useEffect(() => {
    Env.Test_ads && setTestDevice();
    console.log("app.js - Env.Test_ads is [",Env.Test_ads,"] !");
    const authListener = auth.onAuthStateChanged((authUser:User|null)=>{
      console.log("App.JS - defining user status...");
      appDispatch({type:Enum_app_actions.SET_USER,payload:authUser});
      if(authUser){
        appDispatch({type:Enum_app_actions.SET_USEREMAIL,payload:authUser.email});
        _updateLog(authUser.email);
      }else{
        appDispatch({type:Enum_app_actions.SET_USEREMAIL,payload:null});
      }
    });
    detectDeviceType();retrieveAsyncStorage();

    const ref = db.collection('globalEnv').doc('variables');
    const unsubscribe = ref.onSnapshot((doc:DocumentSnapshot)=>{
        if(doc.exists){
          const fields = doc.data()!;
          console.log("App.js - global env snapshot triggered at",new Date().toLocaleString());
          let value = fields.refresh_interval ?? Env.default_RI;
          let value_g = fields.refresh_interval_g ?? Env.default_RIG;
          if(value<30000){value = 30000;} //minimum interval
          const fcr = fields.force_client_render ?? true;
          const server_maintenance = fields.server_maintenance ?? false;
          if(fcr){
            console.log("App.js - forcing client-side rendering with interval : ",value);
          }else{
            console.log("App.js - using server-side rendering.");
          }
          if(server_maintenance){
            Alert.alert(
              I18n.t('server_maintenance'),
              I18n.t('msg_maintenance'),
              [
                { text: I18n.t('ok')},
              ]);
          }
          appDispatch({type:Enum_app_actions.SYNCHRONIZE,payload:{
            r_interval: value,
            r_interval_g: value_g,
            f_c_render: fcr,
            maintenance: server_maintenance
          }})
        }else{
          console.log("App.js - Tried global env snapshot but the document does not exist");
          server_fallback();
        }
    },(e:any)=>{
      console.log("App.js - Global env snapshot caught an error : ",e);
      server_fallback();
    });
    return () => {
      authListener();
      unsubscribe();
    };
  }, [])

  if(!loaded){
    return(
      <GlobalContext.Provider value={{state: appState, dispatch: appDispatch}}>
        <LoadingScreen maintenance={appState.serverSide.maintenance} reloadable={false}/>
      </GlobalContext.Provider>
    )
  }

  if(api_test){
    return(
      <GlobalContext.Provider value={{state: appState, dispatch: appDispatch}}>
        <TestScreen />
        <StatusBar style={'dark'}/>
      </GlobalContext.Provider>
    )
  }

  if(appState.auth.user === null || appState.auth.userEmail === null){
    return(
      <GlobalContext.Provider value={{state: appState, dispatch: appDispatch}}>
        <NavigationContainer theme={appState.env.darkmode ? DarkTheme : DefaultTheme}>
          <Stack.Navigator initialRouteName="Login" screenOptions={globalScreenOptions}>
            <Stack.Screen name='Loading' component={LoadingScreen}/>
            <Stack.Screen name='Login' component={LoginScreen}/>
            <Stack.Screen name='Approval' component={ApprovalScreen}/>
            <Stack.Screen name='Register' component={RegisterScreen}/>
            <Stack.Screen name='Test' component={TestScreen}/>
            <Stack.Screen name='PW' component={Reset_PW_Screen}/>
          </Stack.Navigator>
        </NavigationContainer>
        <StatusBar style={'dark'}/>
      </GlobalContext.Provider>
    )
  }
  
  return (
    <GlobalContext.Provider value={{state: appState, dispatch: appDispatch}}>
      <NavigationContainer theme={appState.env.darkmode ? DarkTheme : DefaultTheme}>
        <MainController/>
      </NavigationContainer>
      <StatusBar style={themeToString(!appState.env.darkmode)}/>
    </GlobalContext.Provider>
  );
}

export default App
