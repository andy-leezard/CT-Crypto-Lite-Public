import React, {useState} from 'react';
import { StyleSheet, Text, View, Alert, TouchableOpacity, TextInput, Image, Dimensions } from 'react-native';
import { db } from '../../firebase';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from "react-native-appearance";

const ConfigurePin = ({route, navigation}) => {
    const scheme = useColorScheme();
    const [newpin, setnewpin] = useState('');
    const { email } = route.params;

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

    const confirmPin = async() => {
        if(newpin.length <1){
            return;
        }
        return db
            .collection('users')
            .doc(email)
            .update({
                pin: newpin,
            })
            .then(()=> {
                  //console.log("PIN set to : ", newpin)
                setnewpin('');
                  Alert.alert(
                    "Notification",
                    ("Your new PIN code is :"+newpin),
                [{ text: "OK",}]
                );
                navigation.goBack();
            })
            .catch((err)=>{
                setmsg_pin_error(err);
            })
    }

    return (
        <SafeAreaView style={{flex:1,backgroundColor:bgColor()}}>
            <View>
                <Text style={{fontSize:17,fontWeight:"600",letterSpacing:0.5,color:textColor(),marginLeft:15,marginBottom:10}}>New PIN</Text>
                <TextInput style={[styles.input,{backgroundColor:containerColor(),borderColor:containerRadiusColor()}]} color={textColor()} label="Newpin" value={newpin} onChangeText={setnewpin} keyboardType="numeric" maxLength = {8} onSubmitEditing={confirmPin}/>
                <TouchableOpacity style={{alignSelf:"center", height: 45, width: Dimensions.get("window").width-40,justifyContent:"center", alignItems:"center",backgroundColor:"#73A1FF",borderRadius:10}} onPress={()=>confirmPin()}>
                    <Text style={{fontSize:17,color:"white",fontWeight:"bold"}}>Confirm</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}

export default ConfigurePin

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