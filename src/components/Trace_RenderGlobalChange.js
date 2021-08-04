import React from 'react'
import { Text, View } from 'react-native'
import AutoScrolling from 'react-native-auto-scrolling';

const Trace_RenderGlobalChange = ({propdata,darkmode}) => {

    const textColor = () => {
        return darkmode ? "white":"#000000";
    }

    const effectColor = () => {
        return darkmode ? "#CCBB8B":"#947A2F";
    }

    return (
        <AutoScrolling style={{width:"100%"}} endPadding={0}>
            <View delay={0} duration={3000} style={{flexDirection:"row"}}>
                <Text style={{color:textColor(), paddingTop:5,fontSize:15,fontWeight:"600",alignSelf:"center"}}>Market Today : </Text>
                <Text style={{color:propdata.color, paddingTop:5,fontSize:20,fontWeight:"bold"}}>{propdata.market}</Text>
                <Text style={{color:textColor(), paddingTop:5,fontSize:15,fontWeight:"600",alignSelf:"center",marginLeft:10}}>BTC Dominance : </Text>
                <Text style={{color:effectColor(), paddingTop:5,fontSize:20,fontWeight:"bold"}}>{propdata.btcd}</Text>
                <Text style={{color:textColor(), paddingTop:5,fontSize:15,fontWeight:"600",alignSelf:"center",marginLeft:10}}>ETH Dominance : </Text>
                <Text style={{color:effectColor(), paddingTop:5,fontSize:20,fontWeight:"bold"}}>{propdata.ethd}</Text>
                <Text style={{color:textColor(), paddingTop:5,fontSize:15,fontWeight:"600",alignSelf:"center",marginLeft:10}}>Tether Dominance : </Text>
                <Text style={{color:effectColor(), paddingTop:5,fontSize:20,fontWeight:"bold"}}>{propdata.usdtd}</Text>
            </View>
        </AutoScrolling>
    )
}

export default Trace_RenderGlobalChange