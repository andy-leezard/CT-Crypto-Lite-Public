import React, { useState } from 'react';
import { StyleSheet, Text, View, KeyboardAvoidingView, TextInput, Platform } from 'react-native';
import { Button, Image } from 'react-native-elements';
import { StatusBar } from 'expo-status-bar';
import { auth } from '../../../firebase';
import { useColorScheme } from "react-native-appearance";
import Env from '../../env.json'

const LoginScreen = ({route, navigation}) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [redoInfo, setRedoInfo] = useState(false);
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

    const firebaseSignIn = () =>{
        auth
          .signInWithEmailAndPassword(email, password)
          .then(() => {
            console.log('User signed in!');
            setRedoInfo(false);
          })
          .catch(error => {
            handleError(error)
          });
    }
    const handleError = (e) => {
        setRedoInfo(true);//console.log(e);
        e.message ? setmsg_error(e.message):setmsg_error(JSON.stringify(e));
    }

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <StatusBar style="auto"/>
            <View style={{alignItems: 'center', justifyContent: 'center',}}>
            <View>
                <Image
                source={require('../../assets/icon.png')}
                style={[{width:40,height:40,marginBottom:5,marginTop:100,},(Platform.OS === 'ios') && {borderRadius:5}]}
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
                    onChangeText={setPassword} onSubmitEditing={firebaseSignIn}
                    maxLength = {64}
                />
            </View>
            <View style={styles.btn}>
                <Button buttonStyle={{backgroundColor:"#1DC08B",borderRadius:5}} titleStyle={{color: "#ffffff", fontSize: 16, fontWeight:"bold"}} title="sign in" onPress={firebaseSignIn}/>
            </View>
            <View style={styles.btn}>
                <Button buttonStyle={{backgroundColor:"#665CAF",borderRadius:5}} titleStyle={{color: "#ffffff", fontSize: 16, fontWeight:"bold"}} title="sign up" onPress={()=>navigation.navigate('Approval')}/>
            </View>
            <View>
                <Text style={{color:brandTextColor(),fontSize:14,fontWeight:"600",marginTop:20, alignSelf:"center"}}>© 2021 | Developed by Andy Lee</Text>
                <Text style={{color:brandTextColor(),fontSize:12,fontWeight:"600",marginTop:10, alignSelf:"center"}}>{Env.currentVersion}</Text>
            </View>
            </View>
        </KeyboardAvoidingView>
    )
}

export default LoginScreen

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
