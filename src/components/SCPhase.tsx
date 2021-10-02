import React, { useContext } from 'react';
import I18n from 'i18n-js';
import { View, ScrollView, Text } from 'react-native';
import Env from '../env.json';
import { GlobalContext, MainContext } from '../StateManager';
import { GlobalContextInterfaceAsReducer, MainContextInterface } from '../lib/Types';
import { containerColor, dynamic_bottom_tab_Height, textColor } from '../lib/StyleLib';

interface Props{
    route:any
    navigation:any
}

const SCPhase:React.FC<Props> = ({route, navigation}) => {
    const globalContext = useContext<GlobalContextInterfaceAsReducer>(GlobalContext);
    const mainContext = useContext<MainContextInterface>(MainContext);
    const locale = I18n.currentLocale();

    const displayDate = () => {
        let year = Env.lastUpdated_year ?? 2021;
        let month = (Env.lastUpdated_month ?? 8)-1;
        let day = Env.lastUpdated_day ?? 22;
        return new Date(year, month, day).toLocaleDateString(locale)
    }

    return (
        <View style={{alignItems:"center",height:globalContext.state.env.screenHeight-dynamic_bottom_tab_Height(Boolean(mainContext.user.adblock || mainContext.adEnv.globalAdBlock))}}>
            <View style={{flex:1,width: globalContext.state.env.screenWidth,marginVertical:15,paddingHorizontal:10}}>
                <ScrollView style={{borderRadius:10, backgroundColor:containerColor(globalContext.state.env.darkmode!),paddingHorizontal:10,paddingVertical:5}}>
                    <Text style={{color:textColor(globalContext.state.env.darkmode!),fontSize:20,fontWeight:"700",marginBottom:5}}>{I18n.t('scphase._1')}</Text>
                    <Text style={{color:textColor(globalContext.state.env.darkmode!),fontSize:15,fontWeight:"500",marginLeft:10}}>{I18n.t('version')} {Env.currentVersion} ({displayDate()})</Text>
                    <Text style={{color:textColor(globalContext.state.env.darkmode!),fontSize:15,fontWeight:"500",marginLeft:10}}>{I18n.t('scphase._2')} :</Text>
                    <Text style={{color:textColor(globalContext.state.env.darkmode!),fontSize:15,fontWeight:"500",marginLeft:15}}> - {I18n.t('scphase._2_1')}</Text>
                    <Text style={{color:textColor(globalContext.state.env.darkmode!),fontSize:15,fontWeight:"500",marginLeft:15}}> - {I18n.t('scphase._2_2')}</Text>
                    <Text style={{color:textColor(globalContext.state.env.darkmode!),fontSize:15,fontWeight:"500",marginLeft:15}}> - {I18n.t('scphase._2_3')}</Text>
                    <Text style={{color:textColor(globalContext.state.env.darkmode!),fontSize:20,fontWeight:"700",marginTop:5,marginBottom:5}}>{I18n.t('scphase._3')}</Text>
                    <Text style={{color:textColor(globalContext.state.env.darkmode!),fontSize:16,fontWeight:"500",marginLeft:10}}>{I18n.t('scphase._3_1')}</Text>
                    <Text style={{color:textColor(globalContext.state.env.darkmode!),fontSize:15,fontWeight:"500",marginLeft:10}}>{I18n.t('scphase._3_2')}</Text>
                    <Text style={{color:textColor(globalContext.state.env.darkmode!),fontSize:20,fontWeight:"700",marginTop:5,marginBottom:5}}>{I18n.t('contact')}</Text>
                    <Text style={{color:textColor(globalContext.state.env.darkmode!),fontSize:15,fontWeight:"500",marginLeft:10}}>{I18n.t('scphase._4')}</Text>
                    <Text style={{color:textColor(globalContext.state.env.darkmode!),fontSize:15,fontWeight:"500",marginLeft:15}}> - {I18n.t('scphase._4_1')}</Text>
                    <Text style={{color:textColor(globalContext.state.env.darkmode!),fontSize:15,fontWeight:"500",marginLeft:15}}> - {I18n.t('scphase._4_2')}</Text>
                    <Text style={{color:textColor(globalContext.state.env.darkmode!),fontSize:15,fontWeight:"500",marginLeft:10}}>{I18n.t('scphase._5')}</Text>
                </ScrollView>
            </View>
        </View>
    )
}

export default SCPhase
