import React, { useState, useContext } from 'react'
import { View, Text, Image, ScrollView, Alert, StyleSheet, TouchableOpacity, Switch, Platform } from 'react-native'
import { db, auth } from '../../firebase';
import * as Linking from 'expo-linking';
import Env from '../env.json';
import I18n from 'i18n-js';
import { GlobalContext, MainContext } from '../StateManager';
import { Enum_app_actions } from '../lib/Reducers';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GlobalContextInterfaceAsReducer, MainContextInterface } from '../lib/Types';
import { bgColor, dynamic_bottom_tab_Height, subTextColor, textColor, themeToString } from '../lib/StyleLib';

interface Props{
    navigation:any
}

const Settings:React.FC<Props> = ({navigation}) => {
    const globalContext = useContext<GlobalContextInterfaceAsReducer>(GlobalContext);
    const mainContext = useContext<MainContextInterface>(MainContext);
    const [switchState_pin, setSwitchState_pin] = useState<boolean>(mainContext.requirePIN);
    const [switchState_pro, setSwitchState_pro] = useState<boolean>(mainContext.adblock);
    const [switchState_darkmode, setSwitchState_darkmode] = useState<boolean|null>(globalContext.state.env.darkmode);

    const toggleTheme = (i:boolean):void => {
        setSwitchState_darkmode(i);
        globalContext.dispatch({type:Enum_app_actions.SET_THEME, payload:i});
        storeTheme(themeToString(i));
    }

    const toggleUsePin = (param:boolean):void => {
        setSwitchState_pin(param);
        db
            .collection('users')
            .doc(globalContext.state.auth.userEmail!)
            .update({
                requirepin: param,
            })
            .catch(console.log)
    }
    const toggleAdBlock = (param:boolean):void => {
        if(!mainContext.vip){
            navigation.navigate('Stack_Settings_UP');
            setSwitchState_pro(false);
        }else{
            setSwitchState_pro(param);
            db
                .collection('users')
                .doc(globalContext.state.auth.userEmail!)
                .update({
                    pro: param,
                })
                .catch((err)=>{
                    console.log(err);
                })
        }
    }
    
    const tryResetPW = () => {
        Alert.alert(
            I18n.t('s_reset_pw'),I18n.t('r_u_sure_reset_pw'),
        [
            { text: I18n.t('confirm'), onPress: () =>  requestResetPasword() },
            { text: I18n.t('s_cancel'), style: "cancel"}
        ]
        );
    }
    const requestResetPasword = () => {
        auth.sendPasswordResetEmail(globalContext.state.auth.userEmail!)
            .then(() => {
                Alert.alert(
                    I18n.t('notification'),
                    (I18n.t('notif_reset_pw') + " : " + globalContext.state.auth.userEmail),
                [{ text: I18n.t('ok'),}]
                );
            })
            .catch((error) => {
                Alert.alert(
                    I18n.t('error'),error,
                [{ text: I18n.t('retry'),}]
                );
            });
    }
    
    const storeTheme = async(param:string) => {
        try{
            await AsyncStorage.setItem('theme', param);
            console.log("theme set to :",param);
        }catch(e){
            console.log("Error storing theme value ! : ",e);
        }
    }
    
    const inAppReview = () => {
        if(Platform.OS === "ios"){
            Linking.openURL(
                `itms-apps://itunes.apple.com/app/viewContentsUserReviews/id${Env.itunesItemId}?action=write-review`
              );
        }else{
            Linking.openURL(
                `market://details?id=${Env.androidPackageName}&showAllReviews=true`
              );
        }
    }
    const joinDiscord = () => {
        Linking.openURL(`https://discord.gg/zu9b7Ypx7g`);
    }
    const followTwitter = () => {
        Linking.openURL(`https://twitter.com/AndyLee_dev`);
    }
    const viewGit = () => {
        Linking.openURL(`https://github.com/AndyLeezard/CoinTracer_public`);
    }

    const Account = () => { 
        return(
            <View style={{marginTop:15}}>
                <Text style={{fontSize:20,fontWeight:"bold",color:textColor(globalContext.state.env.darkmode!)}}>{I18n.t('anp')}</Text>
                <View style={{flexDirection:"column",marginTop:30}}>
                    <TouchableOpacity onPress={()=>navigation.navigate("Stack_Settings_NU")}>
                        <View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginBottom:25}}>
                            <Text style={{fontSize:17,fontWeight:"300",letterSpacing:0.5,color:textColor(globalContext.state.env.darkmode!)}}>{I18n.t('edit_profile')}</Text>
                            <Image source={require("../assets/icons/1x/arrow_darkmode.png")} style={[{width:10,height:10},(!globalContext.state.env.darkmode&&{tintColor:"#000000"})]}/>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={()=>navigation.navigate("Stack_Settings_L")}>
                        <View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginBottom:25}}>
                            <Text style={{fontSize:17,fontWeight:"300",letterSpacing:0.5,color:textColor(globalContext.state.env.darkmode!)}}>{I18n.t('language')}</Text>
                            <Image
                                source={require("../assets/icons/1x/arrow_darkmode.png")}
                                style={[{width:10,height:10},(!globalContext.state.env.darkmode&&{tintColor:"#000000"})]}
                            />
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={()=>navigation.navigate("Stack_Settings_TNC")}>
                        <View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginBottom:25}}>
                            <Text style={{fontSize:17,fontWeight:"300",letterSpacing:0.5,color:textColor(globalContext.state.env.darkmode!)}}>{I18n.t('d_tnc')}</Text>
                            <Image
                                source={require("../assets/icons/1x/arrow_darkmode.png")}
                                style={[{width:10,height:10},(!globalContext.state.env.darkmode&&{tintColor:"#000000"})]}
                            />
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={()=>navigation.navigate("Stack_Settings_MR")}>
                        <View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginBottom:25}}>
                            <Text style={{fontSize:17,fontWeight:"300",letterSpacing:0.5,color:textColor(globalContext.state.env.darkmode!)}}>{I18n.t('my_rewards')}</Text>
                            <Image
                                source={require("../assets/icons/1x/arrow_darkmode.png")}
                                style={[{width:10,height:10},(!globalContext.state.env.darkmode&&{tintColor:"#000000"})]}
                            />
                        </View>
                    </TouchableOpacity>
                    <View style={{flexDirection:"row",alignItems:"center",justifyContent:"space-between",marginBottom:25}}>
                        <Text style={{flexWrap:"wrap", fontSize:17,fontWeight:"300",letterSpacing:0.5,color:textColor(globalContext.state.env.darkmode!)}}>{I18n.t('settings_vip')}</Text>
                        <Switch value={switchState_pro} trackColor={{ false: "#545254", true: "#34CC90" }}
                            thumbColor={switchState_pro ? "#faffb0" : "#e8e8e8"}
                            onValueChange={(i)=>toggleAdBlock(i)}
                        />
                    </View>
                    <View style={{flexDirection:"row",alignItems:"center",justifyContent:"space-between",marginBottom:25}}>
                        <Text style={{flexWrap:"wrap", fontSize:17,fontWeight:"300",letterSpacing:0.5,color:textColor(globalContext.state.env.darkmode!)}}>{I18n.t('darkmode')}</Text>
                        <Switch value={switchState_darkmode!} trackColor={{ false: "#545254", true: "#34CC90" }}
                            thumbColor={switchState_darkmode ? "#faffb0" : "#e8e8e8"}
                            onValueChange={(i)=>toggleTheme(i)}
                        />
                    </View>
                </View>
            </View>
        )
    }

    const Security = () => {
        return(
            <View style={{marginTop:10}}>
                <Text style={{fontSize:20, fontWeight:"bold", marginTop:10,color:textColor(globalContext.state.env.darkmode!)}}>{I18n.t('security')}</Text>
                <View style={{marginTop:30,flexDirection:"column"}}>
                    <View style={{flexDirection:"row",alignItems:"center",justifyContent:"space-between",marginBottom:25}}>
                        <Text style={{flexWrap:"wrap", fontSize:17,fontWeight:"300",letterSpacing:0.5,color:textColor(globalContext.state.env.darkmode!)}}>{I18n.t('require_pin')}</Text>
                        <Switch value={switchState_pin} trackColor={{ false: "#545254", true: "#34CC90" }}
                            thumbColor={switchState_pin ? "#faffb0" : "#e8e8e8"}
                            onValueChange={(i)=>toggleUsePin(i)}
                        />
                    </View>
                    <View>
                        {mainContext.requirePIN ? (
                            <TouchableOpacity onPress={()=>navigation.navigate("Stack_Settings_CP")}>
                                <View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginBottom:25}}>
                                    <Text style={{fontSize:17,fontWeight:"300",letterSpacing:0.5,color:textColor(globalContext.state.env.darkmode!)}}>{I18n.t('configure_pin')}</Text>
                                    <Image source={require("../assets/icons/1x/arrow_darkmode.png")} style={[{width:10,height:10},(!globalContext.state.env.darkmode&&{tintColor:"#000000"})]}/>
                                </View>
                            </TouchableOpacity>
                        ):(
                            <View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginBottom:25}}>
                                <Text style={{fontSize:17,fontWeight:"300",letterSpacing:0.5,color:subTextColor(globalContext.state.env.darkmode!)}}>{I18n.t('configure_pin')}</Text>
                            </View>
                        )}
                    </View>
                    <View>
                        <TouchableOpacity onPress={tryResetPW}>
                            <View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginBottom:25}}>
                                <Text style={{fontSize:17,fontWeight:"300",letterSpacing:0.5,color:textColor(globalContext.state.env.darkmode!)}}>{I18n.t('s_reset_pw')}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        )
    }

    const SNC = () => {
        return(
            <View style={{marginVertical:10}}>
                <Text style={{fontSize:20, fontWeight:"bold", paddingTop:10,color:textColor(globalContext.state.env.darkmode!)}}>{I18n.t('snc')}</Text>
                <TouchableOpacity onPress={()=>navigation.navigate("Stack_Settings_SC")} style={{marginTop:30}}>
                    <View style={{flexDirection:"row",alignItems:"center",justifyContent:"space-between",marginBottom:30}}>
                        <Text style={{flexWrap:"wrap",fontSize:17,fontWeight:"300",letterSpacing:0.5,color:textColor(globalContext.state.env.darkmode!)}}>{I18n.t('about')}</Text>
                        <Image
                            source={require("../assets/icons/1x/arrow_darkmode.png")}
                            style={[{width:10,height:10},(!globalContext.state.env.darkmode&&{tintColor:"#000000"})]}
                        />
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={()=>navigation.navigate("Stack_Settings_FAQ")}>
                        <View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginBottom:25}}>
                            <Text style={{fontSize:17,fontWeight:"300",letterSpacing:0.5,color:textColor(globalContext.state.env.darkmode!)}}>{I18n.t('faq')}</Text>
                            <Image
                                source={require("../assets/icons/1x/arrow_darkmode.png")}
                                style={[{width:10,height:10},(!globalContext.state.env.darkmode&&{tintColor:"#000000"})]}
                            />
                        </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={inAppReview}>
                    <View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginBottom:25}}>
                        <Text style={{fontSize:17,fontWeight:"300",letterSpacing:0.5,color:textColor(globalContext.state.env.darkmode!)}}>{I18n.t('rate_me')}</Text>
                        {(Platform.OS==='ios') ? (<Image
                            source={require("../assets/icons/1x/appstore.png")}
                            style={{width:25,height:25}}
                        />):(
                            <Image
                            source={require("../assets/icons/1x/playstore2.png")}
                            style={{width:25,height:25}}
                        />)}
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={joinDiscord}>
                    <View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginBottom:25}}>
                        <Text style={{fontSize:17,fontWeight:"300",letterSpacing:0.5,color:textColor(globalContext.state.env.darkmode!)}}>{I18n.t('discord')}</Text>
                        <Image
                            source={require("../assets/icons/1x/discord.png")}
                            style={{width:25,height:25}}
                        />
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={followTwitter}>
                    <View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginBottom:25}}>
                        <Text style={{fontSize:17,fontWeight:"300",letterSpacing:0.5,color:textColor(globalContext.state.env.darkmode!)}}>{I18n.t('twitter')}</Text>
                        <Image
                            source={require("../assets/icons/1x/twitter.png")}
                            style={{width:25,height:25}}
                        />
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={viewGit}>
                    <View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginBottom:25}}>
                        <Text style={{fontSize:17,fontWeight:"300",letterSpacing:0.5,color:textColor(globalContext.state.env.darkmode!)}}>{I18n.t('git')}</Text>
                        <Image
                            source={require("../assets/icons/1x/github.png")}
                            style={{width:25,height:25}}
                        />
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.appButtonContainer} onPress={()=>auth.signOut()}>
                    <Text style={styles.appButtonText}>{I18n.t('signout')}</Text>
                </TouchableOpacity>
            </View>
        )
    }

    return (
    <View style={{backgroundColor:bgColor(globalContext.state.env.darkmode!),paddingTop:10,height:globalContext.state.env.screenHeight-dynamic_bottom_tab_Height(mainContext.adblock)+10}}>
        <View style={{flex:1}}>
            <ScrollView style={{paddingHorizontal: 20}}>
                <Text style={{fontSize:29,fontWeight:"bold",marginTop:5,color:textColor(globalContext.state.env.darkmode!)}}>{I18n.t('hello')} {mainContext.username}{I18n.t('hello_suf')}</Text>
                <Text style={{fontSize:14,fontWeight:"500",color:textColor(globalContext.state.env.darkmode!)}}>  {globalContext.state.auth.userEmail}</Text>
                <Account/>
                <Security/>
                <SNC/>
            </ScrollView>
        </View>
    </View>
    )
}

const styles=StyleSheet.create({
    appButtonContainer:{
        height: 45,
        width:"100%",
        backgroundColor: "#9772FF",
        borderRadius: 10,
        justifyContent: "center",
        marginBottom:10
    },
    appButtonText:{
        fontSize: 20,
        color:"white",
        fontWeight:"bold",
        alignSelf:"center"
    }
})

export default Settings