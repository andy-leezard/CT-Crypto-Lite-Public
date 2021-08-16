import React from 'react';
import { StyleSheet, Text, View, Dimensions, ScrollView, Platform, ImageBackground } from 'react-native';
import { Button, Image } from 'react-native-elements';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from "react-native-appearance";
import TNC from '../../components/TNC';
import Env from '../../env.json';

const ApprovalScreen = ({navigation}) => {
    const scheme = useColorScheme();
    const bool_isDarkMode = () => {
      return scheme === "dark";
    }
    const brandTextColor = () => {
      return bool_isDarkMode() ? Env.brandText_Dark:Env.brandText_Light;
    }
    const containerColor = () => {
      return bool_isDarkMode() ? "#1c1c1c":"#e8e8e8";
    }
    const dynamicHeight = () => {
      return (Platform.OS === 'ios') ? 450:400;
    }
    
    return (
        <ImageBackground source={require('../../assets/bg/bg.png')} style={[styles.container,{width:"100%",height:"100%",paddingHorizontal:20}]}>
            <StatusBar style="auto"/>
            <View style={{alignItems: 'center', justifyContent: 'center'}}>
              <View>
                <Image
                  source={require('../../assets/icon_rounded.png')}
                  style={{width:40,height:40,marginBottom:5,marginTop:70,}}
                />
              </View>
              <Text style={{color:"#FFFFFF",fontSize:24,fontWeight:"bold",textShadowColor:brandTextColor(),textShadowOffset:{width: 1, height: 1},textShadowRadius:6,marginBottom:10}}>Conditions of Use</Text>
            </View>
            <View style={{height:Dimensions.get("window").height - dynamicHeight(), alignSelf:"center",marginBottom:10,padding:10,marginHorizontal:10,borderRadius:10,backgroundColor:containerColor()}}>
                <ScrollView>
                  <TNC candeleteacc={""}/>
                </ScrollView>
            </View>
            <View style={styles.btn}>
              <Button buttonStyle={{backgroundColor:"#FFFFFF",borderRadius:5}} titleStyle={{color: "#4784ff", fontSize: 16, fontWeight:"bold"}} title="approve & register" onPress={()=>navigation.navigate('Register')}/>
            </View>
            <View style={styles.btn}>
              <Button buttonStyle={{backgroundColor:"#69648f",borderRadius:5}} titleStyle={{color: "#ffffff", fontSize: 16, fontWeight:"bold"}} title="back" onPress={()=>navigation.goBack()}/>
            </View>
        </ImageBackground>
    )
}

export default ApprovalScreen

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
      width:200,
      height:50,
  }
})
