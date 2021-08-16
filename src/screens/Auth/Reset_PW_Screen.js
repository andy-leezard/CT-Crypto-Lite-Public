import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Alert, ImageBackground } from 'react-native';
import { Button, Image } from 'react-native-elements';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from "react-native-appearance";
import Env from '../../env.json'
import { auth } from '../../../firebase';

const Reset_PW_Screen = ({route, navigation}) => {
    const [email, setEmail] = useState('');
    const [redoInfo, setRedoInfo] = useState(false);
    const [msg_error, setmsg_error] = useState('Incorrect information');
    const scheme = useColorScheme();
    const [processing, setProcessing] = useState(false);

    const bool_isDarkMode = () => {
        return scheme === "dark";
    }
    const brandTextColor = () => {
        return bool_isDarkMode() ? Env.brandText_Dark:Env.brandText_Light;
    }
    const handleError = (e) => {
        setRedoInfo(true);//console.log(e);
        e.message ? setmsg_error(e.message):setmsg_error(JSON.stringify(e));
    }
    function isValidEmailAddress(address) {
        return !! address.match(/.+@.+/);
    }
    const resetPW = () => {
        let loweremail = email.toLowerCase();
        if(email.length <8){
            setRedoInfo(true);handleError("Incorrect email format");return;
        }else if(isValidEmailAddress(email) === false){
            setRedoInfo(true);handleError("Incorrect email format");return;
        }else{
            setProcessing(true);
            auth.sendPasswordResetEmail(loweremail)
            .then(()=>{
                Alert.alert(
                    "Reset Password",("Your request has been sent to your email address : "+loweremail),
                [{ text: "OK",}]
                );
                setRedoInfo(false);
            })
            .catch(handleError)
            .finally(()=>{setProcessing(false);});
        }
    }

    return (
        <ImageBackground source={require('../../assets/bg/bg.png')} style={[styles.container,{width:"100%",height:"100%"}]}>
            <StatusBar style="auto"/>
            <View style={{alignItems: 'center', justifyContent: 'center',}}>
                <View>
                    <Image
                    source={require('../../assets/icon_rounded.png')}
                    style={{width:40,height:40,marginBottom:5,marginTop:80,}}
                    />
                </View>
                <Text style={{color:brandTextColor(),marginBottom:40,fontSize:20,fontWeight:"bold"}}>CoinTracer</Text>
                <View style={{width:300, alignItems:"center"}}>
                    {redoInfo && (<View style={{backgroundColor:"rgba(0,0,0,0.5)",borderWidth:1,borderColor:"#FDD7D8",borderRadius:5,padding:5,marginBottom:10}}>
                        <Text style={{color:"#ffffff",fontSize:15,fontWeight:"700"}}>{msg_error}</Text>
                    </View>)}
                    <TextInput
                        style={[styles.input,{backgroundColor: 'rgba(0,0,0,0.25)'}]}
                        autoFocus={true}
                        placeholder="Email"
                        placeholderTextColor={"#CCCCCC"}
                        value={email}
                        onChangeText={setEmail}
                        maxLength = {32}
                    />
                </View>
                <View style={styles.btn}>
                    <Button disabled={processing} buttonStyle={{backgroundColor:'#FFFFFF',borderRadius:5}} titleStyle={{color: "#1DC08B", fontSize: 17, fontWeight:"bold"}} title="reset password" onPress={resetPW}/>
                </View>
                <View style={styles.btn}>
                    <Button buttonStyle={{backgroundColor:'rgba(147, 105, 219,0.75)',borderRadius:5}} titleStyle={{color: "#ffffff", fontSize: 17, fontWeight:"bold"}} title="cancel" onPress={()=>navigation.goBack()}/>
                </View>
                <View style={{alignItems:"center",marginTop:50}}>
                    <Text style={{color:"#FFFFFF",fontSize:14,fontWeight:"600",textShadowColor:brandTextColor(),textShadowOffset:{width: 1, height: 1},textShadowRadius:4,marginTop:20}}>© 2021 | Developed by Andy Lee</Text>
                    <Text style={{color:"#FFFFFF",fontSize:14,fontWeight:"600",textShadowColor:brandTextColor(),textShadowOffset:{width: 1, height: 1},textShadowRadius:4,marginTop:10}}>{Env.currentVersion}</Text>
                </View>
            </View>
        </ImageBackground>
    )
}

export default Reset_PW_Screen

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
    btn: {
        marginBottom: 10,
        marginTop: 5,
        width:160,
        height:40,
    }
})
