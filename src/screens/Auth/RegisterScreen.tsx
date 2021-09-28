import React, { useContext, useState } from 'react';
import { StyleSheet, Text, View, TextInput, ImageBackground, TouchableOpacity } from 'react-native';
import { Button, Image } from 'react-native-elements';
import { db, auth } from '../../../firebase';
import Env from '../../env.json';
import i18n from 'i18n-js';
import { brandColor } from '../../lib/StyleLib';
import { GlobalContext } from '../../StateManager';
import { GlobalContextInterfaceAsReducer } from '../../lib/Types';
import { isValidEmailAddress } from '../../lib/FuncLib';

interface Props{
    navigation:any
}

const RegisterScreen:React.FC<Props> = ({ navigation }) => {
    const globalContext = useContext<GlobalContextInterfaceAsReducer>(GlobalContext);
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [redoInfo, setRedoInfo] = useState<boolean>(false);
    const [username, setUsername] = useState<string>('');
    const [msg_error, setmsg_error] = useState<string>('Incorrect information');
    const [hidepw, setHidePw] = useState<boolean>(true);

    const registerHandler = ():void => {
        if(username.length <2){
        setRedoInfo(true);setmsg_error(i18n.t('regi_er4'));return;
        }else if(email.length <6 || isValidEmailAddress(email) === false){
        setRedoInfo(true);setmsg_error(i18n.t('regi_er2'));return;
        }else if(password.length <6){
        setRedoInfo(true);setmsg_error(i18n.t('regi_er3'));return;
        }else{
            createUser(email.toLowerCase());
        }
    }
    const togglePW = ():void => {
        setHidePw(!hidepw);
    }
    const handleError = (e:any):void => {
        setRedoInfo(true);//console.log(e);
        const errorCode = e.code;
        if(errorCode == 'auth/email-already-in-use'){
            setmsg_error(i18n.t('regi_er1'));
        }else if(errorCode == 'auth/invalid-email'){
            setmsg_error(i18n.t('regi_er2'));
        }else if(errorCode == 'auth/weak-password'){
            setmsg_error(i18n.t('regi_er3'));
        }else{
            if(e.message){
                setmsg_error(e.message);
            }else{
                setmsg_error(JSON.stringify(e));
            }
        }
    }
    const createUser = (loweremail:string):void => {
        auth.createUserWithEmailAndPassword(loweremail,password)
            .then((authUser) => {
                db.collection('users').doc(loweremail).set({username: username,})
                authUser.user && authUser.user.sendEmailVerification();
            })
            .catch(handleError)
            .finally(()=>{
                console.log("User successfully created & set username & asked for email verification :", loweremail);
            })
    }

    return (
        <ImageBackground source={require('../../assets/bg/bg.png')} style={styles.container} >
            <View style={{alignItems: 'center', justifyContent: 'center',}}>
                <View>
                    <Image
                    source={require('../../assets/icon_rounded.png')}
                    style={{width:40,height:40,marginBottom:5,marginTop:80,}}
                    />
                </View>
                <Text style={{color:"#FFFFFF",fontSize:24,fontWeight:"bold",textShadowColor:brandColor(globalContext.state.env.darkmode!),textShadowOffset:{width: 1, height: 1},textShadowRadius:4}}>{i18n.t("title_register")}</Text>
                <View style={{width:300, alignItems:"center",marginTop:40}}>
                    {redoInfo && (<View style={{backgroundColor:"rgba(0,0,0,0.5)",borderWidth:1,borderColor:"#FDD7D8",borderRadius:5,padding:5}}>
                        <Text style={{color:"#ffffff",fontSize:15,fontWeight:"700"}}>{msg_error}</Text>
                    </View>)}
                    <TextInput
                        style={[styles.input,{backgroundColor: 'rgba(0,0,0,0.25)'}]}
                        autoFocus={true}
                        placeholder={i18n.t("username")}
                        placeholderTextColor={"#CCCCCC"}
                        value={username}
                        onChangeText={setUsername}
                        maxLength = {20}
                    />
                    <TextInput
                        style={[styles.input,{backgroundColor: 'rgba(0,0,0,0.25)'}]}
                        placeholder={i18n.t("email")}
                        placeholderTextColor={"#CCCCCC"}
                        value={email}
                        onChangeText={setEmail}
                        maxLength = {32}
                    />
                    <View style={{justifyContent:"center"}}>
                        <TextInput
                            style={[styles.input,{backgroundColor: 'rgba(0,0,0,0.25)'}]}
                            secureTextEntry={hidepw}
                            placeholder={i18n.t("password")}
                            placeholderTextColor={"#CCCCCC"}
                            value={password}
                            onChangeText={setPassword} onSubmitEditing={registerHandler}
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
                  <Button buttonStyle={{backgroundColor:"#FFFFFF",borderRadius:5}} titleStyle={{color: "#4784ff", fontSize: 19, fontWeight:"bold"}} title={i18n.t("register")} onPress={registerHandler}/>
                </View>
                <View style={styles.btn}>
                  <Button buttonStyle={{backgroundColor:"#69648f",borderRadius:5}} titleStyle={{color: "#ffffff", fontSize: 16, fontWeight:"bold"}} title={i18n.t("cancel")} onPress={()=>navigation.goBack()}/>
                </View>
                <View style={{alignItems:"center",marginTop:50}}>
                    <Text style={{color:"#FFFFFF",fontSize:14,fontWeight:"600",marginTop:20}}>© 2021 | {i18n.t("developed_by")} by Andy Lee</Text>
                    <Text style={{color:"#FFFFFF",fontSize:14,fontWeight:"600",marginTop:10}}>{Env.currentVersion}</Text>
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
