import React from 'react';
import { Text, View, Dimensions, SafeAreaView, ScrollView, Platform } from 'react-native';
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
    const bgColor = () => {
      return bool_isDarkMode() ? "#000000":"#FFFFFF";
    }
    const textColor = () => {
      return bool_isDarkMode() ? "#FFFFFF":"#000000";
    }
    const dynamicHeight = () => {
      return (Platform.OS === 'ios') ? 450:400;
    }
    
    return (
        <SafeAreaView style={{flex:1,backgroundColor: bgColor(),paddingHorizontal: 20}}>
            <StatusBar style="auto"/>
            <View style={{alignItems: 'center', justifyContent: 'center'}}>
              <View>
                <Image
                  source={require('../../assets/icon.png')}
                  style={{width:40,height:40,marginBottom:5,marginTop:20,}}
                />
              </View>
              <Text style={{color:brandTextColor(),marginBottom:20,fontSize:20,fontWeight:"bold"}}>CoinTracer</Text>
              <View style={{alignSelf:"flex-start", height:20}}>
                <Text style={{fontSize:20,fontWeight:"bold",color:textColor(),marginLeft:10}}>Conditions of Use</Text>
              </View>
            </View>
            <View style={{height:Dimensions.get("window").height - dynamicHeight(), alignSelf:"center",marginTop:10,paddingHorizontal:15}}>
                <ScrollView>
                  <TNC candeleteacc={""}/>
                </ScrollView>
            </View>
            <View style={{marginBottom: 15,marginTop: 25,width:300,alignSelf:"center"}}>
                <Button buttonStyle={{backgroundColor:"#665CAF",borderRadius:5}} titleStyle={{color: "#ffffff", fontSize: 16, fontWeight:"bold"}} title="approve & register" onPress={()=>navigation.navigate('Register')}/>
            </View>
            <View style={{marginBottom: 15,marginTop: 15,width:300,alignSelf:"center"}}>
              <Button buttonStyle={{backgroundColor:"#69648f",borderRadius:5}} titleStyle={{color: "#ffffff", fontSize: 16, fontWeight:"bold"}} title="back" onPress={()=>navigation.goBack()}/>
            </View>
        </SafeAreaView>
    )
}

export default ApprovalScreen
