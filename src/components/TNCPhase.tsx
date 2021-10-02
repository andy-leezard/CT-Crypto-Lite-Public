import React, { useContext } from 'react'
import I18n from 'i18n-js';
import { Text, View, TouchableOpacity, ScrollView, Image } from 'react-native'
import TNC from './TNC';
import { GlobalContext, MainContext } from '../StateManager';
import { GlobalContextInterfaceAsReducer, MainContextInterface } from '../lib/Types';
import { containerColor, dynamic_bottom_tab_Height, textColor } from '../lib/StyleLib';

interface Props{
    route:any
    navigation:any
}

const TNCPhase:React.FC<Props> = ({route, navigation}) => {
    const globalContext = useContext<GlobalContextInterfaceAsReducer>(GlobalContext);
    const mainContext = useContext<MainContextInterface>(MainContext);

    return (
        <View style={{paddingHorizontal: 20, paddingTop:15, height:globalContext.state.env.screenHeight-dynamic_bottom_tab_Height(Boolean(mainContext.user.adblock || mainContext.adEnv.globalAdBlock))-15}}>
            <TouchableOpacity onPress={()=>navigation.navigate("Stack_Settings_AR")}>
                <View style={{flexDirection:"row",alignItems:"center",justifyContent:"space-between",marginBottom:15}}>
                    <Text style={{flexWrap:"wrap",fontSize:18,fontWeight:"bold",letterSpacing:0.5,color:textColor(globalContext.state.env.darkmode!)}}>{I18n.t('delete_acc')}</Text>
                    <Image
                        source={require("../assets/icons/1x/arrow_darkmode.png")}
                        style={[{width:10,height:10},(!globalContext.state.env.darkmode!&&{tintColor:"#000000"})]}
                    />
                </View>
            </TouchableOpacity>
            <View style={{flex:1}}>
                <ScrollView style={{borderRadius:10, backgroundColor:containerColor(globalContext.state.env.darkmode!),paddingHorizontal:10,paddingVertical:5}}>
                    <TNC textColor={textColor(globalContext.state.env.darkmode!)}/>
                    <View style={{height:20}}/>
                </ScrollView>
            </View>
        </View>
    )
}

export default TNCPhase
