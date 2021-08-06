import React, {useEffect, useState} from 'react'
import { StyleSheet, View, Platform, Text, TextInput, TouchableOpacity } from 'react-native';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAvoidingView } from 'react-native';
import * as firebase from "firebase";

const Tab = createBottomTabNavigator();

const android_banner = "ca-app-pub-2294308974784218/5447463023";
const ios_banner = "ca-app-pub-2294308974784218/9054168564";

const android_banner_test = "ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx";
const ios_banner_test = "ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx";
const bool_AD_is_test = true;

const MainController = ({coindata, userEmail, changedata}) => {
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
    const ref = db.collection('users').doc(userEmail);

    useEffect(() => {
        ref.update({lastActicity:firebase.firestore.FieldValue.serverTimestamp()}).catch((err)=>{console.log(err);})
        const unsubscribe = ref.onSnapshot((doc)=>{
            const thepin = doc.data().pin ?? "error";
            (thepin!=="error") && setPincode(thepin);
            console.log("pin : "+thepin);
            console.log("snapshot triggered at",new Date().toLocaleString());
            setUsername(doc.data().username);
            setRequirePIN(doc.data().requirepin);
            const theseed = doc.data().seed;
            setSeed(theseed);
            setProversion(doc.data().pro);
            setBoughtPro(doc.data().boughtPro);
            setFav(doc.data().favorites);

            const postData_local = [];
            const nameOnly_local = ['VUSD'];
            setTotalbuyin(doc.data().totalbuyin);
            setTotalbuyin_const(doc.data().totalbuyin_constant);
            setPNLdate(doc.data().pnldate);
            ref.collection('wallet').where("quantity", ">", 0).get()
                  .then((querySnapshot) => {
                      querySnapshot.forEach((doc) => {
                          postData_local.push({ ...doc.data(), id: doc.id });
                          nameOnly_local.push(doc.id);
                          // doc.data() is never undefined for query doc snapshots
                          //console.log("Where quantity higher than 0 :", doc.id);
                      });
                      //let postData = _.cloneDeep(postData_local);
                      postData_local.push({quantity:theseed,id:'vusd'});
                      setPostData(postData_local);
                  })
        });
        return unsubscribe;
    }, [coindata, userEmail, changedata])

    const bannerAdId = () => {
      if(bool_AD_is_test){
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
    const focusedColor = () => {
      return bool_isDarkMode() ? Env.brandText_Dark:Env.brandText_Light;
    }
    const textColor = () => {
      return bool_isDarkMode() ? "#FFFFFF":"#000000";
    }
    const subTextColor = () => {
      return bool_isDarkMode() ? "#CCCCCC":"#8F8F8F";
    }
    const firebaseSignOut = () => {
      auth.signOut();
    }

    if(requirePIN && pinAnswer!==pinCode){
        return(
          <SafeAreaView style={{flex:1,backgroundColor:bgColor(),justifyContent:"center", alignItems:"center"}}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
              <StatusBar style="auto"/>
              <View style={{marginBottom:100,justifyContent:"center", alignItems:"center"}}>
                <View>
                    <Image
                    source={require('../../assets/icon.png')}
                    style={[{width:40,height:40},(Platform.OS === 'ios') && {borderRadius:5}]}
                    />
                </View>
                <Text style={{color:focusedColor(),marginBottom:40,fontSize:20,fontWeight:"bold"}}>CoinTracer</Text>
                <View style={{width:300, alignItems:"center"}}>
                  <TextInput
                      style={[styles.input,bool_isDarkMode()?styles.darkTheme:styles.lightTheme]}
                      autoFocus={true}
                      placeholder="PIN code"
                      value={pinAnswer}
                      onChangeText={setPinAnswer}
                      maxLength = {8}
                      placeholderTextColor={subTextColor()}
                  />
                </View>
                <TouchableOpacity style={styles.appButtonContainer} onPress={firebaseSignOut}>
                  <Text style={styles.appButtonText}>Back</Text>
                </TouchableOpacity>
                <View>
                    <Text style={{color:focusedColor(),fontSize:14,fontWeight:"600",marginTop:20, alignSelf:"center"}}>© 2021 | Developed by Andy Lee</Text>
                    <Text style={{color:focusedColor(),fontSize:12,fontWeight:"600",marginTop:10, alignSelf:"center"}}>{Env.currentVersion}</Text>
                </View>
              </View>
            </KeyboardAvoidingView>
          </SafeAreaView>
        )
    }

    if(postData.length<1){
      return(
        <LoadingScreen/>
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
          children={()=><PricesScreen userEmail={userEmail} fav={fav} coindata={coindata} changeData={changedata} ispro={proversion} bannerID={bannerAdId()} upgraded={boughtPro}/>}
          options={{
            tabBarIcon:({ focused }) => (
              <View style={{alignItems: "center", justifyContent: "center",width:40}}>
                <Image
                  source={require("../../assets/icons/1x/prices.png")}
                  resizeMode="contain"
                  style={{
                    width: 20,
                    height: 20,
                    tintColor: focused ? focusedColor() : textColor(),
                  }}
                />
                <Text
                  style={{color:focused ? focusedColor() : textColor(), fontSize: 10}}
                >
                  Prices
                </Text>
              </View>
            )
          }}
        />
        <Tab.Screen
          name="Portfolio" //component={TradingScreen}
          children={()=><PortfolioScreen userEmail={userEmail} username={username} seed={seed} coindata={coindata} postData={postData} totalbuyin={totalbuyin} totalbuyin_const={totalbuyin_const} pnldate={pnldate} ispro={proversion} bannerID={bannerAdId()} upgraded={boughtPro}/>}
          options={{
            tabBarIcon: ({ focused }) => (
              <View style={{ alignItems: "center", justifyContent: "center"}}>
                <Image
                  source={require("../../assets/icons/1x/portfolio.png")}
                  resizeMode="contain"
                  style={{
                    width: 40,
                    height: 40,
                    tintColor: focused ? focusedColor() : textColor(),
                  }}
                />
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="Settings" //component={PortfolioScreen}
          children={()=><SettingsScreen userEmail={userEmail} username={username} requirePIN={requirePIN} ispro={proversion} bannerID={bannerAdId()} boughtPro={boughtPro}/>}
          options={{
            tabBarIcon:({ focused }) => (
              <View style={{alignItems: "center", justifyContent: "center",width:40}}>
                <Image
                  source={require("../../assets/icons/1x/settings.png")}
                  resizeMode="contain"
                  style={{
                    width: 20,
                    height: 20,
                    tintColor: focused ? focusedColor() : textColor(),
                  }}
                />
                <Text
                  style={{color:focused ? focusedColor() : textColor(), fontSize: 10}}
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
    input: {
        paddingHorizontal: 10,
        height: 40,
        width: 300,
        margin: 12,
        borderWidth: 1,
        borderRadius: 15,
        fontSize:20,
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
