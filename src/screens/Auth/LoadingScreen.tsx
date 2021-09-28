import React, { useState, useEffect } from 'react'
import { Image, ImageBackground, Text, View, Dimensions, TouchableOpacity } from 'react-native'
import { StatusBar } from 'expo-status-bar';
import I18n from 'i18n-js';

const screenWidth = Dimensions.get('window').width;

interface Props {
    maintenance?:boolean
    reloadable:boolean
    reload?:()=>void
}

const LoadingScreen:React.FC<Props> = ({ maintenance, reloadable, reload }) => {
    const [displayMessage, setDP] = useState<boolean>(false);
    const [failed, setFailed] = useState<boolean>(false);
    const [_time,_setTime] = useState<number>(0);

    useEffect(() => {
        const interval = setInterval(() => {
            (!failed && displayMessage) && count();
        }, 1000);
        return () => {
            clearInterval(interval);
        }
    }, [_time,displayMessage,failed])

    const count = () => {
        console.log("Loading.js - timer : ",_time+1);
        (_time>=5) ? fail():_setTime(_time+1);
    }

    const fail = () => {
        _setTime(0);
        setFailed(true);
    }

    const retry = () => {
        !displayMessage && setDP(true);
        failed && setFailed(false);
        reload && reload();
    }

    return (
        <ImageBackground source={require('../../assets/bg/bg.png')} style={{flex: 1,alignItems: 'center',justifyContent: "center",width:"100%",height:"100%"}}>
            <StatusBar style="dark"/>
                <View style={{marginBottom:120,alignItems: 'center',justifyContent: "center",width:screenWidth/1.5}}>
                    {reloadable ? (<TouchableOpacity onPress={retry}>
                        <Image
                            source={require('../../assets/icon_rounded.png')}
                            style={{width:80,height:80}}
                        />
                    </TouchableOpacity>):(
                        <Image
                        source={require('../../assets/icon_rounded.png')}
                        style={{width:80,height:80}}
                    />
                    )}
                    {(maintenance && !displayMessage) && <Text style={{color:"#FFFFFF",fontSize:16,fontWeight:"600",marginTop:20, alignSelf:"center",textAlign:"center"}}>{I18n.t('msg_maintenance')}</Text>}
                    {(reloadable && displayMessage && !failed) && <Text style={{color:"#FFFFFF",fontSize:16,fontWeight:"600",marginTop:20, alignSelf:"center",textAlign:"center"}}>{I18n.t('msg_504')}</Text>}
                    {(reloadable && displayMessage && failed) && <Text style={{color:"#FFFFFF",fontSize:16,fontWeight:"600",marginTop:20, alignSelf:"center",textAlign:"center"}}>{I18n.t('msg_504_timeout')}</Text>}
                </View>
        </ImageBackground>
    )
}

export default LoadingScreen