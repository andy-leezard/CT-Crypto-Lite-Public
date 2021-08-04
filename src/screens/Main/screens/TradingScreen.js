import React, { useState } from 'react'
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, Dimensions, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from "react-native-chart-kit";
import { useColorScheme } from "react-native-appearance";
import Loading from '../../../components/Loading';
import _ from 'lodash';
import Trader from '../../../components/Trader';
import { KeyboardAvoidingView } from 'react-native';
import Env from '../../../env.json';

const trading_dataIntervalListTab = [
    {interval: "6H",/*1h = hour*/},{interval: "1D",/*1h = hour*/},{interval: "7D",/*24h = hours*/}
];

const width = Dimensions.get("window").width-20;

const TradingScreen = ({route,navigation}) => {
    const { email, imgurl, sparkline, tradingCoin, coinprice, coinsymbol, upgraded } = route.params;
    const [tradingdatainterval, settradingdatainterval] = useState("1D");
    const scheme = useColorScheme();
    
    const bool_isDarkMode = () => {
        return scheme === "dark";
    }
    const containerColor = () => {
        return bool_isDarkMode() ? "#1c1c1c":"#e8e8e8";
    }
    const borderColor = () => {
        return bool_isDarkMode() ? "#CCCCCC":"#4a4a4a";
    }
    const textColor = () => {
        return bool_isDarkMode() ? "#FFFFFF":"#000000";
    }
    const unitContainerColor = () => {
        return bool_isDarkMode() ? "white":"#2294DB";
    }
    const unitTextColor = () => {
        return bool_isDarkMode() ? "#468559":"white";
    }
    const containerColor_secondary = () => {
        return bool_isDarkMode() ? "#333333":"#737373";
    }
    const buyColor_rgb = () => {
        return bool_isDarkMode() ? "rgba(66,185,93,1)":"rgba(26,138,53,1)";
    }
    const sellColor_rgb = () => {
        return bool_isDarkMode() ? "rgba(255,90,74,1)":"rgba(255,67,48,1)";
    }
    const buyColor_hex = () => {
        return bool_isDarkMode() ? Env.buyColor_dark:Env.buyColor_light;
    }
    const sellColor_hex = () => {
        return bool_isDarkMode() ? Env.sellColor_dark:Env.sellColor_light;
    }
    const setTradingIntervalFilter = (i) => {
        settradingdatainterval(i);console.log("trading interval set to :",i);
    }

    const RenderScreen = () => {
        let sparklineDataArray = sparkline;
        let str_legend = tradingCoin+" in the past week";
        if(tradingdatainterval==="6H"){
            sparklineDataArray = sparklineDataArray.slice(sparklineDataArray.length-6,sparklineDataArray.length);
            str_legend = tradingCoin+" in the past 6 hours";
        }else if(tradingdatainterval==="1D"){
            sparklineDataArray = sparklineDataArray.slice(sparklineDataArray.length-24,sparklineDataArray.length);
            str_legend = tradingCoin+" since yesterday";
        }else{
        }
        let dynamicChange = (sparklineDataArray[sparklineDataArray.length-1]/sparklineDataArray[0])-1;
        let nb_decimal = 2;
        let rgbColor = buyColor_rgb();
        let hexColor = buyColor_hex(); // green

        let _percentage = (Math.round(dynamicChange * 10000) / 100).toString();
        if(coinprice>=1000){
            nb_decimal = 0;
        }else if(coinprice<=1){
            if(coinprice<=0.001){
                nb_decimal = 7;
            }else{
                nb_decimal = 4;
            }
        }
        if(dynamicChange <0){
            rgbColor = sellColor_rgb();
            hexColor = sellColor_hex();
            _percentage = _percentage+"%";
        }else{
            _percentage = "+"+_percentage+"%";
        }

        return(
            <View>
                <Text style={{fontSize:15,fontWeight:"bold",color:hexColor,marginLeft:5}}>{_percentage}</Text>
                <View style={{alignItems:"center"}}>
                    <View  style={{flexDirection:"row",justifyContent:"space-between",backgroundColor:containerColor_secondary(),borderRadius:5,width:210,height:25}}>
                        {trading_dataIntervalListTab.map((e) => (
                            <TouchableOpacity key={e.interval} style={[styles.interval_btnTab, tradingdatainterval===e.interval&&{backgroundColor:unitContainerColor()}]} onPress={()=>setTradingIntervalFilter(e.interval)}>
                                <Text style={[styles.interval_text, tradingdatainterval===e.interval&&{color:unitTextColor()}]}>{e.interval}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <LineChart
                        data={{
                        //labels: ["January", "February", "March", "April", "May", "June"],
                        datasets: [{data: sparklineDataArray}],
                        legend: [str_legend]
                        }}
                        chartConfig={{
                            backgroundColor: "white",
                            backgroundGradientFromOpacity: 0,
                            backgroundGradientTo: "white",
                            backgroundGradientToOpacity: 0,
                            decimalPlaces: nb_decimal, // optional, defaults to 2dp
                            color: () => rgbColor,//${opacity}
                            labelColor: () => rgbColor,//${opacity}
                            style: {paddingTop: 10}
                        }}
                        width={width} height={150}
                        yAxisLabel="$"//yAxisSuffix=""//yAxisInterval={1} // optional, defaults to 1
                        withShadow={false}withVerticalLabels={false}withDots={false}
                        withHorizontalLines={false}//horizontalLabelRotation={-5}
                        withVerticalLines={false}yLabelsOffset={5}
                        bezier
                        style={{marginTop: 8,borderRadius: 10,borderWidth:2,borderColor:borderColor(),backgroundColor:containerColor()}}
                    />
                </View>
            </View>
        )
    }

    return (
        <SafeAreaView>
            <KeyboardAvoidingView style={{alignItems: 'center',justifyContent: "flex-start",}} behavior={Platform.OS === "ios" ? "padding" : "height"}>
                <TouchableOpacity onPress={()=>navigation.goBack()} style={{flexDirection:"row",alignItems:"center",alignSelf:"flex-start"}}>
                        <Image source={require("../../../assets/icons/1x/arrow_darkmode_flipped.png")} style={{width:20,height:20}}/>
                        <Image source={{uri:imgurl}} style={{width:20,height:20}}/>
                        <Text style={{fontSize:20,fontWeight:"bold",color:textColor(),marginLeft:5}}>{tradingCoin}</Text>
                </TouchableOpacity>
                <ScrollView>
                    <View>
                        <View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center"}}>
                            <Text style={{fontSize:20,fontWeight:"bold",color:textColor(),marginLeft:5}}>${coinprice}</Text>
                            <Text style={{fontSize:14,fontWeight:"bold",color:borderColor(),marginRight:5}}>current average market price </Text>
                        </View>
                        <RenderScreen/>
                        <Trader coinname={tradingCoin} user={email} coinprice={coinprice} coinsymbol={coinsymbol} coinIcon={imgurl} upgraded={upgraded}/>
                        <View style={{height:125}}/>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

export default TradingScreen

const styles = StyleSheet.create({
    interval_btnTab:{
        borderRadius:5,paddingHorizontal:8,width:70,height:25,justifyContent:"center"
    },
    interval_text:{
        color:"white",fontWeight:"bold",fontSize:15,textAlign:"center"
    }
})
