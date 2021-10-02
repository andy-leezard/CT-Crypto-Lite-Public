import React, { useState, useEffect, useContext } from 'react'
import { StyleSheet, Text, View, Image, TouchableOpacity, Dimensions, Platform, ScrollView } from 'react-native';
import { LineChart } from "react-native-chart-kit";
import { db } from '../../firebase';
import Trader from './Trader';
import { KeyboardAvoidingView } from 'react-native';
import * as Linking from 'expo-linking';
import Env from '../env.json';
import i18n from 'i18n-js';
import axios from 'axios';
import Loading from './Loading';
import { GlobalContext, MainContext, TradingContext } from '../StateManager';
import * as StyleLib from '../lib/StyleLib';
import { GlobalContextInterfaceAsReducer, MainContextInterface, TradingContextInterfaceAsReducer } from '../lib/Types';
import { avoidScientificNotation, isInList } from '../lib/FuncLib';
import { removeFromArray } from '../lib/JSFuncLib';

enum Intervals {
    SIX_HOURS="6H",
    DAY="1D",
    WEEK="7D",
    MONTH="30D",
    TRIMESTER="90D"
}

const trading_dataIntervalListTab = [
    Intervals.SIX_HOURS,
    Intervals.DAY,
    Intervals.WEEK,
    Intervals.MONTH,
    Intervals.TRIMESTER
];

const screenWidth = Platform.OS ==='android' ? Dimensions.get("window").width*0.95:Dimensions.get("window").width;
const width = screenWidth-20;
const screenHeight = Dimensions.get("window").height;

const Trading:React.FC = () => {
    const globalContext = useContext<GlobalContextInterfaceAsReducer>(GlobalContext);
    const mainContext = useContext<MainContextInterface>(MainContext);
    const tradingContext = useContext<TradingContextInterfaceAsReducer>(TradingContext);
    const [tradingdatainterval, settradingdatainterval] = useState<any>("1D");//linechart
    const [sparkline, setSparkline] = useState<any>(null);
    const [scope, setScope] = useState<number>(1);
    const [processing, setProcessing] = useState<boolean>(false);
    /*
        for when candlesticks are available.
        const [candles, setCandles] = useState();
        const timeframes = [{val:"1"},{val:"7"},{val:"14"},{val:"30"},{val:"90"},{val:"180"},{val:"365"},{val:"max"}];
        const getCandles = () => {
            const _scope = scope;
            const id = (url !== 'feel') ? url:'celo';
            if(!_scope){_scope = 1;}
            axios.get(`https://api.coingecko.com/api/v3/coins/${id}/ohlc?vs_currency=usd&days=${scope}`)
            .then((result)=>{
                setCandles(result);
                console.log("Candle data : ", result);
            })
            .catch(console.log);
        }
        useEffect(() => {
            //getCandles();
        }, [scope])
    */

    useEffect(() => {
        getSparkline(scope);
    }, [scope])

    const getSparkline = (param:number) => {
        if(processing){
            return;
        }else{
            setProcessing(true);
        }
        const rightnow = Math.round(new Date().getTime()/1000);
        let interval = param;
        if(interval<1){
            interval = 0.5;
        }
        interval *= 86400;
        const ago = Math.round(new Date((rightnow-interval)*1000).getTime()/1000);
        const currency = 'usd';
        const id = (tradingContext.state?.id === 'feel') ? 'celo':tradingContext.state?.id;
        axios.get(`https://redacted/api/v3/coins/${id}/market_chart/range?vs_currency=${currency}&from=${ago}&to=${rightnow}`)
        .then((result)=>{
            let res = result.data.prices;
            let only_prices = [];
            for (let i = 0; i < res.length; i++) {
                only_prices.push(res[i][1])
            }
            while(only_prices.length>48){
                if(only_prices.length>128){
                    for(let i = 0; i < only_prices.length-6; i++) {
                        only_prices.splice(i + 1, 3);
                    }
                }else{
                    for(let i = 0; i < only_prices.length-4; i++) {
                        only_prices.splice(i + 1, 1);
                    }
                }
            }
            only_prices.push(tradingContext.state!.current_price);
            setSparkline(only_prices);
            setProcessing(false);
        })
        .catch((e)=>{
            console.log(e);
            setProcessing(false);
        })
    }

    const _openURL = () => {
        (tradingContext.state?.id==="feel") ? Linking.openURL(Env.feelcoinUrl):Linking.openURL(`https://coinmarketcap.com/currencies/${tradingContext.state?.id}`);
    }

    const setTradingIntervalFilter = (i:string) => {
        if(processing){return;}
        switch(i){
            case(Intervals.SIX_HOURS):
                setScope(0.25); break;
            case(Intervals.DAY):
                setScope(1); break;
            case(Intervals.WEEK):
                setScope(7); break;
            case(Intervals.MONTH):
                setScope(30); break;
            case(Intervals.TRIMESTER):
                setScope(90); break;
        }
        settradingdatainterval(i);console.log("trading interval set to :",i);
    }

    const toggleRegisterFavorite = async(name:string) => {
        let tempo = [...mainContext.user.fav];
        (isInList(tempo,name)) ? tempo = removeFromArray(tempo,name) : tempo.push(name);
        await db.collection('users').doc(globalContext.state.auth.userEmail!).update({favorites: tempo,});
    }
    
    //differs from the library
    const determineDecimals = (i:number) =>{
        if(i<=10){
            if(i<=0.000001){return 11;}
            else if(i<=0.00001){return 9;}
            else if(i<=0.001){return 8;}
            else if(i<=0.01){return 7;}
            else if(i<=0.1){return 6;}
            else if(i<=1){return 5;}
            else{return 4;}
        }else if(i>=1000){return 0;}
        else{
            return 2;
        }
    }

    const parseLegend = ():string => {
        switch(tradingdatainterval){
            case(Intervals.SIX_HOURS):
                return tradingContext.state?.name+" "+i18n.t('since_6h');
            case(Intervals.DAY):
                return tradingContext.state?.name+" "+i18n.t('since_d');
            case(Intervals.WEEK):
                return tradingContext.state?.name+" "+i18n.t('since_w');
            case(Intervals.MONTH):
                return tradingContext.state?.name+" "+i18n.t('since_m');
            case(Intervals.TRIMESTER):
                return tradingContext.state?.name+" "+i18n.t('since_3m');
            default:
                return tradingContext.state?.name+" since "+tradingdatainterval;
        }
    }

    const RenderLineChart = () => {
        let str_legend = parseLegend();

        let sparklineDataArray = (sparkline) ? [...sparkline] : [1,1];
        let dynamicChange = ((sparklineDataArray[sparklineDataArray.length-1]/sparklineDataArray[0])-1);

        let nb_decimal = determineDecimals(tradingContext.state!.current_price);
        let rgbColor = StyleLib.buyColor_rgb(globalContext.state.env.darkmode!);
        let hexColor = StyleLib.buyColor(globalContext.state.env.darkmode!);
        let _percentage = (Math.round(dynamicChange * 10000) / 100).toString();
        if(dynamicChange <0){
            rgbColor = StyleLib.sellColor_rgb(globalContext.state.env.darkmode!);
            hexColor = StyleLib.sellColor(globalContext.state.env.darkmode!);
            _percentage = _percentage+"%";
        }else{
            _percentage = "+"+_percentage+"%";
        }

        return(
            <View>
                <Text style={{fontSize:15,fontWeight:"bold",color:hexColor,marginLeft:Platform.OS==='android' ? 5:10,marginBottom:3}}>{(typeof sparkline !== 'undefined') && _percentage}</Text>
                <View style={{alignItems:"center", minHeight:200}}>
                    <View  style={{flexDirection:"row",justifyContent:"space-between",backgroundColor:StyleLib.containerColor_ter(globalContext.state.env.darkmode!),borderRadius:5,width:70*trading_dataIntervalListTab.length,height:25}}>
                        {trading_dataIntervalListTab.map((e,index) => (
                            <TouchableOpacity key={index} style={[styles.interval_btnTab, tradingdatainterval===e&&{backgroundColor:StyleLib.unitContainerColor(globalContext.state.env.darkmode!)}]} onPress={()=>setTradingIntervalFilter(e)}>
                                <Text style={[styles.interval_text, tradingdatainterval===e&&{color:StyleLib.unitTextColor(globalContext.state.env.darkmode!)}]}>{e}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <View style={{marginTop: 6,borderRadius: 10,borderWidth:2,borderColor:StyleLib.containerRadiusColor_bis(globalContext.state.env.darkmode!),width:width,minHeight:175,justifyContent:"center",alignItems:"center"}}>
                    {(!processing&&sparkline) && <LineChart
                        data={{
                        //labels: ["January", "February", "March", "April", "May", "June", "June", "June", "June", "June"],
                        datasets: [{data: sparklineDataArray}],
                        legend: [str_legend]
                        }}
                        chartConfig={{
                            backgroundColor: "white",
                            backgroundGradientFromOpacity: globalContext.state.env.darkmode! ? 0.5 : 0,
                            backgroundGradientTo: "white",
                            backgroundGradientToOpacity: 0,
                            decimalPlaces: nb_decimal, // optional, defaults to 2dp
                            color: () => rgbColor,//${opacity}
                            labelColor: () => rgbColor,//${opacity}
                            style: {paddingTop: 10}
                        }}
                        width={width-20} height={150}
                        yAxisLabel="$"//yAxisSuffix=""//yAxisInterval={1} // optional, defaults to 1
                        withShadow={true}withVerticalLabels={false}withDots={sparklineDataArray.length<=26}
                        withHorizontalLines={true}//horizontalLabelRotation={-5}
                        withVerticalLines={false}yLabelsOffset={5}
                        bezier
                        style={{borderRadius: 10}}
                    />}
                    {(processing||!sparkline) && (
                        <Loading width={40} height={40}/>
                    )}
                    </View>
                </View>
            </View>
        )
    }

    const wrappedItem = (
        <View style={Platform.OS === 'android' && {paddingBottom:125}}>
            <View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center"}}>
                <Text style={{fontSize:20,fontWeight:"bold",color:StyleLib.textColor(globalContext.state.env.darkmode!),marginLeft:5}}>${avoidScientificNotation(tradingContext.state!.current_price)}</Text>
                <Text style={{fontSize:14,fontWeight:"bold",color:StyleLib.containerRadiusColor(globalContext.state.env.darkmode!),marginRight:5}}>{i18n.t('crnt_avg_m_price')} </Text>
            </View>
            {<RenderLineChart/>}
            {/*(typeof sparkline !=='undefined') && <RenderLineChart/>*/}
            <Trader coinname={tradingContext.state!.name} coinprice={tradingContext.state!.current_price} coinsymbol={tradingContext.state!.symbol.toUpperCase()} coinIcon={tradingContext.state!.image} />
            <TouchableOpacity style={{width:screenWidth-20, backgroundColor:"#E2E6E8",height:50,borderRadius:5,alignItems:"center",flexDirection:"row",paddingHorizontal:10,justifyContent:"center", marginTop:5,alignSelf:"center"}} onPress={()=>_openURL()}>
                <Text style={{color:"#289c48",fontSize:18,fontWeight:"bold"}}>{i18n.t('more_about_pre')} {tradingContext.state!.name} {i18n.t('more_about_suf')}</Text>
            </TouchableOpacity>
        </View>
    )

    if(!tradingContext.state){
        return(
            <>
            </>
        )
    }

    return (
        <View style={{flex:1,paddingTop:10,backgroundColor:StyleLib.bgColor(globalContext.state.env.darkmode!)}}>
            <View style={{flexDirection:"row",alignItems:"center",alignSelf:"flex-start",width:screenWidth,justifyContent:"space-between",marginBottom:5}}>
                <View style={{flexDirection:"row",alignItems:"center",marginLeft:Platform.OS==='android' ? 5:10}} >
                    <View style={{width:24,height:24,borderRadius:6,backgroundColor:"white",marginLeft:5,justifyContent:"center",alignItems:"center"}}>
                    <Image source={{uri:tradingContext.state!.image}} style={{width:18,height:18}}/>
                    </View>
                    <Text style={{fontSize:20,fontWeight:"bold",color:StyleLib.textColor(globalContext.state.env.darkmode!),marginLeft:5}}>{tradingContext.state?.name}</Text>
                    <Text style={{fontSize:14,fontWeight:"bold",color:StyleLib.subTextColor_bis(globalContext.state.env.darkmode!),marginLeft:3,alignSelf:"flex-start",paddingTop:2}}>{i18n.t('rank')} #{tradingContext.state?.market_cap_rank}</Text>
                </View>
                <View>
                <TouchableOpacity 
                    onPress={()=>toggleRegisterFavorite(tradingContext.state!.name)}
                    style={[{width:24,height:24,borderRadius:5,borderWidth:2,justifyContent:"center",alignItems:"center",marginRight:10},isInList(mainContext.user.fav,tradingContext.state!.name)?{borderColor:"#BCAB34"}:{borderColor:"#519ABA"}]}>
                {isInList(mainContext.user.fav,tradingContext.state!.name) ? (
                <Image
                    source={require("../assets/icons/1x/star2.png")}
                    style={{width:18,height:18,tintColor:"#BCAB34"}}
                />) : (
                <Image
                    source={require("../assets/icons/1x/star.png")}
                    style={{width:18,height:18,tintColor:"#519ABA"}}
                />)}
                </TouchableOpacity>
                </View>
            </View>
            <View style={{alignItems: 'center',justifyContent: "flex-start",}}>
                <View style={{height:screenHeight-StyleLib.bottom_tab_nav_Height()}}>
                    <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS === "ios" ? "padding" : "height"} /** keyboardVerticalOffset={Platform.OS === "ios" ? 155:165} */>
                        {Platform.OS === 'android' &&
                            <ScrollView>
                                {wrappedItem}
                            </ScrollView>
                        }
                        {Platform.OS === 'ios' && wrappedItem}
                    </KeyboardAvoidingView>
                </View>
            </View>
        </View>
    )
}

export default Trading

const styles = StyleSheet.create({
    interval_btnTab:{
        borderRadius:5,paddingHorizontal:8,width:70,height:25,justifyContent:"center"
    },
    interval_text:{
        color:"white",fontWeight:"bold",fontSize:15,textAlign:"center"
    }
})