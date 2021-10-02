import React, { useEffect, useState, useContext } from 'react';
import { Text, View, ScrollView } from 'react-native';
import { db } from '../../firebase';
import Env from '../env.json';
import I18n from 'i18n-js';
import { GlobalContext, MainContext } from '../StateManager';
import { GlobalContextInterfaceAsReducer, MainContextInterface } from '../lib/Types';
import { DocumentSnapshot } from '@firebase/firestore-types'
import { containerColor, dynamic_bottom_tab_Height, textColor } from '../lib/StyleLib';

interface Props{
    route:any
    navigation:any
}

const FAQ:React.FC<Props> = ({route, navigation}) => {
    const globalContext = useContext<GlobalContextInterfaceAsReducer>(GlobalContext);
    const mainContext = useContext<MainContextInterface>(MainContext);
    const [proCommission, setProCommission] = useState<number>(0.3);
    const [defaultCommission, setDefaultCommission] = useState<number>(1);
    const [supported_cryptos, setSupportedCryptos] = useState<number>(1000);

    useEffect(() => {
        db.collection('globalEnv').doc("commission").get()
            .then((doc:DocumentSnapshot)=> {
                const data = doc.data()!;
                setDefaultCommission(data.as_percentage_default ?? 1);
                setProCommission(data.as_percentage_pro ?? 0.3);
                setSupportedCryptos(data.supported_cryptos ?? 1000);
            }).catch(()=>{
                setDefaultCommission(1);
                setProCommission(0.3);
                setSupportedCryptos(1000);
            })
    },[]);

    return(
        <View style={{alignItems:"center",height:globalContext.state.env.screenHeight-dynamic_bottom_tab_Height(Boolean(mainContext.user.adblock || mainContext.adEnv.globalAdBlock))}}>
            <View style={{flex:1,width: globalContext.state.env.screenWidth,marginTop:15,paddingHorizontal:10}}>
                <ScrollView style={{borderRadius:10, backgroundColor:containerColor(globalContext.state.env.darkmode!),paddingHorizontal:10,paddingVertical:5}}>
                    <Text style={{color:textColor(globalContext.state.env.darkmode!),fontSize:20,fontWeight:"700",marginBottom:5}}>{I18n.t('p_faq.q1')}</Text>
                    <Text style={{color:textColor(globalContext.state.env.darkmode!),fontSize:15,fontWeight:"500",marginLeft:10}}>- {I18n.t('p_faq.a1_1')}</Text>
                    <Text style={{color:textColor(globalContext.state.env.darkmode!),fontSize:15,fontWeight:"500",marginLeft:10}}>- {I18n.t('p_faq.a1_2')}</Text>
                    <Text style={{color:textColor(globalContext.state.env.darkmode!),fontSize:20,fontWeight:"700",marginTop:5,marginBottom:5}}>{I18n.t('p_faq.q2')}</Text>
                    <Text style={{color:textColor(globalContext.state.env.darkmode!),fontSize:15,fontWeight:"500",marginLeft:10}}>- {I18n.t('p_faq.a2')}</Text>
                    <Text style={{color:textColor(globalContext.state.env.darkmode!),fontSize:20,fontWeight:"700",marginTop:5,marginBottom:5}}>{I18n.t('p_faq.q3')}</Text>
                    <Text style={{color:textColor(globalContext.state.env.darkmode!),fontSize:15,fontWeight:"500",marginLeft:10}}>- {I18n.t('p_faq.a3')}</Text>
                    <Text style={{color:textColor(globalContext.state.env.darkmode!),fontSize:20,fontWeight:"700",marginTop:5,marginBottom:5}}>{I18n.t('p_faq.q4')}</Text>
                    <Text style={{color:textColor(globalContext.state.env.darkmode!),fontSize:15,fontWeight:"500",marginLeft:10}}>- {I18n.t('p_faq.a4_1')}</Text>
                    <Text style={{color:textColor(globalContext.state.env.darkmode!),fontSize:15,fontWeight:"500",marginLeft:10}}>- {I18n.t('p_faq.a4_2')}</Text>
                    <Text style={{color:textColor(globalContext.state.env.darkmode!),fontSize:20,fontWeight:"700",marginTop:5,marginBottom:5}}>{I18n.t('p_faq.q5')}</Text>
                    <Text style={{color:textColor(globalContext.state.env.darkmode!),fontSize:15,fontWeight:"500",marginLeft:10}}>- {I18n.t('p_faq.a5_1')}</Text>
                    <Text style={{color:textColor(globalContext.state.env.darkmode!),fontSize:15,fontWeight:"500",marginLeft:15}}>- {I18n.t('p_faq.a5_2')}</Text>
                    <Text style={{color:textColor(globalContext.state.env.darkmode!),fontSize:15,fontWeight:"500",marginLeft:15}}>- {I18n.t('p_faq.a5_3')}</Text>
                    <Text style={{color:textColor(globalContext.state.env.darkmode!),fontSize:15,fontWeight:"500",marginLeft:15}}>- {I18n.t('p_faq.a5_4')}</Text>
                    <Text style={{color:textColor(globalContext.state.env.darkmode!),fontSize:20,fontWeight:"700",marginTop:5,marginBottom:5}}>{I18n.t('p_faq.q6')}</Text>
                    <Text style={{color:textColor(globalContext.state.env.darkmode!),fontSize:15,fontWeight:"500",marginLeft:10}}>- {I18n.t('p_faq.a6_1')}</Text>
                    <Text style={{color:textColor(globalContext.state.env.darkmode!),fontSize:15,fontWeight:"500",marginLeft:10}}>- {I18n.t('p_faq.a6_2')}</Text>
                    <Text style={{color:textColor(globalContext.state.env.darkmode!),fontSize:15,fontWeight:"500",marginLeft:10}}>- {I18n.t('p_faq.a6_3')}</Text>
                    <Text style={{color:textColor(globalContext.state.env.darkmode!),fontSize:20,fontWeight:"700",marginTop:5,marginBottom:5}}>{I18n.t('p_faq.q7')}</Text>
                    <Text style={{color:textColor(globalContext.state.env.darkmode!),fontSize:15,fontWeight:"500",marginLeft:10}}>- {I18n.t('p_faq.a7_1_pre')}{Env.currentVersion}{I18n.t('p_faq.a7_1_suf')}</Text>
                    <Text style={{color:textColor(globalContext.state.env.darkmode!),fontSize:15,fontWeight:"500",marginLeft:10}}>- {I18n.t('p_faq.a7_2')}</Text>
                    <Text style={{color:textColor(globalContext.state.env.darkmode!),fontSize:15,fontWeight:"500",marginLeft:10}}>- {I18n.t('p_faq.a7_3')}</Text>
                    <Text style={{color:textColor(globalContext.state.env.darkmode!),fontSize:20,fontWeight:"700",marginTop:5,marginBottom:5}}>{I18n.t('p_faq.q8')}</Text>
                    <Text style={{color:textColor(globalContext.state.env.darkmode!),fontSize:15,fontWeight:"500",marginLeft:10}}>- {I18n.t('p_faq.a8_1')}</Text>
                    <Text style={{color:textColor(globalContext.state.env.darkmode!),fontSize:15,fontWeight:"500",marginLeft:10}}>- {I18n.t('p_faq.a8_2')}</Text>
                    <Text style={{color:textColor(globalContext.state.env.darkmode!),fontSize:15,fontWeight:"500",marginLeft:10}}>- {I18n.t('p_faq.a8_3')}</Text>
                    <Text style={{color:textColor(globalContext.state.env.darkmode!),fontSize:20,fontWeight:"700",marginTop:5,marginBottom:5}}>{I18n.t('p_faq.q9')}</Text>
                    <Text style={{color:textColor(globalContext.state.env.darkmode!),fontSize:15,fontWeight:"500",marginLeft:10}}>- {I18n.t('p_faq.a9_1')}</Text>
                    <Text style={{color:textColor(globalContext.state.env.darkmode!),fontSize:15,fontWeight:"500",marginLeft:10}}>- {I18n.t('p_faq.a9_2')}</Text>
                    <Text style={{color:textColor(globalContext.state.env.darkmode!),fontSize:15,fontWeight:"500",marginLeft:10}}>- {I18n.t('p_faq.a9_3')}</Text>
                    <Text style={{color:textColor(globalContext.state.env.darkmode!),fontSize:15,fontWeight:"500",marginLeft:10}}>- {I18n.t('p_faq.a9_4')} : {defaultCommission}%</Text>
                    <Text style={{color:textColor(globalContext.state.env.darkmode!),fontSize:15,fontWeight:"500",marginLeft:10}}>- {I18n.t('p_faq.a9_5')} : {proCommission}%</Text>
                    <Text style={{color:textColor(globalContext.state.env.darkmode!),fontSize:20,fontWeight:"700",marginTop:5,marginBottom:5}}>{I18n.t('p_faq.q10')}</Text>
                    <Text style={{color:textColor(globalContext.state.env.darkmode!),fontSize:15,fontWeight:"500",marginLeft:10}}>- {I18n.t('p_faq.a10_1_pre')} {supported_cryptos} {I18n.t('p_faq.a10_1_mid')} {supported_cryptos}. {I18n.t('p_faq.a10_1_suf')}</Text>
                    <Text style={{color:textColor(globalContext.state.env.darkmode!),fontSize:15,fontWeight:"500",marginLeft:10}}>- {I18n.t('p_faq.a10_2')}</Text>
                    <Text style={{color:textColor(globalContext.state.env.darkmode!),fontSize:15,fontWeight:"500",marginLeft:10}}>- {I18n.t('p_faq.a10_3_pre')} {supported_cryptos} {I18n.t('p_faq.a10_3_suf')}</Text>
                    <Text style={{color:textColor(globalContext.state.env.darkmode!),fontSize:20,fontWeight:"700",marginTop:5,marginBottom:5}}>{I18n.t('p_faq.q11')}</Text>
                    <Text style={{color:textColor(globalContext.state.env.darkmode!),fontSize:15,fontWeight:"500",marginLeft:10}}>- {I18n.t('p_faq.a11')}</Text>
                    <View style={{height:15}}/>
                </ScrollView>
            </View>
        </View>
    )
}

export default FAQ
