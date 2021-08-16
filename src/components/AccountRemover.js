import React, { useState } from 'react';
import { StyleSheet, Text, View, Alert, TouchableOpacity, TextInput, Dimensions, } from 'react-native';
import { auth } from '../../firebase';
import { useColorScheme } from "react-native-appearance";
import { KeyboardAvoidingView } from 'react-native';
import axios from 'axios';

const AccountRemover = ({route, navigation}) => {
    const [pw, setpw] = useState('');
    const [msg_error, setmsg_error] = useState('Please re-enter password');
    const scheme = useColorScheme();
    const [processing, setProcessing] = useState(false);
    const bool_isDarkMode = () => {
        return scheme === "dark";
    }
    const containerColor = () => {
        return bool_isDarkMode() ? "#2e2e2e":"#e8e8e8";
    }
    const containerRadiusColor = () => {
        return bool_isDarkMode() ? "#CCCCCC":"#4a4a4a";
    }

    const trydeleteUser = () =>{
        Alert.alert(
            "Warning","Are you sure ?",
        [
            { text: "Yes", onPress: () =>  deleteUser() },
            { text: "No", style: "cancel"}
        ]
        );
    }
    const deleteUser = () => {
        const email = auth.currentUser.email;
        auth
            .signInWithEmailAndPassword(email, pw)
            .then(()=>{
                setProcessing(true);
                axios.post('https://us-central1-cointracer-2fd86.cloudfunctions.net/deleteuser', { userEmail: email }).then((res)=>{
                    console.log(res.data);
                    auth.signOut();
                }).catch((e)=>{setmsg_error(e.message);})
            })
            .catch(error => {
                setmsg_error(error.message);
            });
    }

    return (
        <KeyboardAvoidingView style={{flex:1,paddingTop:15,alignItems:"center"}} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            {!processing && (<View style={{backgroundColor:"rgba(0,0,0,0.5)",borderWidth:1,borderColor:"#FDD7D8",borderRadius:5,padding:5,width:Dimensions.get("window").width-40,marginBottom:10,justifyContent:"center"}}>
                <Text style={{color:"#ffffff",fontSize:15,fontWeight:"500"}}>{msg_error}</Text>
            </View>)}
            {!processing &&
            (<TextInput
                secureTextEntry={true}
                style={{backgroundColor: containerColor(),borderWidth:1,borderColor:containerRadiusColor(),borderRadius: 5,color:"#ffffff",height: 35,width:Dimensions.get("window").width-40,marginHorizontal:14,fontSize:15,marginBottom:10,paddingHorizontal:5}}
                color="#ffffff" label="password" value={pw} onChangeText={setpw} maxLength = {48}
                onSubmitEditing={deleteUser}
            />)}
            <TouchableOpacity disabled={processing} style={{height: 45,width:Dimensions.get("window").width-40,borderRadius: 10,backgroundColor:"#FF72CF",justifyContent:"center"}} onPress={trydeleteUser}>
                <Text style={styles.appButtonText}>{processing ? "Processing":"Delete Account"}</Text>
            </TouchableOpacity>
        </KeyboardAvoidingView>
    )
}

export default AccountRemover

const styles = StyleSheet.create({
    appButtonText:{
        fontSize: 20,
        color:"white",
        fontWeight:"bold",
        alignSelf:"center"
    }
})
