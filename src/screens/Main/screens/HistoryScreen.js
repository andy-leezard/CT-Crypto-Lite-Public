import React, { useEffect, useState} from 'react';
import { Text, View, Dimensions, TouchableOpacity, Image, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from "react-native-appearance";
import { AdMobBanner} from 'expo-ads-admob';
import Env from '../../../env.json';
import { db } from '../../../../firebase';
import Loading from '../../../components/Loading';

const HistoryScreen = ({route, navigation}) => {
    const scheme = useColorScheme();
    const [history, setHistory] = useState([]);
    const { email, ispro, bannerID } = route.params;
    const [limit, setlimit] = useState(20);

    const width = Dimensions.get("window").width-20;
    const screenHeight = Dimensions.get("window").height;

    useEffect(() => {
        if(typeof email === "string"){
            //console.log("HistoryScren.js - user email is :",email)
            db.collection('users').doc(route.params.email).collection('history').orderBy("orderNum", "desc").limit(limit).get()
                  .then((querySnapshot) => {
                    //console.log("HistoryScren.js - Updated history");
                    let arr = (querySnapshot.docs.map(order => ({
                        id: order.id,
                        type: order.data().type,
                        time: order.data().time,
                        target: order.data().target,
                        quantity: order.data().quantity,
                        price: order.data().price,
                        fiat: order.data().fiat,
                        imgsrc: order.data().imgsrc
                    })));
                    //console.log(arr);
                    setHistory(arr);
                  })
                  .catch((err)=>{
                    console.log(err);
                    setHistory(Array());
                  });
        }
    }, [route,limit])

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
        return bool_isDarkMode() ? "#a196b5":"#8c829e";
    }
    const buyColor = () => {
        return bool_isDarkMode() ? Env.buyColor_dark:Env.buyColor_light;
    }
    const sellColor = () => {
        return bool_isDarkMode() ? Env.sellColor_dark:Env.sellColor_light;
    }
    const textColor = () => {
        return bool_isDarkMode() ? "#FFFFFF":"#000000";
    }
    const numberWithCommas = (i) => {
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
    const dynamicMargin = () => {
        if(ispro){
            return (Platform.OS === "ios") ? 194:138;
        }else{
            return (Platform.OS === "ios") ? 254:198;
        }
    }
    const dynamicRound = (i,j) => {
        return (Math.round(i * Math.pow(10,j)) / Math.pow(10,j));
    }
    const renderFreeIfZero = (i) => {
        if(i>0){
            return i;
        }else if(i===0){
            return "free";
        }else{
            return "upgrade";
        }
    }

    const InternalLoadingScreen = () => {
        return(
            <View>
                <Text style={{color:textColor(),alignSelf:"center", marginTop:20, marginBottom:40}}>fetching data...</Text>
                <View style={{alignSelf:"center"}}>
                    <Loading width={40} height={40}/>
                </View>
            </View>
        )
    }
    function isCloseToBottom({layoutMeasurement, contentOffset, contentSize}){
        return layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
    }
    const handleBottomClose = () => {
        //setScrolled(true);
        setlimit(limit + 20);
    }

    const RenderScreen = () => {
            return (
                <View>
                    {history.map((i,index)=>(
                            <View key={index} style={[{flexDirection:"row",height:50,padding:5,margin:2,alignItems:"center",borderRadius:5},(i.type==="Sold" || i.type === "Spent")?{backgroundColor:sellColor()}:{backgroundColor:buyColor()}]}>
                                <View style={{position:"absolute",width:34,height:34,borderRadius:8,backgroundColor:"white",marginLeft:8}} />
                                <Image source={{uri:i.imgsrc}} style={{width:29,height:29,marginLeft:5}}/>
                                <View style={{marginLeft:10, width:"90%",marginRight:5}}>
                                    <Text style={{color:textColor(),fontWeight:"700"}}>{i.type} {i.quantity} {i.target} for {(i.fiat>0) ? "$":""}{(i.fiat>0) ? (numberWithCommas(dynamicRound(i.fiat,2))):(renderFreeIfZero(i.fiat))}</Text>
                                    <View style={{flexDirection:"row",justifyContent:"space-between",marginRight:13}}>
                                        <Text style={{color:textColor()}}>{i.time}</Text>
                                        <Text style={{color:textColor()}}>1{i.target} = ${numberWithCommas(dynamicRound(i.price,2))}</Text>
                                    </View>
                                </View>
                            </View>
                        ))}
                </View>
            )
    }

    return(
        <SafeAreaView style={{flex:1,backgroundColor:bgColor()}}>
            <TouchableOpacity onPress={()=>navigation.goBack()} style={{marginBottom:15,marginTop:5,marginLeft:5}}>
                <View style={{flexDirection:"row",alignItems:"center"}}>
                    <Image source={require("../../../assets/icons/1x/arrow_darkmode_flipped.png")} style={[{width:20,height:20,marginLeft:5},(!bool_isDarkMode())&&{tintColor:"#000000"}]}/>
                    <Text style={{fontSize:20,fontWeight:"bold",color:textColor(),marginLeft:5}}>History</Text>
                </View>
            </TouchableOpacity>
            <View style={{alignSelf:"center",borderWidth:2,borderRadius:10,borderColor:borderColor(),backgroundColor:containerColor(),width:width, height:screenHeight-dynamicMargin(),marginBottom:2}}>
                <ScrollView
                    scrollEventThrottle={4000}
                    onScroll={({nativeEvent})=>{
                        //console.log("Trigger Height set to:",nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y);
                        //setTriggerHeight(nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y);
                        if(isCloseToBottom(nativeEvent)){
                            handleBottomClose();
                        }
                    }}
                    style={{padding:5}}
                >
                    {(history.length===0)?(<InternalLoadingScreen/>):(<RenderScreen/>)}
                    <View style={{height:10}}/>
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

export default HistoryScreen
