import React, { useEffect, useState, useContext, useReducer } from 'react'
import { GlobalContext, MainContext, TradingContext } from '../../StateManager';
import { DocumentSnapshot } from '@firebase/firestore-types'
import * as StyleLib from '../../lib/StyleLib';
import { GlobalContextInterfaceAsReducer } from '../../lib/Types';
import { StyleSheet, View, Platform, Text, TextInput, TouchableOpacity, Alert, ImageBackground } from 'react-native';
import { Image } from 'react-native-elements';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Env from '../../env.json';
import { db, auth, rdb } from '../../../firebase';
import SettingsScreen from './screens/SettingsScreen';
import PricesScreen from './screens/PricesScreen';
import PortfolioScreen from './screens/PortfolioScreen';
import LoadingScreen from '../Auth/LoadingScreen';
import axios from 'axios';
import WelcomeScreen from '../Auth/WelcomeScreen';
import i18n from 'i18n-js';
import { parse_global_data } from '../../lib/JSFuncLib';
import { BannerAD } from '../../lib/ComponentLib';
import { coin_reducer } from '../../lib/Reducers';

const Tab = createBottomTabNavigator();

const MainController:React.FC = () => {
    const globalContext = useContext<GlobalContextInterfaceAsReducer>(GlobalContext);
    const [coinState, coinDispatch] = useReducer(coin_reducer, null);
    
    const [loaded, setLoaded] = useState<boolean>(false);
    const [username, setUsername] = useState<string>('');
    const [pinCode, setPincode] = useState<string>('');
    const [pinAnswer, setPinAnswer] = useState<string>('');
    const [requirePIN, setRequirePIN] = useState<boolean>(false);
    const [seed, setSeed] = useState<number>(0);
    const [adblock, setAdBlock] = useState(false);
    const [totalbuyin, setTotalbuyin] = useState<number|null>(null);
    const [totalbuyin_const, setTotalbuyin_const] = useState<number|null>(null);
    const [pnldate, setPNLdate] = useState<string>('');
    const [postdata, setPostData] = useState<any[]>([]);
    const [fav, setFav] = useState<any[]>([]);
    const [vip, setVIP] = useState<boolean>(false);
    const [processing, setProcessing] = useState<boolean>(false);
    const [fetching, setFetching] = useState<boolean>(false);
    const [fetching_g, setFetching_g] = useState<boolean>(false);
    const [_override,set_Override] = useState<boolean|null>(null); // override email verification for test purposes (dev acc only)
    const [verifiedEmail, setVerifiedEmail] = useState<boolean|null>(null);
    const [pinValidated,setPinValidated] = useState<boolean>(false);
    const [bannerID, setBannerID] = useState<string|null>(null);
    const [forceRerender, setForceRerender] = useState(false);
    const [coindata, setCoindata] = useState<any>(); // spot
    const [changedata, setChangedata] = useState<any>();
    const [extra, setExtra] = useState<boolean>(false);
    const [usingFullData, setUsingFullData] = useState<boolean>(false);
    const [sentLog, setSentLog] = useState<boolean>(false);

    const get_ad_config = () => {
      db.collection('globalEnv').doc('ad_controller').get().then((doc:DocumentSnapshot)=>{
        const override = doc.data()!.always_test_banner ?? false;
        console.log("Main Controller - AD config : banner id test status is : ",override);
        setBannerID(bannerAdId(override));
      }).catch((e)=>{
        console.log("error fetching server ad config because:",e);
        setBannerID(bannerAdId(true));
      });
    }

    const _getAPI = (api:string) => {
      return new Promise((resolve,reject)=>{
        axios
        .get(api)
        .then((result)=>{
          resolve(result.data);
        })
        .catch(reject);
      })
    }

    const handlePinAnswer = (i:string) => {
      setPinAnswer(i);
      if(!pinValidated && i===pinCode){
        setPinValidated(true);
      }
    }

    const bannerAdId = (test:boolean) => {
      if(test){
        return (Platform.OS === 'ios') ? Env.ios_banner_test:Env.android_banner_test;
      }else{
        return (Platform.OS === 'ios') ? Env.ios_banner:Env.android_banner;
      }
    }
    const tryQueryPin = () => {
      Alert.alert(
        i18n.t('pin_recovery'),i18n.t('pin_recovery_msg'),
      [
          { text: i18n.t('confirm'), onPress: () =>  queryPIN() },
          { text: i18n.t('s_cancel'), style: "cancel"}
      ]);
    }
    const queryPIN = () => {
      setProcessing(true);
      Alert.alert(
        i18n.t('pin_recovery'),(i18n.t('pin_recovery_msg_done') + " : " + globalContext.state.auth.userEmail),
        [{ text: i18n.t('ok'),}]
      );
      const function_address = Env.cfapi_queryPIN;
      axios.post(function_address, { userEmail: globalContext.state.auth.userEmail })
      .then(console.log)
      .catch(console.log)
      .finally(()=>{setProcessing(false);})
    }
    const rerenderCallback = ():void => {
      setForceRerender(true);
    }
    const reloadAll = (all:boolean):void => {
      if(all){
        setExtra(!extra);
        return;
      }else{
        updateGlobalData();
        updatePriceData();
      }
    }
    const setPriceData = (_res:any) => {
      let _arr = [..._res[0],..._res[1],..._res[2],..._res[3]];
      setCoindata(_arr);
    }
    const setGlobalData = (_res:any) => {
      setChangedata(parse_global_data(_res));
    }
    const updateGlobalData = () => {
      if(fetching_g){
        return;
      }else{
        setFetching_g(true);
      }
      const baseapi_global = "https://baseapi_global";
      axios
        .get(baseapi_global)
        .then((res)=>{
          const _res = res.data.data;
          setGlobalData(_res);
          console.log('Main Controller - Global Data fetched at :' +new Date().toLocaleString());
        })
        .catch(console.log)
        .finally(()=>{
          setFetching_g(false);
        })
    }
    const baseapi = (page:number,extended?:boolean):string => {
      return `https://baseapi&page=${page}${(usingFullData||extended)&&'&price_change_percentage=1h%2C7d%2C14d%2C30d%2C200d%2C1y'}`
    }
    const updatePriceData = (extended?:boolean) => {
      if(fetching){
        return;
      }else{
        setFetching(true);
      }
      Promise.all([_getAPI(baseapi(1,extended)),_getAPI(baseapi(2,extended)),_getAPI(baseapi(3,extended)),_getAPI(baseapi(4,extended))])
        .then((result) => {
          setPriceData(result);
          console.log('Main Controller - Refreshed Coin Data at :' +new Date().toLocaleString());
        })
        .catch((e)=>{
          console.log("Main Controller - Could not fetch coin data because : "+e);
        })
        .finally(()=>{
          setFetching(false);
        });
    }
    const useAllData = ():void => {
      if(!usingFullData){
        setUsingFullData(true);
        updatePriceData(true);
      }
    }
    const check_email_verification = async():Promise<void> => {
      console.log("checking if "+ globalContext.state.auth.userEmail +" is a verified email address...")
      if(!auth.currentUser?.emailVerified){
        return auth.currentUser?.reload().then(() => {
          let state = auth.currentUser?.emailVerified ?? false;
          setVerifiedEmail(state);
          console.log('checked email verification status as ['+state+'] at :'+new Date().toLocaleString())
          if(state){
            console.log('Email successfully verified at :'+new Date().toLocaleString())
          }
        })
      }else{
        setVerifiedEmail(true);
        console.log(globalContext.state.auth.userEmail+"is a verified email address")
      }
    }

    useEffect(() => {
      const interval_auth = setInterval(() => {
        (!_override && !verifiedEmail) && check_email_verification();
      }, 3000);
      return () => {
        clearInterval(interval_auth);
      };
    }, [verifiedEmail,_override,extra])

    useEffect(()=>{
      console.log("Main Controller - useEffect with Interval - interval is : ", globalContext.state.serverSide.r_interval, "(coins) and ", globalContext.state.serverSide.r_interval_g," (global).");
      const interval_g = setInterval(() => {
        if(!fetching_g && globalContext.state.serverSide.f_c_render){
          updateGlobalData();
          console.log("Main Controller - useEffect with Interval - trigger update global data");
        }else{
          console.log("Main Controller - useEffect with Interval - did not trigger update global data");
        }
      }, globalContext.state.serverSide.r_interval_g);
      const interval = setInterval(() => {
        if(usingFullData){
          updatePriceData();
          console.log("Main Controller - useEffect with Interval - trigger update price data - using full data");
        }else if(!fetching && globalContext.state.serverSide.f_c_render){
          updatePriceData();
          console.log("Main Controller - useEffect with Interval - trigger update price data");
        }else{
          console.log("Main Controller - useEffect with Interval - did not trigger update price data");
        }
      }, globalContext.state.serverSide.r_interval);
      return () => {
        clearInterval(interval);
        clearInterval(interval_g);
        console.log("Main Controller - useEffect with Interval - cleared intervals");
      };
    }, [globalContext,extra,usingFullData])

    useEffect(() => {
      if(globalContext.state.serverSide.f_c_render){
        updatePriceData();
        updateGlobalData();
      }
      if(Env.Test_ads){
        setBannerID(bannerAdId(true));
      }else{
        get_ad_config();
      }
      const dbRef = rdb.ref('coins'); // deprecated due to expensive costs
      const dbRef_g = rdb.ref('global'); // deprecated due to expensive costs
      const rdb_coins = dbRef.on('value', (snapshot) => {
        if(!fetching && typeof snapshot != "undefined" && !globalContext.state.serverSide.f_c_render){
          const changedPost = snapshot.val();
          if(changedPost){
            setCoindata(changedPost)
            console.log('Main Controller - RDB Snapshot : Coin Data fetched at :' +new Date().toLocaleString());
          }else{
            console.warn('Main Controller - RDB Snapshot : Error : Coin Data undefined :');
          }
        }else{
          console.log('Main Controller - RDB Snapshot triggered for [coin data] but the user chose to manually refresh at :' +new Date().toLocaleString());
        }
      });
      const rdb_global = dbRef_g.on('value', (snapshot) => {
        if(typeof snapshot != "undefined" && !globalContext.state.serverSide.f_c_render && !usingFullData){
          const changedPost = snapshot.val();
          if(changedPost){
            setGlobalData(changedPost)
            console.log('Main Controller - RDB Snapshot : Global Data fetched at :' +new Date().toLocaleString());
          }else{
            console.warn('Main Controller - RDB Snapshot : Error : Global Data undefined :');
          }
        }else{
          console.log('Main Controller - RDB Snapshot triggered for [global data] but the user chose to manually refresh at :' +new Date().toLocaleString());
        }
      });
      return () => {
        rdb_coins;
        rdb_global;
      }
    }, [extra])

    useEffect(() => {
      const ref = db.collection('users').doc(globalContext.state.auth.userEmail!);
      const query = db.collection('users').doc(globalContext.state.auth.userEmail!).collection('wallet').where("quantity", ">", 0);
        const unsubscribe_user = ref.onSnapshot((doc:DocumentSnapshot)=>{
            if(doc.exists){
              const data = doc.data()!;
              console.log("Main Controller - user snapshot triggered at",new Date().toLocaleString());
              let __override = data.override ?? false;
              if(__override){setVerifiedEmail(__override);}
              set_Override(__override);
              setPincode(data.pin ?? "");
              setSeed(data.seed ?? 0);
              setUsername(data.username ?? "Trader");
              setRequirePIN(data.requirepin ?? false);
              setAdBlock(data.pro ?? false);
              setVIP(data.boughtPro ?? false);
              setFav(data.favorites ?? Array());
              setTotalbuyin(data.totalbuyin ?? 0);
              setTotalbuyin_const(data.totalbuyin_constant ?? 0);
              setPNLdate(data.pnldate ?? new Date().getTime());
              setLoaded(true);
            }else{
              console.log("Tried snapshot but the document does not exist");
            }
        });
      const unsubscribe_wallet = query.onSnapshot((qs)=>{
          let postData_local:any[] = [];
          qs.forEach((doc) => {
            postData_local.push({ ...doc.data(), id: doc.id });
            // removed { ... symbol:doc.data().symbol ?? doc.id} cause there is already a symbol fetched from the server
            // doc.data() is never undefined for query doc snapshots
          });
          console.log("Main Controller - wallet snapshot triggered at",new Date().toLocaleString());
          setPostData(postData_local);
      })
      return () => {
        unsubscribe_user();
        unsubscribe_wallet();
      }
    }, [globalContext,extra])//seed,coindata,totalbuyin,totalbuyin_const are not needed cause it is an event listener. it only depends on the userEmail.

    useEffect(() => {
      if(forceRerender){setForceRerender(false);console.log("force rerender")}
    }, [forceRerender])

    if(!loaded || verifiedEmail === null || bannerID === null || !coindata || !changedata){
      return(
        <LoadingScreen reloadable={true} reload={()=>reloadAll(true)}/>
      )
    }

    if(!_override && verifiedEmail === false){
      return(
        <WelcomeScreen username={username} email={globalContext.state.auth.userEmail!}/>
      )
    }

    const adError = (e:any) => {
      console.log("Error showing banner ad ! : ",e);
      if(!sentLog){
          setSentLog(true);
          const timestamp = new Date().toUTCString();
          db.collection('globalEnv').doc('ad_controller').collection('logs').add({type:"Banner",error:e,timestamp:timestamp,reporter:globalContext.state.auth.userEmail});
      }
    }

    const securityScreen = (
      <ImageBackground source={require('../../assets/bg/bg.png')} style={[styles.container,{width:"100%",height:"100%"}]}>
          <View style={{marginBottom:100,justifyContent:"center", alignItems:"center",marginTop:80}}>
            <View>
                <Image
                source={require('../../assets/icon_rounded.png')}
                style={{width:40,height:40,marginBottom:5,}}
                />
            </View>
            <Text style={[{color:"#FFFFFF",fontSize:24,fontWeight:"bold",textShadowColor:StyleLib.brandColor(globalContext.state.env.darkmode!),textShadowOffset:{width: 1, height: 1},textShadowRadius:4},(Platform.OS === 'ios') && {marginTop:5}]}>{i18n.t('hello')}{username}{i18n.t('hello_suf')}</Text>
            <View style={{width:300, alignItems:"center",marginTop:50}}>
              <TextInput
                  style={[styles.input,{backgroundColor: 'rgba(0,0,0,0.25)'}]}
                  autoCorrect={false}
                  autoFocus={true}
                  placeholder={i18n.t('pin_code')}
                  secureTextEntry={true}
                  placeholderTextColor={"#CCCCCC"}
                  keyboardType="numeric"
                  value={pinAnswer}
                  onChangeText={handlePinAnswer}
                  maxLength = {8}
              />
            </View>
            {!processing && <TouchableOpacity style={{marginBottom:50}} onPress={tryQueryPin} disabled={processing}>
              <Text style={{color:"white",fontSize:14,fontWeight:"800",marginTop:20, alignSelf:"center"}}>{i18n.t('needhelp_pin')}</Text>
            </TouchableOpacity>}
            <TouchableOpacity onPress={()=>auth.signOut()}>
              <Text style={{color:"white",fontSize:14,fontWeight:"600",marginBottom:70, alignSelf:"center"}}>{i18n.t("try_diffID")}</Text>
            </TouchableOpacity>
            
            <View style={{alignItems:"center",marginTop:50}}>
                <Text style={{color:"#FFFFFF",fontSize:14,fontWeight:"600",marginTop:20}}>© 2021 | {i18n.t('developed_by')} Andy Lee</Text>
                <Text style={{color:"#FFFFFF",fontSize:14,fontWeight:"600",marginTop:10}}>{Env.currentVersion}</Text>
            </View>
          </View>
      </ImageBackground>
    )

    const body = (
      <Tab.Navigator
        initialRouteName="Prices"
        screenOptions={{
          //tabBarShowLabel: true,
          headerShown: false,
          tabBarStyle: {
            display: coinState ? "none":"flex",
            position: "absolute",
            elevation: 0,
            backgroundColor: StyleLib.bgColor(globalContext.state.env.darkmode!),
            height: StyleLib.bottom_tab_nav_Height(),
          },
          tabBarHideOnKeyboard: true,
          tabBarLabelStyle: {
            bottom:13
          }
        }}
      >
        <Tab.Screen
          name="Prices"
          component={PricesScreen}
          options={{
            tabBarIcon:({ focused }) => (
              <View style={{alignItems: "center", justifyContent: "center"}}>
                <Image
                  source={require("../../assets/icons/1x/prices.png")}
                  resizeMode="contain"
                  style={{
                    width: 18,
                    height: 18,
                    tintColor: focused ? StyleLib.focusedColor(globalContext.state.env.darkmode!) : StyleLib.unfocusedColor(globalContext.state.env.darkmode!),
                  }}
                />
              </View>
            )
          }}
        />
        <Tab.Screen
          name="Portfolio" component={PortfolioScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <View style={{ alignItems: "center", justifyContent: "center"}}>
                <Image
                  source={require("../../assets/icons/1x/portfolio.png")}
                  resizeMode="contain"
                  style={{
                    width: 25,
                    height: 25,
                    tintColor: focused ? StyleLib.focusedColor(globalContext.state.env.darkmode!) : StyleLib.unfocusedColor(globalContext.state.env.darkmode!),
                  }}
                />
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="Settings" component={SettingsScreen}
          options={{
            tabBarIcon:({ focused }) => (
              <View style={{alignItems: "center", justifyContent: "center"}}>
                <Image
                  source={require("../../assets/icons/1x/settings.png")}
                  resizeMode="contain"
                  style={{
                    width: 18,
                    height: 18,
                    tintColor: focused ? StyleLib.focusedColor(globalContext.state.env.darkmode!) : StyleLib.unfocusedColor(globalContext.state.env.darkmode!),
                  }}
                />
              </View>
            )
          }}
        />
      </Tab.Navigator>
    )

    const wrapper = (
      <TradingContext.Provider value={{
        state:coinState,
        dispatch:coinDispatch
      }}>
        {body}
        <BannerAD adblock={adblock} bannerID={bannerID} errorCallback={adError} noMargin={Boolean(coinState)}/>
      </TradingContext.Provider>
    )

    return (
      <MainContext.Provider value={{
        rerender:rerenderCallback,
        extend:useAllData,
        reload:reloadAll,
        fetching:fetching,
        coindata:coindata,
        bannerID:bannerID,
        changedata:changedata,
        vip:vip,
        adblock:adblock,
        requirePIN:requirePIN,
        username:username,
        fav:fav,
        postdata:postdata,
        pnldate:pnldate,
        totalbuyin:totalbuyin,
        totalbuyin_const:totalbuyin_const,
        seed:seed
      }}>
      {(requirePIN && pinAnswer!==pinCode && !pinValidated) ? (securityScreen):((forceRerender) ? (<LoadingScreen reloadable={true} reload={()=>reloadAll(true)}/>):(wrapper))}
      </MainContext.Provider>
    )
}

export default MainController

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: "flex-start",
  },
  input: {
      paddingHorizontal: 10,
      height: 40,
      width: 300,
      margin: 12,
      borderRadius: 10,
      fontSize:20,
      color: "#FFFFFF",
  },
  darkTheme: {
      color: "#FFFFFF",
      backgroundColor: "#333333"
  },
  lightTheme: {
      color: "#000000",
      backgroundColor: "#FFFFFF"
  },
  appButtonContainer:{
      height: 40,
      width:160,
      backgroundColor: "#9772FF",
      borderRadius: 5,
      justifyContent: "center"
  },
  appButtonText:{
      fontSize: 16,
      color:"white",
      fontWeight:"bold",
      alignSelf:"center"
  }
})
