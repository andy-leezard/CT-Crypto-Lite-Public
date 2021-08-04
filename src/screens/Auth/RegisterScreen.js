import React, { useState } from 'react';
import { StyleSheet, Text, View, KeyboardAvoidingView, TextInput } from 'react-native';
import { Button, Image } from 'react-native-elements';
import { StatusBar } from 'expo-status-bar';
import { db, auth } from '../../../firebase';
import { useColorScheme } from "react-native-appearance";
import Env from '../../env.json';

const RegisterScreen = ({navigation}) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [redoInfo, setRedoInfo] = useState(false);
    const [username, setUsername] = useState('');
    const [msg_error, setmsg_error] = useState('Incorrect information');
    const scheme = useColorScheme();
    const bool_isDarkMode = () => {
      return scheme === "dark";
    }
    const brandTextColor = () => {
        return bool_isDarkMode() ? Env.brandText_Dark:Env.brandText_Light;
    }
    const subTextColor = () => {
        return bool_isDarkMode() ? "#CCCCCC":"#8F8F8F";
    }

    function isValidEmailAddress(address) {
        return !! address.match(/.+@.+/);
    }

    const registerHandler = () => {
        let loweremail = email.toLowerCase();
        console.log("lower email is :",loweremail);
        if(username.length <2){
        setRedoInfo(true);setmsg_error("Username is too short");return;
        }else if(email.length <8){
        setRedoInfo(true);setmsg_error("Incorrect email format - too short");return;
        }else if(isValidEmailAddress(email) === false){
        setRedoInfo(true);setmsg_error("Incorrect email format");return;
        }else if(password.length <6){
        setRedoInfo(true);setmsg_error("Password is too simple");return;
        }else{
           db
            .collection('users')
            .doc(loweremail)
            .set({
                username: username,
                favorites: ['Bitcoin','Ethereum'],
                seed: 1000,
                pnldate: "Since "+simplifyDate(new Date().toDateString()),
                totalbuyin: 1000,
                totalbuyin_constant: 1000,
                requirepin: false,
                pin: '',
                pro: false,
                boughtPro: false
            })
            .then(()=>{
                auth
                .createUserWithEmailAndPassword(loweremail,password)
                .then(() => {
                    //it successfully created a new user with email and password.
                    db
                    .collection('users')
                    .doc(loweremail)
                    .collection("history")
                    .add({
                        type: "Received",
                        target: "VUSD",
                        targetName: "Virtual USD",
                        quantity: 1000,
                        fiat: 0,
                        price: 1,
                        imgsrc: "https://firebasestorage.googleapis.com/v0/b/cointracer-2fd86.appspot.com/o/usd_custom.png?alt=media&token=857456bf-e06b-4fc6-95a2-72f1d69212dc",
                        orderNum: Number(new Date().getTime()).toString().substring(0, 10),
                        time: simplifyDate_history(new Date())
                    })
                    .catch(error => {handleError(error);})
                    setRedoInfo(false);
                    console.log('User account created & signed in!');
                })
                .catch(error => {handleError(error);})
            })
            .catch((error)=>{handleError(error);})
        }
    }

    const handleError = (e) => {
        setRedoInfo(true);//console.log(e);
        if(e.message){
            setmsg_error(e.message);
        }else{
            setmsg_error(JSON.stringify(e));
        }
    }

    const simplifyDate_history = (i) => {
        let j = i.toString();
        let k = j.split(" ");
        let l = k.slice(1, 5);
        l[3] = l[3].substring(0,5);
        return l.join(' ');
    }
    const simplifyDate = (i) => {
        let j = i.split(" ");
        let l = j.slice(1, 4);
        return l.join(' ');
    }

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <StatusBar style="auto"/>
            <View style={{alignItems: 'center', justifyContent: 'center',}}>
                <View>
                    <Image
                    source={require('../../assets/icon.png')}
                    style={{width:40,height:40,marginBottom:5,marginTop:100,}}
                    />
                </View>
                <Text style={{color:brandTextColor(),marginBottom:40,fontSize:20,fontWeight:"bold"}}>CoinTracer</Text>
                <View style={{width:300, alignItems:"center"}}>
                    {redoInfo && (<View style={{backgroundColor:"#FA8283",borderWidth:1,borderColor:"#FDD7D8",borderRadius:5,padding:5,marginBottom:10}}>
                        <Text style={{color:"#ffffff",fontSize:15,fontWeight:"700"}}>{msg_error}</Text>
                    </View>)}
                    <TextInput
                        style={[styles.input,bool_isDarkMode()?styles.darkTheme:styles.lightTheme]}
                        autoFocus={true}
                        placeholder="Username"
                        placeholderTextColor={subTextColor()}
                        value={username}
                        onChangeText={setUsername}
                        maxLength = {20}
                    />
                    <TextInput
                        style={[styles.input,bool_isDarkMode()?styles.darkTheme:styles.lightTheme]}
                        placeholder="Email"
                        placeholderTextColor={subTextColor()}
                        value={email}
                        onChangeText={setEmail}
                        maxLength = {32}
                    />
                    <TextInput
                        style={[styles.input,bool_isDarkMode()?styles.darkTheme:styles.lightTheme]}
                        secureTextEntry={true}
                        placeholder="Password"
                        placeholderTextColor={subTextColor()}
                        value={password}
                        onChangeText={setPassword} onSubmitEditing={registerHandler}
                        maxLength = {64}
                    />
                </View>
                <View style={styles.btn}>
                  <Button buttonStyle={{backgroundColor:"#665CAF",borderRadius:5}} titleStyle={{color: "#ffffff", fontSize: 16, fontWeight:"bold"}} title="register" onPress={registerHandler}/>
                </View>
                <View style={styles.btn}>
                  <Button buttonStyle={{backgroundColor:"#69648f",borderRadius:5}} titleStyle={{color: "#ffffff", fontSize: 16, fontWeight:"bold"}} title="cancel" onPress={()=>navigation.goBack()}/>
                </View>
                <View>
                    <Text style={{color:brandTextColor(),fontSize:14,fontWeight:"600",marginTop:20, alignSelf:"center"}}>© 2021 | Developed by Andy Lee</Text>
                    <Text style={{color:brandTextColor(),fontSize:12,fontWeight:"600",marginTop:10, alignSelf:"center"}}>{Env.currentVersion}</Text>
                </View>
            </View>
        </KeyboardAvoidingView>
    )
}

export default RegisterScreen

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
