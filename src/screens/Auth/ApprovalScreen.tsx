import React, { useContext } from 'react';
import { GlobalContext } from '../../StateManager';
import { GlobalContextInterfaceAsReducer } from '../../lib/Types';
import { brandColor, containerColor_quater, textColor } from '../../lib/StyleLib';
import { StyleSheet, Text, View, Dimensions, ScrollView, Platform, ImageBackground } from 'react-native';
import { Button, Image } from 'react-native-elements';
import TNC from '../../components/TNC';
import i18n from 'i18n-js';

interface Props{
  navigation:any
}

const ApprovalScreen:React.FC<Props> = ({ navigation }) => {
    const globalContext = useContext<GlobalContextInterfaceAsReducer>(GlobalContext);

    const dynamicHeight = () => {
      return (Platform.OS === 'ios') ? 450:400;
    }
    
    return (
        <ImageBackground source={require('../../assets/bg/bg.png')} style={[styles.container,{width:"100%",height:"100%",paddingHorizontal:20}]}>
            <View style={{alignItems: 'center', justifyContent: 'center',marginTop:70}}>
              <View>
                <Image
                  source={require('../../assets/icon_rounded.png')}
                  style={{width:40,height:40,marginBottom:5,}}
                />
              </View>
              <Text style={{color:"#FFFFFF",fontSize:24,fontWeight:"bold",textShadowColor:brandColor(false),textShadowOffset:{width: 1, height: 1},textShadowRadius:4,marginBottom:10}}>{i18n.t('tnc')}</Text>
            </View>
            <View style={{height:Dimensions.get("window").height - dynamicHeight(), alignSelf:"center",marginBottom:10,padding:10,marginHorizontal:10,borderRadius:10,backgroundColor:containerColor_quater(globalContext.state.env.darkmode!)}}>
                <ScrollView>
                  <TNC textColor={textColor(globalContext.state.env.darkmode!)}/>
                </ScrollView>
            </View>
            <View style={styles.btn}>
              <Button buttonStyle={{backgroundColor:"#FFFFFF",borderRadius:5}} titleStyle={{color: "#4784ff", fontSize: 16, fontWeight:"bold"}} title={i18n.t('anr')} onPress={()=>navigation.navigate('Register')}/>
            </View>
            <View style={styles.btn}>
              <Button buttonStyle={{backgroundColor:"#69648f",borderRadius:5}} titleStyle={{color: "#ffffff", fontSize: 16, fontWeight:"bold"}} title={i18n.t('cancel')} onPress={()=>navigation.goBack()}/>
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
