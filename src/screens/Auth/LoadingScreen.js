import React from 'react'
import { Image, ImageBackground } from 'react-native'
import { StatusBar } from 'expo-status-bar';

const LoadingScreen = () => {
    return (
        <ImageBackground source={require('../../assets/bg/bg.png')} style={{flex: 1,alignItems: 'center',justifyContent: "center",width:"100%",height:"100%"}}>
            <StatusBar style="auto"/>
                <Image
                    source={require('../../assets/icon_rounded.png')}
                    style={{width:80,height:80,marginBottom:120}}
                />
        </ImageBackground>
    )
}

export default LoadingScreen
