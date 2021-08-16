import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Alert, TouchableOpacity, ImageBackground, Dimensions } from 'react-native';
import { Image } from 'react-native-elements';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from "react-native-appearance";
import Env from '../../env.json'
import { db, auth } from '../../../firebase';

const screenWidth = Dimensions.get('window').width;

const WelcomeScreen = ({username, email}) => {
    const scheme = useColorScheme();
    const [startingBonus,setStartingBonus] = useState();
    useEffect(() => {
        if(typeof startingBonus !== "number"){
            db.collection('globalEnv').doc('variables').get().then((doc)=>{
              (doc.exists) ? setStartingBonus(doc.data().starting_bonus) : setStartingBonus(1000);
            }).catch(()=>{setStartingBonus(1000);});
          }
    }, [])

    const bool_isDarkMode = () => {
        return scheme === "dark";
    }
    const brandTextColor = () => {
        return bool_isDarkMode() ? Env.brandText_Dark:Env.brandText_Light;
    }
    const resend = () => {
        auth.currentUser.sendEmailVerification();
        Alert.alert(
            "Email verification",("New email verification has been sent to your email address : "+auth.currentUser.email),
        [{ text: "OK",}]
        );
    }
    const firebaseSignOut = () => {
        auth.signOut();
    }

    return (
        <ImageBackground source={require('../../assets/bg/bg.png')} style={styles.container}>
            <StatusBar style="auto"/>
            <View style={{flex:1}}>
                <View style={{flexDirection:"column",alignItems: 'center', justifyContent:"space-between",height:Dimensions.get('window').height-75}}>
                    <View style={{alignItems:"center"}}>
                        <Image
                        source={require('../../assets/icon_rounded.png')}
                        style={{width:50,height:50,marginBottom:5,marginTop:100,}}
                        />
                        {(username.length>5) ? (
                            <View style={{width:screenWidth-20, alignItems:"center"}}>
                            <Text style={{color:"#FFFFFF",fontSize:20,fontWeight:"bold",textShadowColor:brandTextColor(),textShadowOffset:{width: 1, height: 1},textShadowRadius:6}}>WELCOME TO COINTRACER,</Text>
                            <Text style={{color:"#FFFFFF",fontSize:20,fontWeight:"bold",textShadowColor:brandTextColor(),textShadowOffset:{width: 1, height: 1},textShadowRadius:6}}>{username.toUpperCase()}!</Text>
                            </View>
                        ):(
                            <View style={{width:screenWidth-20, alignItems:"center"}}>
                            <Text style={{color:"#FFFFFF",fontSize:20,fontWeight:"bold",textShadowColor:brandTextColor(),textShadowOffset:{width: 1, height: 1},textShadowRadius:6}}>WELCOME TO COINTRACER, {username.toUpperCase()}!</Text>
                            </View>
                        )}
                        <Text style={{color:"#FFFFFF",fontSize:17,fontWeight:"600",marginTop:10,textShadowColor:brandTextColor(),textShadowOffset:{width: 1, height: 1},textShadowRadius:4}}>Begin your new epic crypto trades</Text>
                        <Text style={{color:"#FFFFFF",fontSize:18,fontWeight:"600",marginTop:5,textShadowColor:brandTextColor(),textShadowOffset:{width: 1, height: 1},textShadowRadius:4}}>with {startingBonus} vUSD starter's bonus!</Text>
                    </View>
                        
                    <View style={{alignItems:"center"}}>
                        <Text style={{color:"#FFFFFF",fontSize:18,fontWeight:"600",textShadowColor:brandTextColor(),textShadowOffset:{width: 1, height: 1},textShadowRadius:4}}>Please verify your email</Text>
                        <Text style={{color:"#FFFFFF",fontSize:18,fontWeight:"600",textShadowColor:brandTextColor(),textShadowOffset:{width: 1, height: 1},textShadowRadius:4}}> - {email} - </Text>
                    </View>

                    <TouchableOpacity onPress={resend}>
                        <Text style={{color:"white",fontSize:14,fontWeight:"600", alignSelf:"center"}}>Haven't received the email ?</Text>
                        <Text style={{color:"white",fontSize:16,fontWeight:"bold",marginTop:10, alignSelf:"center"}}>Re-send email verification</Text>
                    </TouchableOpacity>
                    <View>
                        <TouchableOpacity onPress={firebaseSignOut}>
                            <Text style={{color:"white",fontSize:14,fontWeight:"600",marginBottom:70, alignSelf:"center"}}>Try a different ID</Text>
                        </TouchableOpacity>
                        <Text style={{color:"white",fontSize:14,fontWeight:"600",alignSelf:"center"}}>© 2021 | Developed by Andy Lee</Text>
                        <Text style={{color:"white",fontSize:12,fontWeight:"600",marginTop:10, alignSelf:"center"}}>{Env.currentVersion}</Text>
                    </View>
                </View>
            </View>
        </ImageBackground>
    )
}

export default WelcomeScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: "flex-start",
        width: '100%',
        height: '100%'
    },
    input: {
        paddingHorizontal: 10,
        height: 40,
        width: 300,
        margin: 12,
        borderWidth: 1,
        borderRadius: 15,
        fontSize:20,
    },
    btn: {
        marginBottom: 15,
        marginTop: 5,
        width:160,
        height:40,
    },
    darkTheme: {
        color: "#FFFFFF",
        backgroundColor: "#333333"
    },
    lightTheme: {
        color: "#000000",
        backgroundColor: "#FFFFFF"
    }
})
