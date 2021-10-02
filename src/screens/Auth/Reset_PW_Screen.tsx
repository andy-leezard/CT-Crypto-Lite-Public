import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Alert, ImageBackground } from 'react-native';
import { Button, Image } from 'react-native-elements';
import Env from '../../env.json'
import { auth } from '../../../firebase';
import i18n from 'i18n-js';
import { brandColor } from '../../lib/StyleLib';
import { isValidEmailAddress } from '../../lib/FuncLib';

interface Props{
    navigation:any
}

const Reset_PW_Screen:React.FC<Props> = ({ navigation }) => {
    const [email, setEmail] = useState<string>('');
    const [redoInfo, setRedoInfo] = useState<boolean>(false);
    const [msg_error, setmsg_error] = useState<string>('Incorrect information');
    const [processing, setProcessing] = useState<boolean>(false);

    const displayError = (msg:string):void => {
        setRedoInfo(true);setmsg_error(msg);
    }

    const handleError = (e:any) => {
        const errorCode = e.code;
        console.log(errorCode);
        switch(errorCode){
            case("auth/invalid-email"):
                displayError(i18n.t('case1'));
                break;
            case("auth/user-not-found"):
                displayError(i18n.t('case3'));
                break;
            case("auth/too-many-requests"):
                displayError(i18n.t('case4'));
                break;
            default:
                displayError(i18n.t('p_upgrade.er_1'));
        }
    }

    const resetPW = ():void => {
        const loweremail = email.toLowerCase();
        if(email.length <6 || !isValidEmailAddress(email)){
            setRedoInfo(true);setmsg_error(i18n.t('case1'));return;
        }else{
            setProcessing(true);
            auth.sendPasswordResetEmail(loweremail)
            .then(()=>{
                Alert.alert(
                    i18n.t('title_alert'),(i18n.t('msg_alert')+loweremail),
                [{ text: i18n.t('ok'),}]
                );
                setRedoInfo(false);
            })
            .catch(handleError)
            .finally(()=>{setProcessing(false);});
        }
    }

    return (
        <ImageBackground source={require('../../assets/bg/bg.png')} style={[styles.container,{width:"100%",height:"100%"}]}>
            <View style={{alignItems: 'center', justifyContent: 'center',}}>
                <View>
                    <Image
                    source={require('../../assets/icon_rounded.png')}
                    style={{width:40,height:40,marginBottom:5,marginTop:80,}}
                    />
                </View>
                <Text style={{color:"white",textShadowColor:brandColor(false),textShadowOffset:{width: 1, height: 1},textShadowRadius:4,marginBottom:40,fontSize:20,fontWeight:"bold"}}>{i18n.t("title_alert")}</Text>
                <View style={{width:300, alignItems:"center"}}>
                    {redoInfo && (<View style={{backgroundColor:"rgba(0,0,0,0.5)",borderWidth:1,borderColor:"#FDD7D8",borderRadius:5,padding:5,marginBottom:10}}>
                        <Text style={{color:"#ffffff",fontSize:15,fontWeight:"700"}}>{msg_error}</Text>
                    </View>)}
                    <TextInput
                        style={[styles.input,{backgroundColor: 'rgba(0,0,0,0.25)'}]}
                        autoFocus={true}
                        placeholder={i18n.t('email')}
                        placeholderTextColor={"#CCCCCC"}
                        value={email}
                        onChangeText={setEmail}
                        maxLength = {32}
                    />
                </View>
                <View style={styles.btn}>
                    <Button disabled={processing} buttonStyle={{backgroundColor:'#FFFFFF',borderRadius:5}} titleStyle={{color: "#1DC08B", fontSize: 17, fontWeight:"bold"}} title={i18n.t('reset_pw')} onPress={resetPW}/>
                </View>
                <View style={styles.btn}>
                    <Button buttonStyle={{backgroundColor:'rgba(147, 105, 219,0.75)',borderRadius:5}} titleStyle={{color: "#ffffff", fontSize: 17, fontWeight:"bold"}} title={i18n.t('cancel')} onPress={()=>navigation.goBack()}/>
                </View>
                <View style={{alignItems:"center",marginTop:50}}>
                    <Text style={{color:"#FFFFFF",fontSize:14,fontWeight:"600",marginTop:20}}>© 2021 | {i18n.t('developed_by')} Andy Lee</Text>
                    <Text style={{color:"#FFFFFF",fontSize:14,fontWeight:"600",marginTop:10}}>{Env.currentVersion}</Text>
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
        minWidth:160,
        height:40,
    }
})
