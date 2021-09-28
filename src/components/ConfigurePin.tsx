import React, { useState, useContext } from 'react';
import { StyleSheet, Text, View, Alert, TouchableOpacity, TextInput, Dimensions } from 'react-native';
import { db } from '../../firebase';
import I18n from 'i18n-js';
import { GlobalContext } from '../StateManager';
import { GlobalContextInterfaceAsReducer } from '../lib/Types';
import { containerColor, containerRadiusColor, textColor } from '../lib/StyleLib';
import { isNumber } from '../lib/FuncLib';

const screenWidth = Dimensions.get("window").width;

interface Props{
    route:any
    navigation:any
}

const ConfigurePin:React.FC<Props> = ({route, navigation}) => {
    const globalContext = useContext<GlobalContextInterfaceAsReducer>(GlobalContext);
    const [newpin, setnewpin] = useState<string>('');
    const [msg_error, setmsg_error] = useState<string>('Incorrect format');
    const [redoInfo, setRedoInfo] = useState<boolean>(false);

    const confirmPin = () => {
        if(!isNumber(newpin) && newpin.length>=1){
            setRedoInfo(true);
            setmsg_error(I18n.t('er_onlyNum'));
            return;
        }
        if(newpin.length<1){
            setRedoInfo(true);
            setmsg_error(I18n.t('er_format'));
            return;
        }
        db
            .collection('users')
            .doc(globalContext.state.auth.userEmail!)
            .update({
                pin: newpin,
            })
            .then(()=> {
                setnewpin('');
                  Alert.alert(
                    I18n.t('notification'),
                    (I18n.t('notif_newPIN')+" :"+newpin),
                [{ text: I18n.t('ok'),}]
                );
                navigation.goBack();
            })
            .catch((err)=>{
                setmsg_error(err);
            })
    }

    return (
        <View style={{flex:1,paddingTop:15}}>
            <View>
                <Text style={{fontSize:17,fontWeight:"600",letterSpacing:0.5,color:textColor(globalContext.state.env.darkmode!),marginLeft:15,marginBottom:10}}>{I18n.t('new_pin')}</Text>
                {redoInfo && <View style={{backgroundColor:"rgba(0,0,0,0.5)",borderWidth:1,borderColor:"#FDD7D8",borderRadius:10,padding:5,width:screenWidth-40,alignSelf:"center",marginBottom:10}}>
                    <Text style={{color:"#ffffff",fontSize:15,fontWeight:"700"}}>{msg_error}</Text>
                </View>}
                <TextInput style={[styles.input,{backgroundColor:containerColor(globalContext.state.env.darkmode!),borderColor:containerRadiusColor(globalContext.state.env.darkmode!),color:textColor(globalContext.state.env.darkmode!)}]} value={newpin} onChangeText={setnewpin} keyboardType="numeric" maxLength = {8} onSubmitEditing={confirmPin}/>
                <TouchableOpacity style={{alignSelf:"center", height: 45, width: Dimensions.get("window").width-40,justifyContent:"center", alignItems:"center",backgroundColor:"#73A1FF",borderRadius:10}} onPress={()=>confirmPin()}>
                    <Text style={{fontSize:17,color:"white",fontWeight:"bold"}}>{I18n.t('confirm')}</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default ConfigurePin

const styles = StyleSheet.create({
    input: {
        alignSelf:"center",
        height: 35,
        width: screenWidth-40,
        paddingLeft: 10,
        borderWidth: 1,
        borderRadius: 10,
        fontSize:15,
        marginBottom:15
    }
})