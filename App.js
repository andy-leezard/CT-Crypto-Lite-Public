import React, { useState, useEffect } from 'react';
import 'react-native-gesture-handler';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createStackNavigator } from "@react-navigation/stack";
import { AppearanceProvider, useColorScheme } from "react-native-appearance";

import { db, auth } from './firebase';
import * as firebase from "firebase";

import LoadingScreen from './src/screens/Auth/LoadingScreen';
import LoginScreen from './src/screens/Auth/LoginScreen';
import ApprovalScreen from './src/screens/Auth/ApprovalScreen';
import RegisterScreen from './src/screens/Auth/RegisterScreen';

import axios from 'axios';
import _ from 'lodash';
import MainController from './src/screens/Main/MainController';
import TestScreen from './src/screens/Auth/TestScreen';
import * as Device from 'expo-device';
import Reset_PW_Screen from './src/screens/Auth/Reset_PW_Screen';
import { setTestDeviceIDAsync } from 'expo-ads-admob';
import Env from './src/env.json';

const override_local_AD_is_test = (Env.Test_ads ?? "false") === "true" ? true:false;

const Stack = createStackNavigator();
const globalScreenOptions ={ headerShown: false }

const baseapi = "baseapi";
const baseapi2 = "baseapi2";
const baseapi3 = "baseapi3";
const baseapi4 = "baseapi4";
const baseapi_global = "baseapi_global";
const uri_fiatcoin = Env.fiatCoinIcon;
const fiatcoin = {"id":"vusd","symbol":"vusd","name":"vusd","image":uri_fiatcoin,"current_price":1};
const uri_feelcoin = "https://firebasestorage.googleapis.com/v0/b/xxx/delisted.png?alt=media&token=xxxx-xxxx-xxxx-xxxx-xxxxxxxX";

export default function App() {
  const [initialized,setInitialized] = useState(false);
  const [user, setUser] = useState([]);
  const scheme = useColorScheme();
  const [globalCoinData, setGlobalCoinData] = useState([]);
  const [prop_change, setProp_change] = useState([]);
  const [isTablet, setIsTablet] = useState();

  useEffect(() => {
    override_local_AD_is_test && setTestDevice();
    console.log("app.js - override_local_AD_is_test is [",override_local_AD_is_test,"] !");
    console.log("app.js - Env.Test_ads is [",Env.Test_ads,"] !");
    auth.onAuthStateChanged((authUser)=>{
      console.log("App.JS - defining user status...");
      (authUser && user !== authUser) ? setUser(authUser):initializeAuth();
    });
    detectDeviceType();
  }, [])

  useEffect(() => {
    if(!initialized){
      setInitialized(true);
      fetchDataFromAPI();
    }
    const interval = setInterval(() => {
      if(auth.currentUser){
        console.log("There is a user. Update timestamp.")
        db.collection('users')
        .doc(auth.currentUser.email)
        .update({lastActicity:firebase.firestore.FieldValue.serverTimestamp()})
        .then(()=>{console.log("updated timestamp.")})
        .catch(()=>{console.log("Error updating timestamp.")})

      }
      console.log("App.JS - fetching coin data...");
    }, 60000);
    return () => {clearInterval(interval);};
  })

  const setTestDevice = async()=>{
    await setTestDeviceIDAsync('EMULATOR');
    console.log("emulator async useEffect - App.Js");
  }
  const initializeAuth = () => {
    setUser(Array());
  }
  const fetchDataFromAPI = () => {
    Promise.all([_coindata(),_coindata_page2(),_coindata_page3(),_coindata_page4(),_changedata()])
      .then((res) => {
        let _arr = [...res[0],...res[1],...res[2],...res[3]];
        setGlobalCoinData(_arr);
        setProp_change(res[4]);
      })
      .catch((err)=>{
        setGlobalCoinData(Array());
        setProp_change(Array());
        console.warn(err);
      });
  }
  const _coindata = () => {
    return new Promise((resolve,reject)=>{
      axios
      .get(baseapi)
      .then(function(res){
        let thedata = res.data;
        let celo = _.cloneDeep(thedata.find(i => i.symbol ==="celo"));
        celo.id='feel';celo.name = 'Feel coin';celo.symbol = 'FEEL';celo.image = uri_feelcoin;
        thedata.push(celo);
        thedata.push(fiatcoin);
        resolve(thedata);
        console.log("successfully fetched coin data.");
      })
      .catch(reject);
    })
  }
  const _coindata_page2 = () => {
    return new Promise((resolve,reject)=>{
      axios
      .get(baseapi2)
      .then(function(res){
        resolve(res.data);
        console.log("successfully fetched coin data_page2.");
      })
      .catch(reject);
    })
  }
  const _coindata_page3 = () => {
    return new Promise((resolve,reject)=>{
      axios
      .get(baseapi3)
      .then(function(res){
        resolve(res.data);
        console.log("successfully fetched coin data_page2.");
      })
      .catch(reject);
    })
  }
  const _coindata_page4 = () => {
    return new Promise((resolve,reject)=>{
      axios
      .get(baseapi4)
      .then(function(res){
        resolve(res.data);
        console.log("successfully fetched coin data_page2.");
      })
      .catch(reject);
    })
  }
  const _changedata = () => {
    return new Promise((resolve,reject)=>{
      axios
      .get(baseapi_global)
      .then(function(res){
        let percentage = res.data.data.market_cap_change_percentage_24h_usd;
        let caps = res.data.data.market_cap_percentage;
        resolve({
          "data":res.data.data,
          "color":dynamicColor(percentage),"market":asString(round_it(percentage)),
          "btcd":(addZeroes(round_it(caps.btc))+"%"),"ethd":(addZeroes(round_it(caps.eth))+"%"),"usdtd":(addZeroes(round_it(caps.usdt))+"%"),
        });
        console.log("APP.JS Global change API fetched at :"+new Date().toLocaleString());
      })
      .catch(reject);
    })
  }
  const detectDeviceType = async() => {
    let _res = await Device.getDeviceTypeAsync()
    console.log("Device type : ", _res);
    setIsTablet(_res);
  }

  const round_it = (i) => {return Math.round(i * 100) / 100;}
  const asString = (i) => {return (i>=0) ? ("+"+addZeroes(i)+"%"):(addZeroes(i)+"%")}
  const dynamicColor = (i) => {return (i>=0) ? "#49c467":"#FF4343";}
  function addZeroes(num) {
    return num.toFixed(Math.max(((num+'').split(".")[1]||"").length, 2));
  }

  if(!initialized || globalCoinData.length===0 || prop_change.length===0 || !isTablet){//loading
    return(
      <AppearanceProvider>
        <LoadingScreen/>
      </AppearanceProvider>
    )
  }

  if(user.length===0){
    return(
      <AppearanceProvider>
        <NavigationContainer theme={scheme === "dark" ? DarkTheme : DefaultTheme}>
          <Stack.Navigator initialRouteName="Login" screenOptions={globalScreenOptions}>
            <Stack.Screen options={{title:"Loading"}} name='Loading' component={LoadingScreen}/>
            <Stack.Screen options={{title:"Sign in"}} name='Login' component={LoginScreen}/>
            <Stack.Screen options={{title:"Terms & Conditions"}} name='Approval' component={ApprovalScreen}/>
            <Stack.Screen options={{title:"Get started"}} name='Register' component={RegisterScreen}/>
            <Stack.Screen options={{title:"API Test"}} name='Test' component={TestScreen}/>
            <Stack.Screen options={{title:"Reset Password"}} name='PW' component={Reset_PW_Screen}/>
          </Stack.Navigator>
        </NavigationContainer>
      </AppearanceProvider>
    )
  }
  
  return (
    <AppearanceProvider>
      <NavigationContainer theme={scheme === "dark" ? DarkTheme : DefaultTheme}>
        <MainController userEmail={user.email} coindata={globalCoinData} changedata={prop_change} isTablet={isTablet} override_local_AD_is_test={override_local_AD_is_test}/>
      </NavigationContainer>
    </AppearanceProvider>
  );
}