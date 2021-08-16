import React, {useEffect, useState} from 'react';
import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity, Dimensions, Platform, Alert } from 'react-native';
import { AdMobBanner} from 'expo-ads-admob';
import { PieChart } from "react-native-chart-kit";
import _ from 'lodash';
import { useColorScheme } from "react-native-appearance";
import Env from '../env.json';
import { useNavigation } from '@react-navigation/core';
import { db } from '../../firebase';

const screenWidth = Dimensions.get("window").width;
const width = screenWidth-20;
const screenHeight = Dimensions.get("window").height;

const initialLimit = 15;

const Portfolio = ({userEmail, portfolio, ispro, bannerID, upgraded, isTablet}) => {
    const navigation = useNavigation();
    const scheme = useColorScheme();
    const [viewStatus,setViewStatus] = useState(0);
    const [limit, setlimit] = useState(initialLimit);
    const [walletdata, setWalletdata] = useState([]);
    const chartConfig = {
        backgroundGradientFrom: '#000000',
        backgroundGradientTo: '#000000',
        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`
    }

    useEffect(() => {
        let _walletdata = avoidDuplicate(_.cloneDeep(portfolio.associatedData));
        _walletdata = _walletdata.slice(0, limit);
        setWalletdata(_walletdata);
    }, [portfolio, limit])

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
    const dynamicMargin = () => {
        if(ispro){
            return (Platform.OS === 'ios') ? 448:401;
        }else{
            return (Platform.OS === 'ios') ? 508:461;
        }
    }
    const avoidDuplicate = (d) => Object.values(d).reduce((r, i) => !~r.indexOf(i) ? (r.push(i), r) : r , []);

    const simplifyDate = (i) => {
        let j = i.toString();
        let k = j.split(" ");
        let l = k.slice(1, 4);
        return l.join(' ');
    }

    const tryDeleteDelisted = (i,s) => {
        Alert.alert(
            "Delisted crypto",
            `${i} (${s}) has been delisted from the market due to its poor market performance.\nWould you like to delete your ${s} wallet?\nThis can't be undone. Please note that a delisted crypto still has a chance to be relisted later on.`,
        [
            { text: "Confirm", onPress: () =>  deleteDelisted(i) },
            { text: "Cancel", style: "cancel"}
        ]
        );
    }

    const deleteDelisted = (i) => {
        db.collection('users').doc(userEmail).collection('wallet').doc(i).delete().then(()=>{
            Alert.alert(
                "Notification",
                `Your ${i} wallet has been deleted following your request.`,
            [{ text: "OK"},]);
            console.log(i," wallet has been deleted at : "+new Date().toLocaleString());
        }).catch((e)=>{
            Alert.alert(
                "Error",
                e,
            [{ text: "OK"},]);
        })
    }

    const triggerUpdatePNL = () =>{
        Alert.alert(
            "Notification","Proceeding will update your PNL data.",
        [
            { text: "Confirm", onPress: () =>  updatePNL() },
            { text: "Cancel", style: "cancel"}
        ]
        );
    }
    const updatePNL = () => {
        let dateobj = ("Since "+simplifyDate(new Date().toDateString()));
        const directory = db.collection('users').doc(userEmail);
        directory.update({totalbuyin: portfolio.totalAppreciation,pnldate: dateobj});
    }

    function numberWithCommas(i) {
        if(i<1000){
            return i;
        }else{
            let j = i.toString();
            let k = j.split(".");
            let intpart = Number(k[0])
            let intAsString = intpart.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
            if(k.length>1){
                let decimalpart = Number(k[1]);
                return intAsString+"."+ decimalpart.toString();
            }else{
                return intAsString;
            }
        }
    }


    function dynamicRound(i,j){
        return (Math.round(i * Math.pow(10,j)) / Math.pow(10,j));
    }

    function autoRound(i){
        if(i>100000){
            return (Math.round(i * Math.pow(10,2)) / Math.pow(10,2));
        }else if(i>1000){
            return (Math.round(i * Math.pow(10,4)) / Math.pow(10,4));
        }else if(i>1){
            return (Math.round(i * Math.pow(10,6)) / Math.pow(10,6));
        }else{
            return (Math.round(i * Math.pow(10,8)) / Math.pow(10,8));
        }
    }

    function isCloseToBottom({layoutMeasurement, contentOffset, contentSize}){
        return layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
    }

    const toggleViewStatus = () => {
        (viewStatus<2) ? setViewStatus(viewStatus+1):setViewStatus(0);
    }

    const conditionalRender = (i,degree,length) => {
        return (degree>=viewStatus) ? i:new String("*").repeat(length);
    }

    const handleBottomClose = () => {
        const obj = portfolio.associatedData ?? Array();
        let maxLimit = obj.length;
        if(maxLimit===0){return;}
        let delta = Math.abs(maxLimit - limit);
        (delta>=10) ? setlimit(limit + 10):setlimit(maxLimit);
    }
    const openHistory = () => {
        navigation.navigate('Stack_History',{email:userEmail,ispro:ispro,bannerID:bannerID,isTablet:isTablet})
    }
    const adError = (e) => {
        console.log("Error showing banner ad ! : ",e);
    }


    return (
        <View style={{flex:1, backgroundColor:bgColor()}}>
            <View>
            <View style={{marginTop:10}}>
                <View style={{width:width, borderRadius:10, borderWidth:3, borderColor:containerRadiusColor(), backgroundColor:containerColor(), padding:10,marginBottom:10,alignSelf:"center"}}>
                    <TouchableOpacity style={{alignSelf:"center"}} onPress={()=>toggleViewStatus()}>
                        <Text style={{position:"absolute",alignSelf:"flex-start",color:textColor(),fontSize:16,fontWeight:"600",marginBottom:10,fontWeight:"bold",marginLeft:10}}>Total value : ${conditionalRender(portfolio.totalAppreciation,0,6)} (fiat:{conditionalRender((dynamicRound((portfolio.seed/portfolio.totalAppreciation)*100,2)),1,2)}%)</Text>
                        <View style={{position:"absolute",alignSelf:"flex-end"}} >
                            {(viewStatus===0) && <View style={{width:30,height:25,borderRadius:5,backgroundColor:"#CBCBCB",justifyContent:"center",alignItems:"center"}}><Image source={require("../assets/icons/1x/view.png")} style={{width:20,height:20,tintColor:"#40B2AB"}}/></View>}
                            {(viewStatus===1) && <View style={{width:30,height:25,borderRadius:5,backgroundColor:"#CBCBCB",justifyContent:"center",alignItems:"center"}}><Image source={require("../assets/icons/1x/hide.png")} style={{width:20,height:20,tintColor:"#2D7E71"}}/></View>}
                            {(viewStatus===2) && <View style={{width:30,height:25,borderRadius:5,backgroundColor:"#CBCBCB",justifyContent:"center",alignItems:"center"}}><Image source={require("../assets/icons/1x/hide.png")} style={{width:20,height:20,tintColor:"#D65F3E"}}/></View>}
                        </View>
                        {(portfolio.piedata != undefined) && (
                        <View style={{marginTop:8}}>
                        <PieChart
                            width={width-20}
                            height={200}
                            data={portfolio.piedata}
                            accessor="appreciation"
                            backgroundColor="transparent"
                            paddingLeft="40"
                            chartConfig={chartConfig}
                        />
                        </View>
                        )}
                    </TouchableOpacity>
                </View>
                {/*onPress={ toggle history }*/}
                <View style={{height:screenHeight-dynamicMargin(),width:width,marginTop:1,marginBottom:1,alignSelf:"center",backgroundColor:containerColor(),borderRadius:10}}>
                    <ScrollView
                        scrollEventThrottle={2000}
                        onScroll={({nativeEvent})=>{
                            if(isCloseToBottom(nativeEvent)){
                                handleBottomClose();
                        }}}
                    >
                        <View style={{alignItems:"center"}}>
                        <TouchableOpacity onPress={openHistory}>
                        <View style={{flexDirection:"row",justifyContent:"space-between",borderWidth:2,borderRadius:10,borderColor:containerRadiusColor(),backgroundColor:containerColor(), width:width-20, height:50,padding:5,marginTop:10}}>
                                <View style={{flexDirection:"row", width:((width/2)-15), alignItems:"center"}}>
                                    <Image source={require("../assets/icons/1x/Analytic.png")} style={{width:32,height:32,tintColor:"#40AAF2",marginLeft:3}}/>
                                    <View style={{flexDirection:"column"}}>
                                        <Text style={{fontSize:15,fontWeight:"bold",color:textColor(),marginLeft:11}}>My PNL</Text>
                                        <Text style={{fontSize:15,fontWeight:"bold",color:textColor(),marginLeft:11}}>(All-time)</Text>
                                    </View>
                                </View>
                                <View style={{flexDirection:"column", width:((width/2)-15)}}>
                                    {(portfolio.pnl_const>=0) ? (
                                        <Text style={[styles.changetext, viewStatus>1 ? (bool_isDarkMode()? styles.changetext_neutral_dark:styles.changetext_neutral_light):{color:buyColor()}]}>{viewStatus<2 && "+"}{conditionalRender(portfolio.pnl_const,1,2)}%</Text>
                                        ):(
                                        <Text style={[styles.changetext, viewStatus>1 ? (bool_isDarkMode()? styles.changetext_neutral_dark:styles.changetext_neutral_light):{color:sellColor()}]}>{conditionalRender(portfolio.pnl_const,1,2)}%</Text>
                                    )}
                                    {(portfolio.pnl_const>=0) ? (
                                        <Text style={bool_isDarkMode()? styles.changetext_neutral_dark:styles.changetext_neutral_light}>{viewStatus<1 && "+"} ${conditionalRender(numberWithCommas(dynamicRound(portfolio.totalAppreciation-portfolio.totalbuyin_const,2)),0,6)}</Text>
                                    ):(
                                        <Text style={bool_isDarkMode()? styles.changetext_neutral_dark:styles.changetext_neutral_light}>{viewStatus<1 && "-"} ${conditionalRender(numberWithCommas(Math.abs(dynamicRound(portfolio.totalAppreciation-portfolio.totalbuyin_const,2))),0,6)}</Text>
                                    )}
                                </View>
                        </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={triggerUpdatePNL}>
                            <View style={{flexDirection:"row",justifyContent:"space-between",borderWidth:2,borderRadius:10,borderColor:containerRadiusColor(),backgroundColor:containerColor(), width:width-20, height:50,padding:5,marginTop:10}}>
                                <View style={{flexDirection:"row", width:((width/2)-15), alignItems:"center"}}>
                                    <Image source={require("../assets/icons/1x/Analytic.png")} style={{width:32,height:32,tintColor:"#40AAF2",marginLeft:3}}/>
                                    <View style={{flexDirection:"column"}}>
                                        <Text style={{fontSize:15,fontWeight:"bold",color:textColor(),marginLeft:11}}>My PNL</Text>
                                        <Text style={{fontSize:15,fontWeight:"bold",color:textColor(),marginLeft:11}}>({portfolio.pnldate})</Text>
                                    </View>
                                    
                                </View>
                                <View style={{flexDirection:"column", width:((width/2)-15)}}>
                                    {(portfolio.pnl>=0) ? (
                                        <Text style={[styles.changetext, viewStatus>1 ? (bool_isDarkMode()? styles.changetext_neutral_dark:styles.changetext_neutral_light):{color:buyColor()}]}>{viewStatus<2 && "+"}{conditionalRender(portfolio.pnl,1,2)}%</Text>
                                        ):(
                                        <Text style={[styles.changetext, viewStatus>1 ? (bool_isDarkMode()? styles.changetext_neutral_dark:styles.changetext_neutral_light):{color:sellColor()}]}>{conditionalRender(portfolio.pnl,1,2)}%</Text>
                                    )}
                                    {(portfolio.pnl>=0) ? (
                                        <Text style={bool_isDarkMode()? styles.changetext_neutral_dark:styles.changetext_neutral_light}>{viewStatus<1 && "+"} ${conditionalRender(numberWithCommas(dynamicRound(portfolio.totalAppreciation-portfolio.totalbuyin,2)),0,6)}</Text>
                                    ):(
                                        <Text style={bool_isDarkMode()? styles.changetext_neutral_dark:styles.changetext_neutral_light}>{viewStatus<1 && "-"} ${conditionalRender(numberWithCommas(Math.abs(dynamicRound(portfolio.totalAppreciation-portfolio.totalbuyin,2))),0,6)}</Text>
                                    )}
                                </View>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={openHistory}>
                            <View style={{flexDirection:"row",justifyContent:"space-between",borderWidth:2,borderRadius:10,borderColor:containerRadiusColor(),backgroundColor:containerColor(), width:width-20, height:50,padding:5,marginTop:10}}>
                                    <View style={{flexDirection:"row", width:((width/2)-15), alignItems:"center"}}>
                                        <View style={{position:"absolute",width:38,height:38,borderRadius:8,backgroundColor:"white"}} />
                                        <Image source={require('../assets/icons/1x/usd_custom.png')} style={{width:32,height:32,marginLeft:3}}/>
                                        <Text style={{fontSize:15,fontWeight:"bold",color:textColor(),marginLeft:11}}>My virtual USD wallet</Text>
                                    </View>
                                    <View style={{flexDirection:"column", width:((width/2)-15)}}>
                                        <Text style={{fontSize:15,fontWeight:"bold",color:textColor(),marginRight:5,textAlign:"right"}}>${conditionalRender(numberWithCommas(dynamicRound(portfolio.seed,2)),0,6)}</Text>
                                        <Text style={[bool_isDarkMode()? styles.changetext_neutral_dark:styles.changetext_neutral_light,{fontSize:15,fontWeight:"bold",marginRight:5,textAlign:"right"}]}>{conditionalRender(portfolio.seed,0,6)} VUSD</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                        {walletdata.map((i, index)=>{
                            if(i.id != "VUSD"){
                            return(
                                <TouchableOpacity key={index} onPress={()=>navigation.navigate('Stack_Portfolio_Trading',{email:userEmail,imgurl:i.img,rank:i.rank,sparkline:i.spark,tradingCoin:i.name,coinprice:i.crntPrice,coinsymbol:i.id,upgraded:upgraded,bannerID:bannerID,ispro:ispro})}>
                                    <View style={{flexDirection:"row",justifyContent:"space-between",borderWidth:2,borderRadius:10,borderColor:containerRadiusColor(),backgroundColor:containerColor(), width:width-20, height:50,padding:5,marginTop:10}}>
                                        <View style={{flexDirection:"row", width:((width/2)-15), alignItems:"center"}}>
                                            <View style={{position:"absolute",width:38,height:38,borderRadius:8,backgroundColor:"white"}} />
                                            <Image source={{uri:i.img}} style={{width:32,height:32,marginLeft:3}}/>
                                            <Text style={{fontSize:15,fontWeight:"bold",color:textColor(),marginLeft:11}}>My {i.id} wallet</Text>
                                            {/* // for when individual wallet PNL is available with average purchasing price.
                                            <View style={{flexDirection:"row",justifyContent:"space-between",marginLeft:11}}>
                                                <Text style={{fontSize:16,fontWeight:"bold",color:textColor()}}>{i.id} wallet</Text>
                                                <Text style={{fontSize:14,fontWeight:"bold",color:subTextColor()}}>{conditionalRender(numberWithCommas(autoRound(i.quantity)),0,6)} {i.id}</Text>
                                            </View>
                                            */}
                                        </View>
                                        <View style={{flexDirection:"column", width:((width/2)-15)}}>
                                            <Text style={{fontSize:15,fontWeight:"bold",color:textColor(),marginRight:5,textAlign:"right"}}>${conditionalRender(numberWithCommas(dynamicRound(i.quantity*i.crntPrice,2)),0,6)}</Text>
                                            <Text style={[bool_isDarkMode()? styles.changetext_neutral_dark:styles.changetext_neutral_light,{fontSize:15,fontWeight:"bold",marginRight:5,textAlign:"right"}]}>{conditionalRender(numberWithCommas(autoRound(i.quantity)),0,6)} {i.id}</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            )}
                        })}
                        {portfolio.delisted.map((i)=>{
                            return(
                                <TouchableOpacity key={i.name} onPress={()=>tryDeleteDelisted(i.name,i.symbol)}>
                                    <View style={{flexDirection:"row",justifyContent:"space-between",borderWidth:2,borderRadius:10,borderColor:containerRadiusColor(),backgroundColor:containerColor(), width:width-20, height:50,padding:5,marginTop:10}}>
                                        <View style={{flexDirection:"row", width:((width/2)-15), alignItems:"center"}}>
                                            <View style={{position:"absolute",width:38,height:38,borderRadius:8,backgroundColor:"white"}} />
                                            <Image source={{uri:i.img}} style={{width:32,height:32,marginLeft:3}}/>
                                            {(i.symbol.length<13) ? (<View style={{flexDirection:"column",justifyContent:"space-between"}}>
                                                <Text style={{fontSize:15,fontWeight:"bold",color:textColor(),marginLeft:11}}>My {i.symbol} wallet</Text>
                                                <Text style={{fontSize:14,fontWeight:"bold",color:textColor(),marginLeft:11}}>(delisted)</Text>
                                            </View>):(<View style={{flexDirection:"column",justifyContent:"space-between"}}>
                                                <Text style={{fontSize:15,fontWeight:"bold",color:textColor(),marginLeft:11}}>My {i.symbol} wallet (delisted)</Text>
                                            </View>
                                            )}
                                        </View>
                                        <View style={{flexDirection:"column", width:((width/2)-15)}}>
                                            <Text style={{fontSize:15,fontWeight:"bold",color:textColor(),marginRight:5,textAlign:"right"}}>$ 0</Text>
                                            <Text style={[bool_isDarkMode()? styles.changetext_neutral_dark:styles.changetext_neutral_light,{fontSize:15,fontWeight:"bold",marginRight:5,textAlign:"right"}]}>{conditionalRender(numberWithCommas(autoRound(i.quantity)),0,6)} {i.symbol}</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            )
                        })}
                        <View style={{height:10}}/>
                        </View>
                    </ScrollView>
                </View>
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

export default Portfolio

const styles = StyleSheet.create({
    changetext:{
        fontSize:15,fontWeight:"bold",marginRight:5,textAlign:"right"
    },
    changetext_neutral_dark:{
        fontSize:15,fontWeight:"bold",color:"#CCCCCC",marginRight:5,textAlign:"right"
    },
    changetext_neutral_light:{
        fontSize:15,fontWeight:"bold",color:"#4A4A4A",marginRight:5,textAlign:"right"
    }
})
