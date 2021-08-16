import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, ImageBackground } from 'react-native';
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

    function isValidEmailAddress(address) {
        return !! address.match(/.+@.+/);
    }

    const registerHandler = () => {
        let loweremail = email.toLowerCase();
        if(username.length <2){
        setRedoInfo(true);setmsg_error("Username is too short");return;
        }else if(email.length <8){
        setRedoInfo(true);setmsg_error("Incorrect email format - too short");return;
        }else if(isValidEmailAddress(email) === false){
        setRedoInfo(true);setmsg_error("Incorrect email format");return;
        }else if(password.length <6){
        setRedoInfo(true);setmsg_error("Password is too simple");return;
        }else{
            Promise.all([initializeData(loweremail),initializeHistory(loweremail),createUser(loweremail)])
            .then(() => {
                console.log("successfully created user : ", loweremail);
            })
            .catch((err)=>{
                handleError(err);
            });
        }
    }

    const initializeData = (loweremail) => {
        return new Promise((resolve,reject)=>{
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
            .then(resolve)
            .catch(reject)
      })
    }
    const initializeHistory = (loweremail) => {
        return new Promise((resolve,reject)=>{
            let bonus = Number();
            db.collection('globalEnv')
            .doc('variables').get()
            .then((doc)=>{
                (doc.exists) ? bonus = doc.data().starting_bonus ?? 1000 : 1000;
            })
            .then(()=>{
                db
                .collection('users')
                .doc(loweremail)
                .collection("history")
                .add({
                    type: "Received",
                    target: "VUSD",
                    targetName: "Virtual USD",
                    quantity: bonus,
                    fiat: 0,
                    price: 1,
                    imgsrc: Env.fiatCoinIcon,
                    orderNum: Number(new Date().getTime()).toString().substring(0, 10),
                    time: simplifyDate_history(new Date())
                })
                .then(resolve)
                .catch(reject)
            })
        })
    }
    const createUser = (loweremail) => {
        return new Promise((resolve,reject)=>{
            auth.createUserWithEmailAndPassword(loweremail,password)
            .then(() => {
                if(auth.currentUser){
                    auth.currentUser.sendEmailVerification();
                    console.log("User successfully created & asked for email verification :", auth.currentUser.email);
                    resolve();
                }
            })
            .catch(reject)
        })
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
        <ImageBackground source={require('../../assets/bg/bg.png')} style={styles.container} >
            <StatusBar style="auto"/>
            <View style={{alignItems: 'center', justifyContent: 'center',}}>
                <View>
                    <Image
                    source={require('../../assets/icon_rounded.png')}
                    style={{width:40,height:40,marginBottom:5,marginTop:80,}}
                    />
                </View>
                <Text style={{color:"#FFFFFF",fontSize:24,fontWeight:"bold",textShadowColor:brandTextColor(),textShadowOffset:{width: 1, height: 1},textShadowRadius:6}}>Your new trader ID</Text>
                <View style={{width:300, alignItems:"center",marginTop:40}}>
                    {redoInfo && (<View style={{backgroundColor:"rgba(0,0,0,0.5)",borderWidth:1,borderColor:"#FDD7D8",borderRadius:5,padding:5}}>
                        <Text style={{color:"#ffffff",fontSize:15,fontWeight:"700"}}>{msg_error}</Text>
                    </View>)}
                    <TextInput
                        style={[styles.input,{backgroundColor: 'rgba(0,0,0,0.25)'}]}
                        autoFocus={true}
                        placeholder="Username"
                        placeholderTextColor={"#CCCCCC"}
                        value={username}
                        onChangeText={setUsername}
                        maxLength = {20}
                    />
                    <TextInput
                        style={[styles.input,{backgroundColor: 'rgba(0,0,0,0.25)'}]}
                        placeholder="Email"
                        placeholderTextColor={"#CCCCCC"}
                        value={email}
                        onChangeText={setEmail}
                        maxLength = {32}
                    />
                    <TextInput
                        style={[styles.input,{backgroundColor: 'rgba(0,0,0,0.25)'}]}
                        secureTextEntry={true}
                        placeholder="Password"
                        placeholderTextColor={"#CCCCCC"}
                        value={password}
                        onChangeText={setPassword} onSubmitEditing={registerHandler}
                        maxLength = {64}
                    />
                </View>
                <View style={styles.btn}>
                  <Button buttonStyle={{backgroundColor:"#FFFFFF",borderRadius:5}} titleStyle={{color: "#4784ff", fontSize: 19, fontWeight:"bold"}} title="register" onPress={registerHandler}/>
                </View>
                <View style={styles.btn}>
                  <Button buttonStyle={{backgroundColor:"#69648f",borderRadius:5}} titleStyle={{color: "#ffffff", fontSize: 16, fontWeight:"bold"}} title="back" onPress={()=>navigation.goBack()}/>
                </View>
                <View style={{alignItems:"center",marginTop:50}}>
                    <Text style={{color:"#FFFFFF",fontSize:14,fontWeight:"600",textShadowColor:brandTextColor(),textShadowOffset:{width: 1, height: 1},textShadowRadius:4,marginTop:20}}>© 2021 | Developed by Andy Lee</Text>
                    <Text style={{color:"#FFFFFF",fontSize:14,fontWeight:"600",textShadowColor:brandTextColor(),textShadowOffset:{width: 1, height: 1},textShadowRadius:4,marginTop:10}}>{Env.currentVersion}</Text>
                </View>
            </View>
        </ImageBackground>
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
        borderRadius: 10,
        fontSize:20,
        color: "#FFFFFF",
    },
    btn: {
        marginBottom: 10,
        marginTop: 5,
        width:170,
        height:40,
    }
})
