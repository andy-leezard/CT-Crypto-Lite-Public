import React from 'react'
import { Text, View } from 'react-native'
import AutoScrolling from 'react-native-auto-scrolling';
import i18n from 'i18n-js';
import { textColor, effectColor } from '../lib/StyleLib';

// JS-only component : props need to be passed to a child component of the AutoScrolling module.
const Trace_RenderGlobalChange = ({propdata,darkmode}) => {
    return (
        <AutoScrolling style={{width:"100%"}}>
            <View isVertical={false} delay={0} duration={2000} endPaddingWidth={0} style={{flexDirection:"row"}}>
                <Text style={{color:textColor(darkmode), paddingTop:5,fontSize:15,fontWeight:"600",alignSelf:"center"}}>{i18n.t("market_today")} : </Text>
                <Text style={{color:propdata.color, paddingTop:5,fontSize:20,fontWeight:"bold"}}>{propdata.market}</Text>
                <Text style={{color:textColor(darkmode), paddingTop:5,fontSize:15,fontWeight:"600",alignSelf:"center",marginLeft:10}}>{Object.keys(propdata._no1)} {i18n.t('dominance')} : </Text>
                <Text style={{color:effectColor(darkmode), paddingTop:5,fontSize:20,fontWeight:"bold"}}>{Object.values(propdata._no1)}</Text>
                <Text style={{color:textColor(darkmode), paddingTop:5,fontSize:15,fontWeight:"600",alignSelf:"center",marginLeft:10}}>{i18n.t('stablecoins')} {i18n.t('dominance')} : </Text>
                <Text style={{color:effectColor(darkmode), paddingTop:5,fontSize:20,fontWeight:"bold"}}>{propdata.stabd}</Text>
                <Text style={{color:textColor(darkmode), paddingTop:5,fontSize:15,fontWeight:"600",alignSelf:"center",marginLeft:10}}>{Object.keys(propdata._no2)} {i18n.t('dominance')} : </Text>
                <Text style={{color:effectColor(darkmode), paddingTop:5,fontSize:20,fontWeight:"bold"}}>{Object.values(propdata._no2)}</Text>
                <Text style={{color:textColor(darkmode), paddingTop:5,fontSize:15,fontWeight:"600",alignSelf:"center",marginLeft:10}}>{Object.keys(propdata._no3)} {i18n.t('dominance')} : </Text>
                <Text style={{color:effectColor(darkmode), paddingTop:5,fontSize:20,fontWeight:"bold"}}>{Object.values(propdata._no3)}</Text>
            </View>
        </AutoScrolling>
    )
}

export default Trace_RenderGlobalChange