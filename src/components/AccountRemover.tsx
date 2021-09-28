import React, { useState, useContext } from 'react';
import { StyleSheet, Text, View, Alert, TouchableOpacity, TextInput, Dimensions, Platform } from 'react-native';
import { auth } from '../../firebase';
import { KeyboardAvoidingView } from 'react-native';
import axios from 'axios';
import i18n from 'i18n-js';
import { GlobalContext } from '../StateManager';
import { GlobalContextInterfaceAsReducer } from '../lib/Types';
import Env from '../env.json';
import { containerColor, containerRadiusColor } from '../lib/StyleLib';

interface Props{
    route:any
    navigation:any
}

const AccountRemover:React.FC<Props> = ({route, navigation}) => {
    const globalContext = useContext<GlobalContextInterfaceAsReducer>(GlobalContext);
    const [pw, setpw] = useState<string>('');
    const [msg_error, setmsg_error] = useState<string>(i18n.t('er_pw'));
    const [processing, setProcessing] = useState<boolean>(false);

    const requestConfirm = () =>{
        Alert.alert(
            i18n.t('warning'),i18n.t('r_u_sure'),
        [
            { text: i18n.t('yes'), onPress: () =>  deleteUser() },
            { text: i18n.t('no'), style: "cancel"}
        ]
        );
    }
    const deleteUser = () => {
        const email = auth.currentUser!.email!;
        auth
            .signInWithEmailAndPassword(email, pw)
            .then(()=>{
                setProcessing(true);
                axios.post(Env.cfapi_remove_user, { userEmail: email }).then((res)=>{
                    console.log(res.data);
                    auth.signOut();
                }).catch((e)=>{setmsg_error(e.message);})
            })
            .catch(handleError);
    }
    const handleError = (e:any) => {
        const errorCode = e.code;
        console.log(errorCode);
        if(errorCode == "auth/invalid-email"){
            setmsg_error(i18n.t('case1'));
        }else if(errorCode == "auth/wrong-password"){
            setmsg_error(i18n.t('case2'));
        }else if(errorCode == "auth/user-not-found"){
            setmsg_error(i18n.t('case3'));
        }else{
            setmsg_error(e.message);
        }
    }

    return (
        <KeyboardAvoidingView style={{flex:1,paddingTop:15,alignItems:"center"}} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            {!processing && (<View style={{backgroundColor:"rgba(0,0,0,0.5)",borderWidth:1,borderColor:"#FDD7D8",borderRadius:5,padding:5,width:Dimensions.get("window").width-40,marginBottom:10,justifyContent:"center"}}>
                <Text style={{color:"#ffffff",fontSize:15,fontWeight:"500"}}>{msg_error}</Text>
            </View>)}
            {!processing &&
            (<TextInput
                secureTextEntry={true}
                style={{backgroundColor: containerColor(globalContext.state.env.darkmode!),borderWidth:1,borderColor:containerRadiusColor(globalContext.state.env.darkmode!),borderRadius: 5,color:"#ffffff",height: 35,width:Dimensions.get("window").width-40,marginHorizontal:14,fontSize:15,marginBottom:10,paddingHorizontal:5}}
                value={pw} onChangeText={setpw} maxLength = {48}
                onSubmitEditing={deleteUser}
            />)}
            <TouchableOpacity disabled={processing} style={{height: 45,width:Dimensions.get("window").width-40,borderRadius: 10,backgroundColor:"#FF72CF",justifyContent:"center"}} onPress={requestConfirm}>
                <Text style={styles.appButtonText}>{processing ? i18n.t('processing'):i18n.t('delete_acc')}</Text>
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
