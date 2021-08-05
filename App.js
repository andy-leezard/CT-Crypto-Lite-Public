import React, { useState, useEffect } from 'react';
import 'react-native-gesture-handler';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createStackNavigator } from "@react-navigation/stack";
import { AppearanceProvider, useColorScheme } from "react-native-appearance";

import { auth } from './firebase';

import LoadingScreen from './src/screens/Auth/LoadingScreen';
import LoginScreen from './src/screens/Auth/LoginScreen';
import ApprovalScreen from './src/screens/Auth/ApprovalScreen';
import RegisterScreen from './src/screens/Auth/RegisterScreen';

import axios from 'axios';
import stablecoins from './src/stablecoins.json';
import _ from 'lodash';
import MainController from './src/screens/Main/MainController';

const Stack = createStackNavigator();

const globalScreenOptions ={ headerShown: false }

const baseapi = "https://baseapi";
const baseapi_global = "https://baseapi_global";
const uri_fiatcoin = "https://uri_fiatcoin";
const fiatcoin = {"id":"vusd","symbol":"vusd","name":"vusd","image":uri_fiatcoin,"current_price":1};

export default function App() {
  const [initialized,setInitialized] = useState(false);
  const [user, setUser] = useState([]);
  const scheme = useColorScheme();
  const [globalCoinData, setGlobalCoinData] = useState([]);
  const [prop_change, setProp_change] = useState([]);

  useEffect(() => {
    if(!initialized){
      setInitialized(true);
      auth.onAuthStateChanged((authUser)=>{
          console.log("App.JS - defining user status...");
          (authUser && user.length===0) ? setUser(authUser):setUser(Array());
      });
      fetchDataFromAPI();
    }
    const interval = setInterval(() => {
      fetchDataFromAPI();
      console.log("App.JS - fetching coin data...");
    }, 60000);
    return () => {clearInterval(interval);};
  })

  const fetchDataFromAPI = () => {
    Promise.all([_coindata(),_changedata()])
      .then((res) => {
        setGlobalCoinData(res[0]);
        setProp_change(res[1]);
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
        let thedata = res.data.filter(i => !stablecoins.some(item => item.name === i.name));
        thedata.push(fiatcoin);
        resolve(thedata);
        console.log("successfully fetched coin data.");
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
        let btcd = res.data.data.market_cap_percentage.btc;
        let ethd = res.data.data.market_cap_percentage.eth;
        let usdtd = res.data.data.market_cap_percentage.usdt;
        btcd = Math.round(btcd * 100) / 100;
        ethd = Math.round(ethd * 100) / 100;
        usdtd = Math.round(usdtd * 100) / 100;
        btcd = addZeroes(btcd);
        ethd = addZeroes(ethd);
        usdtd = addZeroes(usdtd);
        percentage = Math.round(percentage * 100) / 100;
        const asString = () => {return (percentage>=0) ? ("+"+percentage.toString()+"%"):(percentage.toString()+"%")}
        const color = () => {return (percentage>=0) ? "#4ed46f":"#FF4343";}
        resolve({"market":asString(),"btcd":(btcd.toString()+"%"),
          "ethd":(ethd.toString()+"%"),"usdtd":(usdtd.toString()+"%"),"color":color()}
        );
        console.log("APP.JS Global change API fetched at :"+new Date().toLocaleString());
      })
      .catch(reject);
    })
  }

  function addZeroes(num) {
    return num.toFixed(Math.max(((num+'').split(".")[1]||"").length, 2));
  }

  if(!initialized || globalCoinData.length===0 || prop_change.length===0){//loading
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
          </Stack.Navigator>
        </NavigationContainer>
      </AppearanceProvider>
    )
  }
  

  return (
    <AppearanceProvider>
      <NavigationContainer theme={scheme === "dark" ? DarkTheme : DefaultTheme}>
        <MainController userEmail={user.email} coindata={globalCoinData} changedata={prop_change}/>
      </NavigationContainer>
    </AppearanceProvider>
  );
}