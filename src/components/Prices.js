import React, { useRef, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Dimensions, ScrollView, TextInput, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Favorite_icon from './Favorite_icon';
import Trace_RenderGlobalChange from './Trace_RenderGlobalChange';
import Env from '../env.json';
import { db } from '../../firebase';
import { useColorScheme } from "react-native-appearance";
import { useNavigation } from '@react-navigation/core';
import { AdMobBanner} from 'expo-ads-admob';

const initialLimit = 20;

const dataIntervalListTab = [
    {interval: "1h",/*1h = hour*/},{interval: "d",/*24h = hours*/},
    {interval: "w",/*7d = week*/},{interval: "2w",/*14d = couple of weeks*/},
    {interval: "m",/*30d = month*/},{interval: "200d",/*200d = 200 days*/},{interval: "y",/*1y = year*/}
];
const listTab = [
    {status: "Prices",},{status: "Market Cap",},{status: "24H",},
];

const Prices = ({userEmail,fav,coindata,changeData,ispro,bannerID,upgraded}) => {
    const navigation = useNavigation();
    const [status, setStatus] = useState("Prices"); //By default we want to show all status
    const [renderFavorites, setRenderFavorites] = useState(false);
    const [keyword, setkeyword] = useState('');
    const [datainterval, setdatainterval] = useState("d");
    const [heretoDatainterval, setRenderIntervalOptions] = useState(false);
    const [limit, setlimit] = useState(initialLimit);
    const scrollViewRef = useRef();

    const scheme = useColorScheme();
    const bool_isDarkMode = () => {
        return scheme === "dark";
    }
    const bgColor = () => {
        return bool_isDarkMode() ? "#000000":"#FFFFFF";
    }
    const containerColor = () => {
        return bool_isDarkMode() ? "#1A1A1A":"#E3E3E3";
    }
    const brandTextColor = () => {
        return bool_isDarkMode() ? Env.brandText_Dark:Env.brandText_Light;
    }
    const textColor = () => {
        return bool_isDarkMode() ? "#FFFFFF":"#000000";
    }
    const subTextColor = () => {
        return bool_isDarkMode() ? "#CCCCCC":"#8F8F8F";
    }
    const buyColor = () => {
        return bool_isDarkMode() ? Env.buyColor_dark:Env.buyColor_light;
    }
    const sellColor = () => {
        return bool_isDarkMode() ? Env.sellColor_dark:Env.sellColor_light;
    }
    const intervalContainerColor = () => {
        return bool_isDarkMode() ? "#333333":"#737373";
    }
    const handleKeyword = (input) => {
        setkeyword(input.trimStart());ScrollBackToTop();
    }

    const ScrollBackToTop = () => {
        scrollViewRef.current.scrollTo({
            y: 0,
            x: 0,
            animated: true,
        });
    }

    const ParseInterval = (i) => {
        if(i === "1h"){return "hour";}else if(i === "d"){return "24 hours";}
        else if(i === "w"){return "week";}else if(i === "2w"){return "couple of weeks";}
        else if(i === "m"){return "month";}else if(i === "200d"){return "200 days";}
        else if(i === "y"){return "year";}else{return "error : 404";}
    }

    const ParseIntervalForAPI = (i) => {
        if(i === "d"){return "24h";}else if(i === "w"){return "7d";}
        else if(i === "2w"){return "14d";}else if(i === "m"){return "30d";}
        else if(i === "200d"){return "200d";}else if(i === "y"){return "1y";}else{return i;}
    }

    const setStatusFilter = (status) => {
        ScrollBackToTop();
        setStatus(status);console.log("status set to :",status);
        setlimit(initialLimit);
    }

    const setIntervalFilter = (i) => {
        setdatainterval(i);console.log("interval set to :",i);
    }

    const toggleRenderDataInterval = () => {
        let state = heretoDatainterval;
        setRenderIntervalOptions(!state);
    }

    const toggleRenderFavorites = () => {
        console.log("renderFavorites was : ",renderFavorites);
        let state = renderFavorites;
        setRenderFavorites(!state);
        setlimit(initialLimit);
        ScrollBackToTop();
        console.log("renderFavorites is now : ",!state);
    }

    const isInFavorite = (name) => {
        return fav.some(item => item === name);
    }

    const dynamicMargin = () => {
        if(Platform.OS === "ios"){
            return (ispro) ? 241:403;
        }else{
            return (ispro) ? 290:348;
        }
    }

    function removeItemOnce(arr, value) {
        let index = arr.indexOf(value);
        if (index > -1) {arr.splice(index, 1);}
        return arr;
    }

    const toggleRegisterFavorite = (name) => {
        if(isInFavorite(name)){
            let tempo = [...fav];tempo = removeItemOnce(tempo,name);
            db.collection('users').doc(userEmail).update({favorites: tempo,}).then(()=> {console.log("deleted favorite : ", name)})
        }else{
            let tempo = [...fav];tempo.push(name);
            db.collection('users').doc(userEmail).update({favorites: tempo,}).then(()=> {console.log("added favorite : ", name)})
        }
    }

    function isCloseToBottom({layoutMeasurement, contentOffset, contentSize}){
        return layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
    }

    const handleBottomClose = () => {
        (limit<=230) ? setlimit(limit + 20):setlimit(250);
    }

    const DataIntervalOptions = () => {
        return(
            <ScrollView style={{flexDirection:"row"}} horizontal={true}>
                <Text style={{color:textColor(),fontWeight:"600",fontSize:16,textAlign:"left"}}>
                    In the past
                </Text>
                <Text> </Text>
                <TouchableOpacity style={{backgroundColor:"#428b8f",borderRadius:3,paddingHorizontal:5}} onPress={()=>toggleRenderDataInterval()}>
                    <Text style={{color:"white",fontWeight:"bold",fontSize:15,textAlign:"left"}}>
                        {ParseInterval(datainterval)}
                    </Text>
                </TouchableOpacity>
                {(heretoDatainterval)&&(
                    <View  style={{flexDirection:"row",justifyContent:"space-between",backgroundColor:intervalContainerColor(),borderRadius:5,marginLeft:5}}>
                        {dataIntervalListTab.map((e) => (
                            <TouchableOpacity key={e.interval} style={[styles.interval_btnTab, (datainterval===e.interval && bool_isDarkMode())&&{backgroundColor:"#ffffff"},(datainterval===e.interval && !bool_isDarkMode())&&{backgroundColor:"#2294DB"}]} onPress={()=>setIntervalFilter(e.interval)}>
                                <Text style={[styles.interval_text, (datainterval===e.interval && bool_isDarkMode())&&styles.interval_textActive, (!bool_isDarkMode())&&{color:"#FFFFFF"},(datainterval!==e.interval && bool_isDarkMode())&&{color:"#CCCCCC"}]}>{e.interval}</Text>
                            </TouchableOpacity>
                        
                        ))}
                    </View>
                )}
            </ScrollView>
        )
    }

    const ParseChangeByInterval = (i) => {
        let price = i.crntprice;let vol = i.crntvol;let change = i.change24h;
        let comparison = ParseIntervalForAPI(datainterval);
        if(comparison === "1h"){change = i.change1h}
        else if(comparison === "7d"){change = i.change7d}
        else if(comparison === "14d"){change = i.change14d}
        else if(comparison === "30d"){change = i.change30d}
        else if(comparison === "200d"){change = i.change200d}
        else if(comparison === "1y"){change = i.change1y}
        let percentage24price = change;let prix_num = price;let vol_str = '';
        let above1k = false;let potentiallysmall = false;
        if(Math.round(prix_num)>=1000){above1k = true;}
        else if(Math.round(prix_num)<1){potentiallysmall = true;}
        let prix = i.crntprice.toString();
        if(prix.length > 8 && potentiallysmall===true){
            let inCents = i.crntprice *100;
            let inCents_str = inCents.toString().substring(0, 8);
            prix = "¢"+inCents_str;
        }else{
            if(above1k===true){
                prix_num = prix_num / 1000;
                prix_num = Math.round(prix_num * 100) / 100 ;
                let asString = prix_num.toString();
                prix = "$"+asString+"K";
            }else{
                prix = "$"+prix;
            }
        }

        if(vol < 1000000000){//less than a billion
            let inmillion = i.crntvol / 1000000; // divide by a million
            inmillion = Math.round(inmillion * 100) / 100 ; // round to 2 decimals
            vol_str = inmillion.toString();
            vol_str = "$"+vol_str+"M";
        }else if(vol < 1000000000000){//less than a trillion
            let inbillion = i.crntvol / 1000000000; // divide by a billion
            inbillion = Math.round(inbillion * 100) / 100 ; // round to 2 decimals
            vol_str = inbillion.toString();
            vol_str = "$"+vol_str+"B";
        }else{
            let intrillion = i.crntvol / 1000000000000; // divide by a billion
            intrillion = Math.round(intrillion * 100) / 100 ; // round to 2 decimals
            vol_str = intrillion.toString();
            vol_str = "$"+vol_str+"T";
        }

        percentage24price = Math.round(percentage24price * 100) / 100;
        let asString24price = percentage24price.toString();
        let activeColor24price = '#E2E2E2';

        if(percentage24price>=0){
            asString24price = "+"+asString24price+"%";
            activeColor24price = buyColor();
        }else{
            asString24price = asString24price+"%";
            activeColor24price = sellColor();
        }

        return(<View style={{width:135}}>
            <Text style={{color:activeColor24price,fontSize:17,fontWeight:"bold",textAlign:"right"}}>{(status==="Market Cap") ? vol_str:prix}</Text>
            <Text style={{color:textColor(),fontSize:12,fontWeight:"bold",color:activeColor24price,textAlign:"right"}}>{asString24price}</Text>
        </View>)
    }

    const RenderByOption = () => {
        let finaldata = [...coindata]
        if(renderFavorites){
            finaldata = finaldata.filter(i => fav.some(item => item === i.name));
        }
        if(keyword.length > 0){
            finaldata = finaldata.filter(i => i.name.toLowerCase().includes(keyword.toLowerCase()) || i.symbol.toLowerCase().includes(keyword.toLowerCase()));
        }
        if(status === '24H'){
            finaldata = finaldata.sort((a, b) => Math.abs(b.price_change_percentage_24h) - Math.abs(a.price_change_percentage_24h));
        }
        finaldata = finaldata.slice(0, limit);
        return(
            <>
            {finaldata.map((coin)=>(
                <View key={coin.id} style={{alignSelf:"center"}}>
                    <View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center",height:50,width:"100%"}}>
                        <TouchableOpacity onPress={() => toggleRegisterFavorite(coin.name)}>
                            <View style={{marginLeft:20,justifyContent:"center"}}>
                                <View style={{position:"absolute",width:38,height:38,borderRadius:8,backgroundColor:"white",alignSelf:"center"}} />
                                <Image
                                    source={{uri:coin.image}}
                                    style={{width:32,height:32}}
                                />
                            </View>
                            {isInFavorite(coin.name) && (<Favorite_icon w={10} h={10}/>)}
                        </TouchableOpacity>
                        <TouchableOpacity style={{flex:1,marginLeft:10, alignSelf:"center"}} onPress={()=>navigation.navigate('Stack_Prices_Trading',{email:userEmail,imgurl:coin.image,sparkline:coin.sparkline_in_7d.price,tradingCoin:coin.name,coinprice:coin.current_price,coinsymbol:coin.symbol.toUpperCase(),upgraded:upgraded})}>
                            {(coin.name.length<=17)?(
                                <Text style={{color:textColor(),fontSize:17,fontWeight:"bold"}}>{coin.name}</Text>
                            ):(
                                <Text style={{color:textColor(),fontSize:17,fontWeight:"bold"}}>{coin.symbol.toUpperCase()}</Text>
                            )}
                            <Text style={{color:subTextColor(),fontSize:14,fontWeight:"bold"}}>{coin.symbol.toUpperCase()}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{flexDirection:"row", justifyContent:"space-between", alignSelf:"center", marginRight:15}}
                                onPress={()=>navigation.navigate('Stack_Prices_Trading',{email:userEmail,imgurl:coin.image,sparkline:coin.sparkline_in_7d.price,tradingCoin:coin.name,coinprice:coin.current_price,coinsymbol:coin.symbol.toUpperCase(),upgraded:upgraded})}>
                            <ParseChangeByInterval
                                change1h = {coin.price_change_percentage_1h_in_currency}
                                change24h = {coin.price_change_percentage_24h_in_currency}
                                change7d = {coin.price_change_percentage_7d_in_currency}
                                change14d = {coin.price_change_percentage_14d_in_currency}
                                change30d = {coin.price_change_percentage_30d_in_currency}
                                change200d = {coin.price_change_percentage_200d_in_currency}
                                change1y = {coin.price_change_percentage_1y_in_currency}
                                crntprice = {coin.current_price}
                                crntvol = {coin.market_cap}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            ))}
            </>
        )
    }

    return (
        <SafeAreaView style={{flex:1,backgroundColor:bgColor()}}>
        <StatusBar style="auto"/>
        <View>
            <View style={{alignItems:"center"}}>
                <TouchableOpacity style={{alignItems:"center"}} onPress={()=>tryrefresh()}>
                    <Image
                        source={require('../assets/icon.png')}
                        style={[{width:25,height:25,marginBottom:5,marginTop:-5,},(Platform.OS === 'ios') && {borderRadius:5}]}
                    />
                    <Text style={{color:brandTextColor(),marginBottom:5,fontSize:10,fontWeight:"bold"}}>CoinTracer</Text>
                </TouchableOpacity>
            </View>
            <View style={{paddingHorizontal:20,marginBottom:10}}>
                <View style={{paddingTop:10}}>
                    <DataIntervalOptions/>
                    <View style={{flexDirection:"row",justifyContent:"space-between",paddingTop:5}}>
                        <Trace_RenderGlobalChange propdata={changeData} darkmode={bool_isDarkMode()}/>
                    </View>
                </View>
            </View>
            <View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginBottom:5, width:Dimensions.get("window").width,height:35}}>
                <TextInput
                    style={[styles.input,{backgroundColor:containerColor(),color:textColor(),height:35}]}
                    label="keyword"
                    value={keyword}
                    onChangeText={(text)=>{handleKeyword(text);}}
                />
                <Image source={require("../assets/icons/1x/search.png")} style={{width:15,height:15,tintColor:"#519ABA",position:"absolute", marginLeft:20}}/>
                <TouchableOpacity style={{marginRight:10}} onPress={()=>toggleRenderFavorites()}>
                            {renderFavorites ? (<View style={{width:30,height:30,borderRadius:5,borderWidth:2,borderColor:"#BCAB34",justifyContent:"center",alignItems:"center"}}>
                            <Image
                                source={require("../assets/icons/1x/star2.png")}
                                style={{width:20,height:20,tintColor:"#BCAB34"}}
                            /></View>) : (<View style={{width:30,height:30,borderRadius:5,borderWidth:2,borderColor:"#519ABA",justifyContent:"center",alignItems:"center"}}>
                            <Image
                                source={require("../assets/icons/1x/star.png")}
                                style={{width:20,height:20,tintColor:"#519ABA"}}
                            /></View>)}
                </TouchableOpacity>
            </View>
            <View style={{paddingHorizontal:10,height:30,alignItems:"center",marginBottom:5}}>
                <View style={[styles.listTab,(bool_isDarkMode()?{backgroundColor:"white"}:{backgroundColor:"#E3E3E3"})]}>
                    {listTab.map((e) => (
                        <View key={e.status}>
                            <TouchableOpacity style={[styles.btnTab, status===e.status&&styles.btnTabActive]} onPress={()=>setStatusFilter(e.status)}>
                                <Text style={{fontSize:14,fontWeight:"bold"}}>{e.status}</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            </View>
            <View style={{height:Dimensions.get("window").height-dynamicMargin(),width:Dimensions.get("window").width-20,marginTop:1,marginBottom:1,alignSelf:"center",backgroundColor:containerColor(),borderRadius:10}}>
                <ScrollView
                ref={scrollViewRef}
                //onLayout={() => scrollViewRef.current.scrollToEnd()}
                scrollEventThrottle={4000}
                onScroll={({nativeEvent})=>{
                    //console.log("Trigger Height set to:",nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y);
                    //setTriggerHeight(nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y);
                    if(isCloseToBottom(nativeEvent)){
                        handleBottomClose();
                    }
                }}
                >
                        <RenderByOption/>
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
        </View>
        </SafeAreaView>
    )
}

export default Prices

const styles = StyleSheet.create({
    listTab:{
        flex:1,
        justifyContent:"space-between",
        flexDirection:"row",
        borderRadius:10,
        width:"100%",
    },
    btnTab:{
        width:(Dimensions.get("window").width-20)/3,
        flexDirection:"row",
        padding:5,
        justifyContent:"center",
        borderRadius:10,
        height:"100%",
    },
    btnTabActive:{
        backgroundColor:"#a6c4ff",
    },
    input: {
        width:Dimensions.get("window").width-57,
        marginLeft:10,
        paddingHorizontal: 10,
        paddingLeft:30,
        borderWidth: 1,
        borderRadius: 10,
        fontSize:15,
    },
    interval_btnTab:{
        borderRadius:3,paddingHorizontal:4,width:50
    },
    interval_text:{
        fontWeight:"bold",fontSize:15,textAlign:"center"
    },
    interval_textActive :{//for darkmode
        color:"#468559"
    }
})
