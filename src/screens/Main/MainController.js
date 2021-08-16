import React, {useEffect, useState} from 'react'
import { StyleSheet, View, Platform, Text, TextInput, TouchableOpacity, Alert, ImageBackground } from 'react-native';
import { Image } from 'react-native-elements';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useColorScheme } from "react-native-appearance";
import { StatusBar } from 'expo-status-bar';
import Env from '../../env.json';
import { db, auth } from '../../../firebase';
import SettingsScreen from './screens/SettingsScreen';
import PricesScreen from './screens/PricesScreen';
import PortfolioScreen from './screens/PortfolioScreen';
import LoadingScreen from '../Auth/LoadingScreen';
import axios from 'axios';
import WelcomeScreen from '../Auth/WelcomeScreen';

const Tab = createBottomTabNavigator();

const android_banner = "ca-app-pub-2294308974784218/5447463023";
const ios_banner = "ca-app-pub-2294308974784218/9054168564";

const android_banner_test = "ca-app-pub-xxxxxxxxxxxxxxx/xxxxxxxx";
const ios_banner_test = "ca-app-pub-xxxxxxxxxxxxxxx/xxxxxxxx";

const MainController = ({coindata, userEmail, changedata, isTablet, override_local_AD_is_test}) => {
    const scheme = useColorScheme();
    const [username, setUsername] = useState('');
    const [pinCode, setPincode] = useState('');
    const [pinAnswer, setPinAnswer] = useState('');
    const [requirePIN, setRequirePIN] = useState(false);
    const [seed, setSeed] = useState(0);
    const [proversion, setProversion] = useState(false);
    const [totalbuyin, setTotalbuyin] = useState();
    const [totalbuyin_const, setTotalbuyin_const] = useState();
    const [pnldate, setPNLdate] = useState();
    const [postData, setPostData] = useState([]);
    const [fav, setFav] = useState([]);
    const [boughtPro, setBoughtPro] = useState();
    const [processing, setProcessing] = useState();
    const [override,setOverride] = useState(false); // override email verification for test purposes (dev acc only)
    const [verifiedEmail, setVerifiedEmail] = useState();
    const [pinValidated,setPinValidated] = useState(false);
    const [bool_AD_is_test, setBool_AD_is_test] = useState();
    const [bannerID, setBannerID] = useState();

    useEffect(() => {
      const interval = setInterval(async() => {
        if(!auth.currentUser?.emailVerified && !override){
          return auth.currentUser?.reload().then(() => {
            let state = auth.currentUser?.emailVerified;
            setVerifiedEmail(state);
            console.log('checked email verification status as ['+state+'] at :'+new Date().toLocaleString())
            if(auth.currentUser?.emailVerified){
              console.log('Email successfully verified at :'+new Date().toLocaleString())
              setOverride(true);
              db.collection('users')
                  .doc(userEmail)
                  .update({override:true})
                  .then(()=>{console.log("MainController - set override true for user : ",userEmail)})
                  .catch(()=>{console.log("Error updating override for user:",userEmail)})
            }
          })
        }else{
          setVerifiedEmail(true);
          return
        }
      }, 3000);
      return () => {clearInterval(interval);};
    })

    useEffect(() => {
      if(override_local_AD_is_test){
        setBannerID(bannerAdId(true));
        setBool_AD_is_test(true);
      }else{
        get_ad_config();
      }
      const funcion_address = 'https://us-central1-xxxxxxxx-xxxxxxx.cloudfunctions.net/optimizeHistory';
      axios.post(funcion_address, { userEmail: userEmail }).then(()=>{console.log("axios post - invoked history optimizer")}).catch((e)=>{console.log("Error occurred while optimizing history:",e);});
    }, [])

    useEffect(() => {
      const ref = db.collection('users').doc(userEmail);
        const unsubscribe = ref.onSnapshot((doc)=>{
            const thepin = doc.data().pin ?? "error";
            const theseed = doc.data().seed;
            const state = doc.data().override ?? false;
            (thepin!=="error") && setPincode(thepin);
            console.log("Main Controller - user snapshot triggered at",new Date().toLocaleString());
            setOverride(state);
            setUsername(doc.data().username);
            setRequirePIN(doc.data().requirepin);
            setSeed(theseed);
            setProversion(doc.data().pro);
            setBoughtPro(doc.data().boughtPro);
            setFav(doc.data().favorites);
            setTotalbuyin(doc.data().totalbuyin);
            setTotalbuyin_const(doc.data().totalbuyin_constant);
            setPNLdate(doc.data().pnldate);
        });
        return unsubscribe;
    }, [userEmail])

    useEffect(() => {
      const query = db.collection('users').doc(userEmail).collection('wallet').where("quantity", ">", 0);
        const unsubscribe = query.onSnapshot((qs)=>{
            const postData_local = [];
            const nameOnly_local = ['VUSD'];
              qs.forEach((doc) => {
                postData_local.push({ ...doc.data(), id: doc.id, symbol:doc.data().symbol ?? doc.id });
                nameOnly_local.push(doc.id);
                // doc.data() is never undefined for query doc snapshots
                //console.log("Where quantity higher than 0 :", doc.id);
              });
              console.log("Main Controller - wallet snapshot triggered at",new Date().toLocaleString());
              //let postData = _.cloneDeep(postData_local);
              postData_local.push({quantity:seed,id:'vusd'});
              setPostData(postData_local);
        })
      return unsubscribe;
    }, [seed])

    const get_ad_config = () => {
      db.collection('globalEnv').doc('ad_controller').get().then((doc)=>{
        let override = doc.data().always_test ?? false;
        console.log("Main Controller - AD config : banner id test status is : ",override);
        setBool_AD_is_test(override);
        setBannerID(bannerAdId(override));
      }).catch((e)=>{
        console.log("error fetching server ad config because:",e);
        setBool_AD_is_test(true);
        setBannerID(bannerAdId(true));
      });
    }

    const handlePinAnswer = (i) => {
      setPinAnswer(i);
      if(!pinValidated && i===pinCode){
        setPinValidated(true);
      }
    }

    const bannerAdId = (test) => {
      if(test){
        //console.log("called test banner id for", Platform.OS);
        return (Platform.OS === 'ios') ? ios_banner_test:android_banner_test;
      }else{
        //console.log("WARNING - called an actual banner id for", Platform.OS);
        return (Platform.OS === 'ios') ? ios_banner:android_banner;
      }
    }
    const dynamicHeight = () => {
      return (Platform.OS === 'ios') ? 100:65;
    }
    const bool_isDarkMode = () => {
      return scheme === "dark";
    }
    const bgColor = () => {
      return bool_isDarkMode() ? "#000000":"#FFFFFF";
    }
    const brandColor = () => {
      return bool_isDarkMode() ? Env.brandText_Dark:Env.brandText_Light;
    }
    const focusedColor = () => {
      return bool_isDarkMode() ? Env.tab_focus_Dark:Env.tab_focus_Light;
    }
    const unfocusedColor = () => {
      return bool_isDarkMode() ? "#dbdbdb":"#454545";
    }
    const firebaseSignOut = () => {
      auth.signOut();
    }
    const tryQueryPin = () => {
      Alert.alert(
        "PIN Recovery","Your request will be sent to your email address",
      [
          { text: "Confirm", onPress: () =>  queryPIN() },
          { text: "Cancel", style: "cancel"}
      ]);
    }
    const queryPIN = () => {
      setProcessing(true);
      Alert.alert(
          "PIN Recovery",("Your request has been sent to your email address : "+userEmail),
        [{ text: "OK",}]
      );
      const funcion_address = 'https://us-central1-xxxxxxxx-xxxxxx.cloudfunctions.net/whatsMyPIN';
      axios.post(funcion_address, { userEmail: userEmail })
      .then(console.log)
      .catch(console.log)
      .finally(()=>{setProcessing(false);})
    }


    if(requirePIN && pinAnswer!==pinCode && !pinValidated){
        return(
          <ImageBackground source={require('../../assets/bg/bg.png')} style={[styles.container,{width:"100%",height:"100%"}]}>
              <StatusBar style="auto"/>
              <View style={{marginBottom:100,justifyContent:"center", alignItems:"center"}}>
                <View>
                    <Image
                    source={require('../../assets/icon_rounded.png')}
                    style={{width:40,height:40,marginBottom:5,marginTop:80,}}
                    />
                </View>
                <Text style={[{color:"#FFFFFF",fontSize:24,fontWeight:"bold",textShadowColor:brandColor(),textShadowOffset:{width: 1, height: 1},textShadowRadius:6},(Platform.OS === 'ios') && {marginTop:5}]}>Hello, {username}!</Text>
                <View style={{width:300, alignItems:"center",marginTop:50}}>
                  <TextInput
                      style={[styles.input,{backgroundColor: 'rgba(0,0,0,0.25)'}]}
                      autoFocus={true}
                      placeholder="PIN code"
                      secureTextEntry={true}
                      placeholderTextColor={"#CCCCCC"}
                      keyboardType="numeric"
                      value={pinAnswer}
                      onChangeText={handlePinAnswer}
                      maxLength = {8}
                  />
                </View>
                {!processing && <TouchableOpacity style={{marginBottom:40}} onPress={tryQueryPin} disabled={processing}>
                  <Text style={{color:"white",fontSize:14,fontWeight:"800",marginTop:20, alignSelf:"center",textShadowColor:brandColor(),textShadowOffset:{width: 1, height: 1},textShadowRadius:4}}>Need help ?</Text>
                </TouchableOpacity>}
                <TouchableOpacity onPress={firebaseSignOut}>
                  <Text style={{color:"white",fontSize:14,fontWeight:"600",marginBottom:70, alignSelf:"center"}}>Try a different ID</Text>
                </TouchableOpacity>
                
                <View style={{alignItems:"center",marginTop:50}}>
                    <Text style={{color:"#FFFFFF",fontSize:14,fontWeight:"600",textShadowColor:brandColor(),textShadowOffset:{width: 1, height: 1},textShadowRadius:4,marginTop:20}}>© 2021 | Developed by Andy Lee</Text>
                    <Text style={{color:"#FFFFFF",fontSize:14,fontWeight:"600",textShadowColor:brandColor(),textShadowOffset:{width: 1, height: 1},textShadowRadius:4,marginTop:10}}>{Env.currentVersion}</Text>
                </View>
              </View>
          </ImageBackground>
        )
    }

    if(postData.length<1 || typeof verifiedEmail !== "boolean" || typeof bool_AD_is_test !== "boolean" || typeof bannerID !== "string"){
      return(
        <LoadingScreen/>
      )
    }

    if(!override && !verifiedEmail && typeof verifiedEmail === "boolean"){
      return(
        <WelcomeScreen username={username} email={userEmail}/>
      )
    }

    return (
      <Tab.Navigator
        initialRouteName="Prices"
        tabBarOptions={{
          showLabel: false,
          style: {
            position: "absolute",
            elevation: 0,
            backgroundColor: bgColor(),
            height: dynamicHeight(),
          },
          keyboardHidesTabBar: true,
        }}
      >
        <Tab.Screen
          name="Prices"
          //component={PricesScreen}
          children={()=><PricesScreen userEmail={userEmail} fav={fav} coindata={coindata} changeData={changedata} ispro={proversion} bannerID={bannerID} upgraded={boughtPro} isTablet={isTablet}/>}
          options={{
            tabBarIcon:({ focused }) => (
              <View style={{alignItems: "center", justifyContent: "center",width:40}}>
                <Image
                  source={require("../../assets/icons/1x/prices.png")}
                  resizeMode="contain"
                  style={{
                    width: 20,
                    height: 20,
                    tintColor: focused ? focusedColor() : unfocusedColor(),
                  }}
                />
                <Text
                  style={{color:focused ? focusedColor() : unfocusedColor(), fontSize: 10}}
                >
                  Prices
                </Text>
              </View>
            )
          }}
        />
        <Tab.Screen
          name="Portfolio" //component={TradingScreen}
          children={()=><PortfolioScreen userEmail={userEmail} username={username} seed={seed} coindata={coindata} postData={postData} totalbuyin={totalbuyin} totalbuyin_const={totalbuyin_const} pnldate={pnldate} ispro={proversion} bannerID={bannerID} upgraded={boughtPro} isTablet={isTablet}/>}
          options={{
            tabBarIcon: ({ focused }) => (
              <View style={{ alignItems: "center", justifyContent: "center"}}>
                <Image
                  source={require("../../assets/icons/1x/portfolio.png")}
                  resizeMode="contain"
                  style={{
                    width: 40,
                    height: 40,
                    tintColor: focused ? focusedColor() : unfocusedColor(),
                  }}
                />
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="Settings" //component={PortfolioScreen}
          children={()=><SettingsScreen userEmail={userEmail} username={username} requirePIN={requirePIN} ispro={proversion} bannerID={bannerID} boughtPro={boughtPro}/>}
          options={{
            tabBarIcon:({ focused }) => (
              <View style={{alignItems: "center", justifyContent: "center",width:40}}>
                <Image
                  source={require("../../assets/icons/1x/settings.png")}
                  resizeMode="contain"
                  style={{
                    width: 20,
                    height: 20,
                    tintColor: focused ? focusedColor() : unfocusedColor(),
                  }}
                />
                <Text
                  style={{color:focused ? focusedColor() : unfocusedColor(), fontSize: 10}}
                >
                  Settings
                </Text>
              </View>
            )
          }}
        />
      </Tab.Navigator>
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
