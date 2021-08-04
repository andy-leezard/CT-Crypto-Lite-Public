import React, {useState} from 'react';
import { StyleSheet, Text, View, Alert, TouchableOpacity, TextInput, Dimensions, } from 'react-native';
import { auth } from '../../firebase';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from "react-native-appearance";
import { KeyboardAvoidingView } from 'react-native';

const AccountRemover = ({route, navigation}) => {
    const [pw, setpw] = useState('');
    const [msg_error, setmsg_error] = useState('Please re-enter password');
    const scheme = useColorScheme();
    const bool_isDarkMode = () => {
        return scheme === "dark";
    }
    const bgColor = () => {
        return bool_isDarkMode() ? "#000000":"#FFFFFF";
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
        const user = auth.currentUser;
        auth
            .signInWithEmailAndPassword(user.email, pw)
            .then(() => {
                user.delete().then(() => {
                        auth.signOut();
                        navigation.goBack();
                    }).catch((error) => {
                        setmsg_error(error.message);
                    });
            })
            .catch(error => {
                setmsg_error(error.message);
            });
    }

    return (
        <SafeAreaView>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
                <View style={{backgroundColor:bgColor(), justifyContent:"center", alignItems:"center"}}>
                    <View style={{backgroundColor:"#FA8283",height:35,borderWidth:1,borderColor:"#FDD7D8",borderRadius:5,padding:5,width:Dimensions.get("window").width-40,marginBottom:10,justifyContent:"center"}}>
                        <Text style={{color:"#ffffff",fontSize:15,fontWeight:"500"}}>{msg_error}</Text>
                    </View>
                    <TextInput style={{backgroundColor: containerColor(),borderWidth:1,borderColor:containerRadiusColor(),borderRadius: 5,color:"#ffffff",height: 35,width:Dimensions.get("window").width-40,marginHorizontal:14,fontSize:15,marginBottom:10}} color="#ffffff" label="password" value={pw} onChangeText={setpw} maxLength = {48}/>
                    <TouchableOpacity style={{height: 45,width:Dimensions.get("window").width-40,borderRadius: 10,backgroundColor:"#FF72CF",justifyContent:"center"}} onPress={trydeleteUser}>
                        <Text style={styles.appButtonText}>Delete Account</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
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
