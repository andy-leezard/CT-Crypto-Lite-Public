import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ImageBackground } from 'react-native';
import { Button, Image } from 'react-native-elements';
import { auth } from '../../../firebase';
import Env from '../../env.json';
import i18n from 'i18n-js';
import { brandColor } from '../../lib/StyleLib';

interface Props {
    navigation:any
}

const LoginScreen:React.FC<Props> = ({ navigation }) => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [redoInfo, setRedoInfo] = useState<boolean>(false);
    const [msg_error, setmsg_error] = useState<string>('Incorrect information');
    const [hidepw, setHidePw] = useState<boolean>(true);

    const displayError = (msg:string) => {
        setRedoInfo(true);setmsg_error(msg);
    }
    const togglePW = () => {
        setHidePw(!hidepw);
    }
    const navigateTo = (address:string) => {
        setRedoInfo(false);
        navigation.navigate(address);
    }
    const firebaseSignIn = () =>{
        auth
          .signInWithEmailAndPassword(email, password)
          .then(() => {
            console.log('User signed in!');
            setRedoInfo(false);
          })
          .catch(handleError);
    }
    const handleError = (e:any) => {
        const errorCode = e.code;
        console.log(errorCode);
        switch(errorCode){
            case("auth/invalid-email"):
                displayError(i18n.t('case1'));
                break;
            case("auth/wrong-password"):
                displayError(i18n.t('case2'));
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

    return (
        <ImageBackground source={require('../../assets/bg/bg.png')} style={[styles.container,{width:"100%",height:"100%"}]}>
            <View style={{alignItems: 'center', justifyContent: 'center',marginTop:100}}>
                <View>
                    <Image
                        source={require('../../assets/icon_rounded.png')}
                        style={{width:40,height:40,marginBottom:5,}}
                    />
                </View>
                <Text style={{color:"#FFFFFF",fontSize:24,fontWeight:"bold",textShadowColor:brandColor(false),textShadowOffset:{width: 1, height: 1},textShadowRadius:4,marginBottom:40}}>{i18n.t('welcome')}</Text>
                <View style={{width:300, alignItems:"center"}}>
                    {redoInfo && (<View style={{backgroundColor: 'rgba(0,0,0,0.5)',borderWidth:1,borderColor:"#FDD7D8",borderRadius:5,padding:5,marginBottom:10}}>
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
                    <View style={{justifyContent:"center"}}>
                        <TextInput
                            style={[styles.input,{backgroundColor: 'rgba(0,0,0,0.25)'}]}
                            secureTextEntry={hidepw}
                            placeholder={i18n.t('password')}
                            placeholderTextColor={"#CCCCCC"}
                            value={password}
                            onChangeText={setPassword} onSubmitEditing={firebaseSignIn}
                            maxLength = {64}
                        />
                        <TouchableOpacity style={{position:"absolute",alignSelf:"flex-end"}} onPress={togglePW}>
                            {hidepw ? (
                            <Image source={require('../../assets/icons/1x/hide.png')} style={{width:20,height:20,tintColor:"white",marginRight:25}}/>
                            ):(
                            <Image source={require('../../assets/icons/1x/view.png')} style={{width:20,height:20,tintColor:"white",marginRight:25}}/>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.btn}>
                    <Button buttonStyle={{backgroundColor:"#FFFFFF",borderRadius:5}} titleStyle={{color: "#4784ff", fontSize: 18, fontWeight:"bold"}} title={i18n.t('signin')} onPress={firebaseSignIn}/>
                </View>
                <View style={styles.btn}>
                    <Button buttonStyle={{backgroundColor:"#5d9cd4",borderRadius:5}} titleStyle={{color: "#ffffff", fontSize: 19, fontWeight:"bold"}} title={i18n.t('signup')} onPress={()=>navigateTo('Approval')}/>
                </View>
                <TouchableOpacity onPress={()=>navigateTo('PW')}>
                  <Text style={{color:"#FFFFFF",fontSize:16,fontWeight:"600",marginTop:20, alignSelf:"center"}}>{i18n.t('needhelp')}</Text>
                </TouchableOpacity>
                <View style={{alignItems:"center",marginTop:50}}>
                    <Text style={{color:"#FFFFFF",fontSize:14,fontWeight:"600",marginTop:20}}>© 2021 | {i18n.t('developed_by')} Andy Lee</Text>
                    <Text style={{color:"#FFFFFF",fontSize:14,fontWeight:"600",marginTop:10}}>{Env.currentVersion}</Text>
                </View>
            </View>
        </ImageBackground>
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
