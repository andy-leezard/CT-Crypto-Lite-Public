import React, { useState, useEffect } from 'react'
import { View, Text, Image, ScrollView, Alert, StyleSheet, TouchableOpacity, Switch, Dimensions, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import { db, auth } from '../../firebase';
import { useColorScheme } from "react-native-appearance";
import { AdMobBanner} from 'expo-ads-admob';
import { useNavigation } from '@react-navigation/core';

const screenHeight = Dimensions.get("window").height;

const Settings = ({userEmail,username,requirePIN,ispro,bannerID,boughtPro}) => {
    const navigation = useNavigation();
    const scheme = useColorScheme();
    const [switchState, setSwitchState] = useState(false);
    const [switchState_pro, setSwitchState_pro] = useState(false);

    useEffect(() => {
        setSwitchState(requirePIN);
        setSwitchState_pro(ispro);
    }, [requirePIN,ispro])

    const bool_isDarkMode = () => {
        return scheme === "dark";
    }
    const bgColor = () => {
        return bool_isDarkMode() ? "#000000":"#FFFFFF";
    }
    const textColor = () => {
        return bool_isDarkMode() ? "#FFFFFF":"#000000";
    }
    const subTextColor = () => {
        return bool_isDarkMode() ? "#b5b5b5":"#757575";
    }
    const dynamicMargin = () => {
        if(!ispro){
            return (Platform.OS === "ios") ? 300:230;
        }else{
            return (Platform.OS === "ios") ? 200:130;
        }
    }

    const firebaseSignOut = () => {
        auth.signOut();
    }

    const requestResetPasword = () => {
        auth.sendPasswordResetEmail(userEmail)
            .then(() => {
                Alert.alert(
                    "Notification",
                    ("Your request for a new password has been sent to your email : "+userEmail),
                [{ text: "OK",}]
                );
            })
            .catch((error) => {
                Alert.alert(
                    "Error",error,
                [{ text: "Retry",}]
                );
            });
    }

    const toggleUsePin = async (param) => {
        return db
            .collection('users')
            .doc(userEmail)
            .update({
                requirepin: param,
            })
            .catch((err)=>{
                console.log(err);
            })
    }
    const togglePro = async (param) => {
        if(!boughtPro){
            navigation.navigate('Stack_Settings_UP',{email:userEmail,boughtPro:boughtPro});
            return;
        }else{
            return db
            .collection('users')
            .doc(userEmail)
            .update({
                pro: param,
            })
            .catch((err)=>{
                console.log(err);
            })
        }
    }

    const Account = () => { 
        return(
            <>
                <Text style={{fontSize:20,fontWeight:"bold",color:textColor()}}>Account</Text>
                <View style={{flexDirection:"column",paddingTop:30}}>
                    <TouchableOpacity onPress={()=>navigation.navigate("Stack_Settings_NU",{email:userEmail})}>
                        <View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginBottom:25}}>
                            <Text style={{fontSize:17,fontWeight:"300",letterSpacing:0.5,color:textColor()}}>Edit Profile</Text>
                            <Image source={require("../assets/icons/1x/arrow_darkmode.png")} style={[{width:10,height:10},(!bool_isDarkMode()&&{tintColor:"#000000"})]}/>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={()=>navigation.navigate("Stack_Settings_TNC")}>
                        <View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginBottom:25}}>
                            <Text style={{fontSize:17,fontWeight:"300",letterSpacing:0.5,color:textColor()}}>Data & Terms of Use</Text>
                            <Image
                                source={require("../assets/icons/1x/arrow_darkmode.png")}
                                style={[{width:10,height:10},(!bool_isDarkMode()&&{tintColor:"#000000"})]}
                            />
                        </View>
                    </TouchableOpacity>
                    <View style={{flexDirection:"row",alignItems:"center",justifyContent:"space-between",marginBottom:25}}>
                        <Text style={{flexWrap:"wrap", fontSize:17,fontWeight:"300",letterSpacing:0.5,color:textColor()}}>Upgrade (AD Free)</Text>
                        <Switch value={switchState_pro} trackColor={{ false: "#545254", true: "#34CC90" }}
                            thumbColor={switchState_pro ? "#faffb0" : "#e8e8e8"}
                            onValueChange={(isOn)=>{
                                if(!switchState_pro){
                                    togglePro(true)
                                }else{
                                    togglePro(false)
                                }
                            }}
                        />
                    </View>
                </View>
            </>
        )
    }

    const Security = () => {
        return(
            <View style={{marginBottom:90}}>
                <Text style={{fontSize:20, fontWeight:"bold", paddingTop:10,color:textColor()}}>Security</Text>
                <View style={{paddingTop:30,flexDirection:"column"}}>
                    <View style={{flexDirection:"row",alignItems:"center",justifyContent:"space-between",marginBottom:25}}>
                        <Text style={{flexWrap:"wrap", fontSize:17,fontWeight:"300",letterSpacing:0.5,color:textColor()}}>Require PIN</Text>
                        <Switch value={switchState} trackColor={{ false: "#545254", true: "#34CC90" }}
                            thumbColor={switchState ? "#faffb0" : "#e8e8e8"}
                            onValueChange={(isOn)=>{
                                if(!switchState){
                                    toggleUsePin(true)
                                }else{
                                    toggleUsePin(false)
                                }
                            }}
                        />
                    </View>
                    <View>
                        {requirePIN ? (
                            <TouchableOpacity onPress={()=>navigation.navigate("Stack_Settings_CP",{email:userEmail})}>
                                <View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginBottom:25}}>
                                    <Text style={{fontSize:17,fontWeight:"300",letterSpacing:0.5,color:textColor()}}>Configure PIN</Text>
                                    <Image source={require("../assets/icons/1x/arrow_darkmode.png")} style={[{width:10,height:10},(!bool_isDarkMode()&&{tintColor:"#000000"})]}/>
                                </View>
                            </TouchableOpacity>
                        ):(
                            <View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginBottom:25}}>
                                <Text style={{fontSize:17,fontWeight:"300",letterSpacing:0.5,color:subTextColor()}}>Configure PIN</Text>
                            </View>
                        )}
                    </View>
                    <View>
                        <TouchableOpacity onPress={()=>{requestResetPasword()}}>
                            <View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginBottom:25}}>
                                <Text style={{fontSize:17,fontWeight:"300",letterSpacing:0.5,color:textColor()}}>Change Password</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={()=>navigation.navigate("Stack_Settings_SC")}>
                        <View style={{flexDirection:"row",alignItems:"center",justifyContent:"space-between",marginBottom:30}}>
                            <Text style={{flexWrap:"wrap",fontSize:17,fontWeight:"300",letterSpacing:0.5,color:textColor()}}>Support & Contact</Text>
                            <Image
                                source={require("../assets/icons/1x/arrow_darkmode.png")}
                                style={[{width:10,height:10},(!bool_isDarkMode()&&{tintColor:"#000000"})]}
                            />
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.appButtonContainer} onPress={firebaseSignOut}>
                            <Text style={styles.appButtonText}>Sign Out</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    return (
    <SafeAreaView style={{flex:1, backgroundColor:bgColor()}}>
            <View style={{height:screenHeight-dynamicMargin()}}>
            <ScrollView style={{paddingHorizontal: 20}}>
                <View>
                    <Text style={{fontSize:14,fontWeight:"500",color:textColor()}}>{userEmail}</Text>
                    <Text style={{fontSize:29,fontWeight:"bold",paddingTop:5,color:textColor()}}>Hello, {username}!</Text>
                </View>
                <View style={{paddingTop:30}}>
                    <Account/>
                </View>
                <View style={{paddingTop:10}}>
                    <Security/>
                </View>
            </ScrollView>
            </View>
            <View style={{alignSelf:"center"}}>
                {!ispro && 
                    <AdMobBanner
                    bannerSize="fullBanner"
                    adUnitID={bannerID} // Test ID, Replace with your-admob-unit-id
                    servePersonalizedAds // true or false
                    //onDidFailToReceiveAdWithError={this.bannerError}
                    />
                }
            </View>
    </SafeAreaView>
    )
}

const styles=StyleSheet.create({
    appButtonContainer:{
        height: 45,
        width:"100%",
        backgroundColor: "#9772FF",
        borderRadius: 10,
        justifyContent: "center"
    },
    appButtonText:{
        fontSize: 20,
        color:"white",
        fontWeight:"bold",
        alignSelf:"center"
    }
})

export default Settings