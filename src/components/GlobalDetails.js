import React, { useEffect, useState } from 'react'
import { Text, View, Image, ScrollView, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AdMobBanner} from 'expo-ads-admob';
import { PieChart } from "react-native-chart-kit";
import _ from 'lodash';
import { useColorScheme } from "react-native-appearance";
import Env from '../env.json'
import Loading from './Loading';

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const sliceColor = ['#303f9f','#1976d2','#0288d1', '#0097a7', '#009688', '#4caf50', '#8bc34a', '#aed581', '#009688', '#4caf50'];

const chartConfig = {
    backgroundGradientFrom: '#000000',
    backgroundGradientTo: '#000000',
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`
}

const GlobalDetails = ({route,navigation}) => {
    const { changeData, coinData, ispro, bannerID, userEmail, upgraded } = route.params;
    const scheme = useColorScheme();
    const [pieData, setPiedata] = useState([]);
    const [allData, setAlldata] = useState([]);

    useEffect(() => {
        let bigcaps = changeData.data.market_cap_percentage;
        let _coinData = Array();
        let _allData = Array();
        let symbols = Object.keys(bigcaps);
        let percentage = 100;
        let loop = symbols.length-3; // 10 - 3
        for(let i = 0; i < symbols.length; i++){
            let symb = symbols[i];
            console.log("symbols[",i,"] : ",symb);
            let coin = coinData.find(i => i.symbol.toLowerCase() === symb.toLowerCase());
            console.log("current coin : ", coin.name, 'dominance : ', round_it(bigcaps[symb]));
            percentage -= bigcaps[symb];
            if(i<loop){
                _coinData.push({name:coin.symbol.toUpperCase(),dominance:round_it(bigcaps[symb]),color: sliceColor[i], legendFontColor:textColor(), legendFontSize: 15});
            }else if(i===loop){
                _coinData.push({name:"Other",dominance:percentage, color: '#d9e3f0', legendFontColor: textColor(), legendFontSize: 15});
            }
            _allData.push({image:coin.image,name:coin.name,symbol:coin.symbol.toUpperCase(),cap:coin.market_cap,change:coin.market_cap_change_percentage_24h,sparkline:coin.sparkline_in_7d.price,price:coin.current_price})
        }
        setAlldata(_allData);
        setPiedata(_coinData);
    }, [route,changeData,coinData])

    const round_it = (i) => {return Math.round(i * 100) / 100;}
    const bool_isDarkMode = () => {
        return scheme === "dark";
    }
    const bgColor = () => {
        return bool_isDarkMode() ? "#000000":"#FFFFFF";
    }
    const containerColor = () => {
        return bool_isDarkMode() ? "#1c1c1c":"#e8e8e8";
    }
    const containerRadiusColor = () => {
        return bool_isDarkMode() ? "#a196b5":"#8c829e";
    }
    const textColor = () => {
        return bool_isDarkMode() ? "#FFFFFF":"#000000";
    }
    const buyColor = () => {
        return bool_isDarkMode() ? Env.buyColor_dark:Env.buyColor_light;
    }
    const sellColor = () => {
        return bool_isDarkMode() ? Env.sellColor_dark:Env.sellColor_light;
    }
    const dynamicColor = (i) => {
        return (i>=0) ? buyColor() : sellColor();
    }
    const subTextColor = () => {
        return bool_isDarkMode() ? "#CCCCCC":"#8F8F8F";
    }
    const dynamicMargin = () => {
        if(ispro){
            return (Platform.OS === 'ios') ? 449:395;
        }else{
            return (Platform.OS === 'ios') ? 509:455;
        }
    }
    const displayPercentage = (i) => {
        let asString = i.toString();
        return (i>=0) ? "+"+asString+"%" : asString+"%"
    }
    const displayVolume = (vol) => {
        if(vol < 1000000000){//less than a billion
            let inmillion = vol / 1000000; // divide by a million
            inmillion = Math.round(inmillion * 100) / 100 ; // round to 2 decimals
            return "$"+inmillion.toString()+"M";
        }else if(vol < 1000000000000){//less than a trillion
            let inbillion = vol / 1000000000; // divide by a billion
            inbillion = Math.round(inbillion * 100) / 100 ; // round to 2 decimals
            return "$"+inbillion.toString()+"B";
        }else{
            let intrillion = vol / 1000000000000; // divide by a billion
            intrillion = Math.round(intrillion * 100) / 100 ; // round to 2 decimals
            return "$"+intrillion.toString()+"T";
        }
    }

    return (
        <SafeAreaView style={{flex:1, backgroundColor:bgColor()}}>
            <TouchableOpacity onPress={()=>navigation.goBack()} style={{flexDirection:"row",alignItems:"center",alignSelf:"flex-start",marginLeft:10,marginVertical:5}}>
                    <Image source={require("../assets/icons/1x/arrow_darkmode_flipped.png")} style={[{width:20,height:20},(!bool_isDarkMode())&&{tintColor:"#000000"}]}/>
                    <Image source={require("../assets/icons/1x/prices.png")} style={{width:20,height:20}}/>
                    <Text style={{fontSize:20,fontWeight:"bold",color:textColor(),marginLeft:5}}>Prices</Text>
            </TouchableOpacity>
            <View style={{width:screenWidth-20, borderRadius:10, borderWidth:3, borderColor:containerRadiusColor(), backgroundColor:containerColor(), padding:10,marginBottom:10,alignSelf:"center"}}>
                <View style={{alignSelf:"center"}}>
                    <Text style={{color:textColor(),fontSize:16,fontWeight:"600",marginBottom:10,fontWeight:"bold",marginLeft:10}}>Market cap by percentage</Text>
                    {(pieData.length > 0) ? (<PieChart
                        width={screenWidth-20}
                        height={200}
                        data={pieData}
                        accessor="dominance"
                        backgroundColor="transparent"
                        paddingLeft="15"
                        chartConfig={chartConfig}
                    />):(
                        <Loading width={60} height={60}/>
                    )}
                </View>
            </View>
            <View style={{height:screenHeight-dynamicMargin(),width:screenWidth-20,marginTop:1,marginBottom:1,alignSelf:"center",backgroundColor:containerColor(),borderRadius:10}}>
                <ScrollView
                    /*scrollEventThrottle={2000}
                    onScroll={({nativeEvent})=>{
                        if(isCloseToBottom(nativeEvent)){
                            handleBottomClose();
                    }}}*/
                >
                    <View style={{alignItems:"center"}}>
                        {(allData.length > 0) ? allData.map((i, index)=>{
                            return(
                                <TouchableOpacity key={index} onPress={()=>navigation.navigate('Stack_Prices_Trading',{email:userEmail,imgurl:i.image,sparkline:i.sparkline,tradingCoin:i.name,coinprice:i.price,coinsymbol:i.symbol.toUpperCase(),upgraded:upgraded,bannerID:bannerID,ispro:ispro})}>
                                    <View style={{flexDirection:"row",alignItems:"center",justifyContent:"space-between",borderWidth:2,borderRadius:10,borderColor:containerRadiusColor(),backgroundColor:containerColor(), width:screenWidth-40, height:50,padding:5,marginTop:10}}>
                                        <View style={{flexDirection:"row", width:((screenWidth/2)-15), alignItems:"center"}}>
                                            <View style={{position:"absolute",width:38,height:38,borderRadius:8,backgroundColor:"white"}} />
                                            <Image source={{uri:i.image}} style={{width:32,height:32,marginLeft:3}}/>
                                            <View style={{justifyContent:"space-between"}}>
                                                <Text style={{fontSize:16,fontWeight:"bold",color:textColor(),marginLeft:9}}>{i.name}</Text>
                                                <Text style={{fontSize:13,fontWeight:"bold",color:subTextColor(),marginLeft:9}}>{i.symbol}</Text>
                                            </View>
                                        </View>
                                        <View style={{justifyContent:"center",alignItems:"center"}}>
                                            <Text style={{color:dynamicColor(i.change),fontWeight:"bold",fontSize:20}}>{displayVolume(i.cap)}</Text>
                                        </View>
                                        <View style={{backgroundColor:dynamicColor(i.change),borderRadius:10,width:65,height:35,justifyContent:"center",alignItems:"center"}}>
                                            <Text style={{color:"white",fontWeight:"bold",fontSize:14}}>{displayPercentage(round_it(i.change))}</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            )
                        }):(
                            <Loading width={60} height={60}/>
                        )}
                        <View style={{height:10}}/>
                    </View>
                </ScrollView>
            </View>
            <View style={{alignSelf:"center"}}>
                {!ispro && 
                    <AdMobBanner
                    bannerSize="fullBanner"
                    adUnitID={bannerID} // Test ID, Replace with your-admob-unit-id
                    servePersonalizedAds // true or false
                    //onDidFailToReceiveAdWithError={this.bannerError}
                    />
                }
            </View>
        </SafeAreaView>
    )
}

export default GlobalDetails
