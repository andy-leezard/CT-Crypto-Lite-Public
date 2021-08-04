import React from 'react'
import { StyleSheet, Text, SafeAreaView, Image, Platform } from 'react-native'
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from "react-native-appearance";
import Env from '../../env.json';

const LoadingScreen = () => {
    const scheme = useColorScheme();

    const bool_isDarkMode = () => {
        return scheme === "dark";
    }
    const brandTextColor = () => {
        return bool_isDarkMode() ? Env.brandText_Dark:Env.brandText_Light;
    }

    return (
        <SafeAreaView style={[styles.container,bool_isDarkMode() ? styles.bg_dark : styles.bg_light]}>
            <StatusBar style="auto"/>
                <Image
                    source={require('../../assets/icon.png')}
                    style={[{width:40,height:40,marginBottom:5,marginTop:100,},(Platform.OS === 'ios') && {borderRadius:5}]}
                />
                <Text style={{color:brandTextColor(),fontSize:20,fontWeight:"bold"}}>CoinTracer</Text>
        </SafeAreaView>
    )
}

export default LoadingScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: "flex-start",
    },
    bg_light: {
      backgroundColor: "white",
    },
    bg_dark: {
      backgroundColor: "#000000"
    }
})
