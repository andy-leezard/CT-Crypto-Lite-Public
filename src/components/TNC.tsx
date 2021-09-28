import React from 'react'
import { View, Text } from 'react-native'
import I18n from 'i18n-js';

interface Props{
    textColor:string
}

const TNC:React.FC<Props> = ({textColor}) => {
    return (
    <View>
        <Text style={{fontSize: 20,fontWeight: "700",color:textColor,marginVertical:5}}>{I18n.t('p_tnc._1')}</Text>
        <Text style={{fontSize: 14,fontWeight: "500",color:textColor,marginLeft:10}}>{I18n.t('p_tnc._1_1')}</Text>
        <Text style={{fontSize: 14,fontWeight: "500",color:textColor,marginLeft:10}}>{I18n.t('p_tnc._1_2')}</Text>
        <Text style={{fontSize: 14,fontWeight: "500",color:textColor,marginLeft:10}}>{I18n.t('p_tnc._1_3')}</Text>
        <Text style={{fontSize: 14,fontWeight: "500",color:textColor,marginLeft:10}}>{I18n.t('p_tnc._1_4')}</Text>
        <Text style={{fontSize: 14,fontWeight: "500",color:textColor,marginLeft:10}}>{I18n.t('p_tnc._1_5')}</Text>
        <Text style={{fontSize: 20,fontWeight: "700",color:textColor,marginVertical:5}}>{I18n.t('p_tnc._2')}</Text>
        <Text style={{fontSize: 14,fontWeight: "500",color:textColor,marginLeft:10}}>{I18n.t('p_tnc._2_1')}</Text>
        <Text style={{fontSize: 14,fontWeight: "500",color:textColor,marginLeft:10}}>{I18n.t('p_tnc._2_2')}</Text>
        <Text style={{fontSize: 14,fontWeight: "500",color:textColor,marginLeft:10}}>{I18n.t('p_tnc._2_3')}</Text>
        <Text style={{fontSize: 20,fontWeight: "700",color:textColor,marginVertical:5}}>{I18n.t('p_tnc._3')}</Text>
        <Text style={{fontSize: 14,fontWeight: "500",color:textColor,marginLeft:10}}>{I18n.t('p_tnc._3_1')}</Text>
        <Text style={{fontSize: 14,fontWeight: "500",color:textColor,marginLeft:10}}>{I18n.t('p_tnc._3_2')}</Text>
        <Text style={{fontSize: 14,fontWeight: "500",color:textColor,marginLeft:10}}>{I18n.t('p_tnc._3_3')}</Text>
        <Text style={{fontSize: 14,fontWeight: "500",color:textColor,marginLeft:10}}>{I18n.t('p_tnc._3_4')}</Text>
        <Text style={{fontSize: 20,fontWeight: "700",color:textColor,marginVertical:5}}>{I18n.t('p_tnc._4')}</Text>
        <Text style={{fontSize: 14,fontWeight: "500",color:textColor,marginLeft:10}}>{I18n.t('p_tnc._4_1')}</Text>
        <Text style={{fontSize: 14,fontWeight: "500",color:textColor,marginLeft:10}}>{I18n.t('p_tnc._4_2')}</Text>
        <Text style={{fontSize: 14,fontWeight: "500",color:textColor,marginLeft:10}}>{I18n.t('p_tnc._4_3')}</Text>
        <Text style={{fontSize: 14,fontWeight: "500",color:textColor,marginLeft:10}}>{I18n.t('p_tnc._4_4')}</Text>
        <Text style={{fontSize: 20,fontWeight: "700",color:textColor,marginVertical:5}}>{I18n.t('p_tnc._5')}</Text>
        <Text style={{fontSize: 14,fontWeight: "500",color:textColor,marginLeft:10}}>{I18n.t('p_tnc._5_1')}</Text>
        <Text style={{fontSize: 14,fontWeight: "500",color:textColor,marginLeft:10}}>{I18n.t('p_tnc._5_2')}</Text>
        <Text style={{fontSize: 14,fontWeight: "500",color:textColor,marginLeft:10}}>{I18n.t('p_tnc._5_3')}</Text>
        <Text style={{fontSize: 14,fontWeight: "500",color:textColor,marginLeft:10}}>{I18n.t('p_tnc._5_4')}</Text>
        <Text style={{fontSize: 14,fontWeight: "500",color:textColor,marginLeft:15}}>- {I18n.t('p_tnc._5_5')}</Text>
        {/*<Text style={{fontSize: 14,fontWeight: "500",color:textColor,marginLeft:15}}>- {I18n.t('p_tnc._5_6')}</Text>*/}
        <Text style={{fontSize: 14,fontWeight: "500",color:textColor,marginLeft:15}}>- {I18n.t('p_tnc._5_7')}</Text>
        <Text style={{fontSize: 20,fontWeight: "700",color:textColor,marginVertical:5}}>{I18n.t('p_tnc._6')}</Text>
        <Text style={{fontSize: 14,fontWeight: "500",color:textColor,marginLeft:10}}>{I18n.t('p_tnc._6_1')}</Text>
        <Text style={{fontSize: 14,fontWeight: "500",color:textColor,marginLeft:10}}>{I18n.t('p_tnc._6_2')}</Text>
        <Text style={{fontSize: 14,fontWeight: "500",color:textColor,marginLeft:10}}>{I18n.t('p_tnc._6_3')}</Text>
        <Text style={{fontSize: 14,fontWeight: "500",color:textColor,marginLeft:10}}>{I18n.t('p_tnc._6_4')}</Text>
        <Text style={{fontSize: 20,fontWeight: "700",color:textColor,marginVertical:5}}>{I18n.t('p_tnc._7')}</Text>
        <Text style={{fontSize: 14,fontWeight: "500",color:textColor,marginLeft:10}}>{I18n.t('p_tnc._7_1')} {I18n.t('scphase._4_1')}</Text>
    </View>
    )
}

export default TNC