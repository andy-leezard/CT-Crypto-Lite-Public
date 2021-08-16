import React, { useState, useEffect, useLayoutEffect } from 'react'
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { LineChart } from "react-native-chart-kit";
import { useColorScheme } from "react-native-appearance";
import { AdMobBanner} from 'expo-ads-admob';
import { db } from '../../../../firebase';
import _ from 'lodash';
import Trader from '../../../components/Trader';
import { KeyboardAvoidingView } from 'react-native';
import Env from '../../../env.json';

const trading_dataIntervalListTab = [
    {interval: "6H",/*1h = hour*/},{interval: "1D",/*1h = hour*/},{interval: "7D",/*24h = hours*/}
];

const screenWidth = Dimensions.get("window").width;
const width = screenWidth-20;
const screenHeight = Dimensions.get("window").height;

const TradingScreen_NormalView = ({route,navigation}) => {
    const { email, imgurl, sparkline, tradingCoin, coinprice, coinsymbol, upgraded, bannerID, ispro, rank } = route.params;
    const [tradingdatainterval, settradingdatainterval] = useState("1D");
    const scheme = useColorScheme();
    const [fav,setFav] = useState([]);

    useEffect(() => {
        db.collection('users').doc(route.params.email).get().then((doc)=>{
            setFav(doc.data().favorites);
        });
    }, [])

    useLayoutEffect(() => {
        navigation.setOptions({
            title: ``,
            headerStyle:{backgroundColor:bgColor()},
            headerLeft: () => (
                <View style={{flexDirection:"row",alignItems:"center",alignSelf:"flex-start",width:screenWidth,justifyContent:"space-between"}}>
                    <TouchableOpacity onPress={()=>navigation.goBack()} style={{flexDirection:"row",alignItems:"center",marginLeft:10}} >
                        <Image source={require("../../../assets/icons/1x/arrow_darkmode_flipped.png")} style={[{width:20,height:20},(!bool_isDarkMode())&&{tintColor:"#000000"}]}/>
                        <View style={{position:"absolute",width:24,height:24,borderRadius:6,backgroundColor:"white",marginLeft:20}} />
                        <Image source={{uri:imgurl}} style={{width:18,height:18,marginLeft:3}}/>
                        <Text style={{fontSize:20,fontWeight:"bold",color:textColor(),marginLeft:5}}>{tradingCoin}</Text>
                        <Text style={{fontSize:14,fontWeight:"bold",color:subTextColor(),marginLeft:3,alignSelf:"flex-start",paddingTop:2}}>Rank #{rank}</Text>
                    </TouchableOpacity>
                </View>
            ),
            headerRight: () => (
                <TouchableOpacity 
                    onPress={()=>toggleRegisterFavorite(tradingCoin)}
                    style={[{width:30,height:30,borderRadius:5,borderWidth:2,justifyContent:"center",alignItems:"center",marginRight:10},isInFavorite(tradingCoin)?{borderColor:"#BCAB34"}:{borderColor:"#519ABA"}]}>
                {isInFavorite(tradingCoin) ? (
                <Image
                    source={require("../../../assets/icons/1x/star2.png")}
                    style={{width:20,height:20,tintColor:"#BCAB34"}}
                />) : (
                <Image
                    source={require("../../../assets/icons/1x/star.png")}
                    style={{width:20,height:20,tintColor:"#519ABA"}}
                />)}
                </TouchableOpacity>
            )
        });
    }, [fav.length])
    
    const bool_isDarkMode = () => {
        return scheme === "dark";
    }
    const bgColor = () => {
        return bool_isDarkMode() ? "#000000":"#FFFFFF";
    }
    const containerColor = () => {
        return bool_isDarkMode() ? "#1c1c1c":"#e8e8e8";
    }
    const borderColor = () => {
        return bool_isDarkMode() ? "#CCCCCC":"#4a4a4a";
    }
    const containerRadiusColor = () => {
        return bool_isDarkMode() ? "#a196b5":"#8c829e";
    }
    const textColor = () => {
        return bool_isDarkMode() ? "#FFFFFF":"#000000";
    }
    const subTextColor = () => {
        return bool_isDarkMode() ? "#CCCCCC":"#8F8F8F";
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
    const dynamicMargin = () => {
        if(ispro){
            return (Platform.OS === 'ios') ? 203:156;
        }else{
            return (Platform.OS === 'ios') ? 263:216;
        }
    }
    function removeItemFromArray(arr, value) {
        let index = arr.indexOf(value);
        if (index > -1) {arr.splice(index, 1);}
        return arr;
    }
    const isInFavorite = (name) => {
        return fav.some(item => item === name);
    }
    const toggleRegisterFavorite = (name) => {
        let tempo = [...fav];
        (isInFavorite(name)) ? tempo = removeItemFromArray(tempo,name) : tempo.push(name);
        db.collection('users').doc(email).update({favorites: tempo,});
        setFav(tempo);
    }
    const adError = (e) => {
        console.log("Error showing banner ad ! : ",e);
    }

    const RenderScreen = () => {
        let arr = Array();
        arr = sparkline;
        let sparklineDataArray = arr;
        let str_legend = tradingCoin+" in the past week";
        if(tradingdatainterval==="6H"){
            sparklineDataArray = sparklineDataArray.slice(sparklineDataArray.length-9,sparklineDataArray.length);
            str_legend = tradingCoin+" in the past 6 hours";
        }else if(tradingdatainterval==="1D"){
            sparklineDataArray = sparklineDataArray.slice(sparklineDataArray.length-24,sparklineDataArray.length);
            str_legend = tradingCoin+" since yesterday";
        }
        sparklineDataArray.push(coinprice);
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
                        style={{marginTop: 8,borderRadius: 10,borderWidth:2,borderColor:containerRadiusColor(),backgroundColor:containerColor()}}
                    />
                </View>
            </View>
        )
    }

    return (
        <View style={{flex:1,paddingTop:10,backgroundColor:bgColor()}}>
            <View style={{alignItems: 'center',justifyContent: "flex-start",}}>
                <View style={{height:screenHeight-dynamicMargin(),marginBottom:1}}>
                    <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === "ios" ? 85:95}>
                        <ScrollView>
                            <View>
                                <View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center"}}>
                                    <Text style={{fontSize:20,fontWeight:"bold",color:textColor(),marginLeft:5}}>${coinprice}</Text>
                                    <Text style={{fontSize:14,fontWeight:"bold",color:borderColor(),marginRight:5}}>current average market price </Text>
                                </View>
                                <RenderScreen/>
                                <Trader coinname={tradingCoin} user={email} coinprice={coinprice} coinsymbol={coinsymbol} coinIcon={imgurl} upgraded={upgraded}/>
                                <View style={{height:30}}/>
                            </View>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </View>
                <View style={{alignSelf:"center"}}>
                    {!ispro && 
                        <AdMobBanner
                        bannerSize="fullBanner"
                        adUnitID={bannerID} // Test ID, Replace with your-admob-unit-id
                        servePersonalizedAds // true or false
                        onDidFailToReceiveAdWithError={adError}
                        />
                    }
                </View>
                {/*<View style={{width:screenWidth,height:100,backgroundColor:"red"}}/>*/}
            </View>
        </View>
    )
}

export default TradingScreen_NormalView

const styles = StyleSheet.create({
    interval_btnTab:{
        borderRadius:5,paddingHorizontal:8,width:70,height:25,justifyContent:"center"
    },
    interval_text:{
        color:"white",fontWeight:"bold",fontSize:15,textAlign:"center"
    }
})
