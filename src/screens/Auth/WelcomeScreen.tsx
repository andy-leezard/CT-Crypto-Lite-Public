import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Alert, TouchableOpacity, ImageBackground, Dimensions } from 'react-native';
import { Image } from 'react-native-elements';
import Env from '../../env.json'
import { db, auth } from '../../../firebase';
import I18n from 'i18n-js';
import { brandColor } from '../../lib/StyleLib';
import { DocumentSnapshot } from '@firebase/firestore-types'

const screenWidth = Dimensions.get('window').width;

interface Props{
    username:string
    email:string
}

const WelcomeScreen:React.FC<Props> = ({username, email}) => {
    const [startingBonus,setStartingBonus] = useState<number>(1000);
    const langid = I18n.currentLocale();
    
    useEffect(() => {
        db.collection('globalEnv').doc('variables').get().then((doc:DocumentSnapshot)=>{
            (doc.exists) ? setStartingBonus(doc.data()!.starting_bonus) : setStartingBonus(1000);
        }).catch(()=>{setStartingBonus(1000);});
    }, [])

    const resend = ():void => {
        if(auth.currentUser){
            auth.currentUser.sendEmailVerification();
            Alert.alert(
                I18n.t('p_welcome.mail_verif'),(I18n.t('p_welcome.mail_verif_msg') + " : "+auth.currentUser.email),
            [{ text: I18n.t('ok'),}]
            );
        }else{
            Alert.alert(
                I18n.t('error'),(I18n.t('p_upgrade.er_1')),
            [{ text: I18n.t('ok'),}]
            );
        }
    }
    const BonusMessage = ():JSX.Element => {
        if(langid.includes('ko') || langid.includes('ja')){ //inverse sentence order
            return(
                <>
                <Text style={{color:"#FFFFFF",fontSize:18,fontWeight:"600",marginTop:5,textShadowColor:brandColor(false),textShadowOffset:{width: 1, height: 1},textShadowRadius:3}}>{startingBonus} {I18n.t('p_welcome.bonus')}</Text>
                <Text style={{color:"#FFFFFF",fontSize:17,fontWeight:"600",marginTop:10,textShadowColor:brandColor(false),textShadowOffset:{width: 1, height: 1},textShadowRadius:3}}>{I18n.t('p_welcome.begin_1')}</Text>
                </>
            )
        }else{
            return(
                <>
                <Text style={{color:"#FFFFFF",fontSize:17,fontWeight:"600",marginTop:10,textShadowColor:brandColor(false),textShadowOffset:{width: 1, height: 1},textShadowRadius:3}}>{I18n.t('p_welcome.begin_1')}</Text>
                <Text style={{color:"#FFFFFF",fontSize:18,fontWeight:"600",marginTop:5,textShadowColor:brandColor(false),textShadowOffset:{width: 1, height: 1},textShadowRadius:3}}>{I18n.t('p_welcome.with')} {startingBonus} {I18n.t('p_welcome.bonus')}</Text>
                </>
            )
        }
    }

    return (
        <ImageBackground source={require('../../assets/bg/bg.png')} style={styles.container}>
            <View style={{flex:1}}>
                <View style={{flexDirection:"column",alignItems: 'center', justifyContent:"space-between",height:Dimensions.get('window').height-75}}>
                    <View style={{alignItems:"center"}}>
                        <Image
                        source={require('../../assets/icon_rounded.png')}
                        style={{width:50,height:50,marginBottom:5,marginTop:100,}}
                        />
                        {(username.length>5) ? (
                            <View style={{width:screenWidth-20, alignItems:"center"}}>
                            <Text style={{color:"#FFFFFF",fontSize:20,fontWeight:"bold",textShadowColor:brandColor(false),textShadowOffset:{width: 1, height: 1},textShadowRadius:4}}>{I18n.t('welcome').toUpperCase()},</Text>
                            <Text style={{color:"#FFFFFF",fontSize:20,fontWeight:"bold",textShadowColor:brandColor(false),textShadowOffset:{width: 1, height: 1},textShadowRadius:4}}>{username.toUpperCase()}!</Text>
                            </View>
                        ):(
                            <View style={{width:screenWidth-20, alignItems:"center"}}>
                            <Text style={{color:"#FFFFFF",fontSize:20,fontWeight:"bold",textShadowColor:brandColor(false),textShadowOffset:{width: 1, height: 1},textShadowRadius:4}}>{I18n.t('welcome').toUpperCase()}, {username.toUpperCase()}!</Text>
                            </View>
                        )}
                        <BonusMessage/>
                    </View>
                        
                    <View style={{alignItems:"center"}}>
                        <Text style={{color:"#FFFFFF",fontSize:18,fontWeight:"600",textShadowColor:brandColor(false),textShadowOffset:{width: 1, height: 1},textShadowRadius:3}}>{I18n.t('p_welcome.pls_verif')}</Text>
                        <Text style={{color:"#FFFFFF",fontSize:18,fontWeight:"600",textShadowColor:brandColor(false),textShadowOffset:{width: 1, height: 1},textShadowRadius:3}}> - {email} - </Text>
                    </View>

                    <TouchableOpacity onPress={resend}>
                        <Text style={{color:"white",fontSize:14,fontWeight:"600", alignSelf:"center"}}>{I18n.t('p_welcome.er1')}</Text>
                        <Text style={{color:"white",fontSize:16,fontWeight:"bold",marginTop:10, alignSelf:"center"}}>{I18n.t('p_welcome.resend')}</Text>
                    </TouchableOpacity>
                    <View>
                        <TouchableOpacity onPress={()=>auth.signOut()}>
                            <Text style={{color:"white",fontSize:14,fontWeight:"600",marginBottom:70, alignSelf:"center"}}>{I18n.t('p_welcome.try_diff')}</Text>
                        </TouchableOpacity>
                        <Text style={{color:"white",fontSize:14,fontWeight:"600",alignSelf:"center"}}>© 2021 | {I18n.t('developed_by')} Andy Lee</Text>
                        <Text style={{color:"white",fontSize:12,fontWeight:"600",marginTop:10, alignSelf:"center"}}>{Env.currentVersion}</Text>
                    </View>
                </View>
            </View>
        </ImageBackground>
    )
}

export default WelcomeScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: "flex-start",
        width: '100%',
        height: '100%'
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
