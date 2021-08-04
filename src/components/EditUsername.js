import React, {useState} from 'react';
import { StyleSheet, Text, View, Alert, TouchableOpacity, TextInput, Dimensions, Image } from 'react-native';
import { db } from '../../firebase';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from "react-native-appearance";

const EditUsername = ({route, navigation}) => {
    const scheme = useColorScheme();
    const [msg_username_error, setmsg_username_error] = useState('Incorrect format');
    const { email } = route.params;
    const [redoInfo_username, setRedoInfo_username] = useState(false);
    const [newusername, setnewusername] = useState('');

    const confirmNewUsername = () => {
        if(newusername.trimStart()===""){//.trimStart() remove spaces for the beginning part of the string.
            toggleConfigureUsername();
            console.log("cancel new username");
            return;
        } 
        if(newusername.length<2){
            setRedoInfo_username(true);
            setmsg_username_error("error - username too short");
            return;
        }
        db
            .collection('users')
            .doc(email)
            .update({
                username: newusername,
            })
            .then(()=> {
                setRedoInfo_username(false);
                  //console.log("PIN set to : ", newusername)
                  Alert.alert(
                    "Notification",
                    ("Your new username is :"+newusername),
                [{ text: "OK",}]
                );
                navigation.goBack();
            })
            .catch((err)=>{
                setRedoInfo_username(true);
                setmsg_username_error(err);
            })
    }

    const bool_isDarkMode = () => {
        return scheme === "dark";
    }
    const bgColor = () => {
        return bool_isDarkMode() ? "#000000":"#FFFFFF";
    }
    const textColor = () => {
        return bool_isDarkMode() ? "#FFFFFF":"#000000";
    }
    const containerColor = () => {
        return bool_isDarkMode() ? "#2e2e2e":"#e8e8e8";
    }
    const containerRadiusColor = () => {
        return bool_isDarkMode() ? "#CCCCCC":"#4a4a4a";
    }

    return (
        <SafeAreaView style={{flex:1,backgroundColor:bgColor()}}>
            <View>
                <Text style={{fontSize:17,fontWeight:"600",letterSpacing:0.5,color:textColor(),marginLeft:15,marginBottom:10}}>New Username</Text>
                {redoInfo_username && <View style={{backgroundColor:"#FA8283",borderWidth:1,borderColor:"#FDD7D8",borderRadius:5,padding:5,width:320,marginLeft:5,marginRight:15,marginBottom:10}}>
                    <Text style={{color:"#ffffff",fontSize:15,fontWeight:"700"}}>{msg_username_error}</Text>
                </View>}
                <TextInput style={[styles.input,{backgroundColor:containerColor(),borderColor:containerRadiusColor()}]} color={textColor()} label="Newusername" value={newusername} onChangeText={setnewusername} maxLength = {20}/>
                <TouchableOpacity style={{alignSelf:"center", height: 45, width: Dimensions.get("window").width-40,justifyContent:"center", alignItems:"center",backgroundColor:"#73A1FF",borderRadius:10}} onPress={()=>confirmNewUsername()}>
                    <Text style={{fontSize:17,color:"white",fontWeight:"bold"}}>Confirm</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}

export default EditUsername

const styles = StyleSheet.create({
    input: {
        alignSelf:"center",
        height: 35,
        width: Dimensions.get("window").width-40,
        paddingLeft: 10,
        borderWidth: 1,
        borderRadius: 10,
        fontSize:15,
        marginBottom:15
    }
})