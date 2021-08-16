import React, {useRef,useEffect,useState} from 'react'
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions, TextInput, Alert } from 'react-native'
import { db } from '../../firebase';
import { Button } from 'react-native-elements';
import Slider from "@brlja/react-native-slider";
import AdMobRewardedComponent from './AdMobRewardedComponent';
import { useColorScheme } from "react-native-appearance";
import Env from '../env.json';
import * as StoreReview from 'expo-store-review';
import stablecoins from '../stablecoins.json';

const width = Dimensions.get("window").width-20;
const actionListTab = [
    {action: "Buy",/*1h = hour*/},{action: "Sell",/*1h = hour*/}
];

const Trader = ({coinname,user,coinprice,coinsymbol,coinIcon,upgraded}) => {
    const [quantity, setquantity] = useState(0);
    const [seed, setSeed] = useState(0);
    const [action, setAction] = useState('Buy');
    const [actionColor, setActionColor] = useState("#42B95D");
    const [unitmode, setUnitmode] = useState("Fiat");
    const [percentage, setPercentage] = useState(0);
    const [actionQuantity,setActionQuantity] = useState(0);
    const [actionQuantity_crypto, setActionQuantity_crypto] = useState(0);
    const [actionQuantity_fiat, setActionQuantity_fiat] = useState(0);
    const [actionQuantity_str,setActionQuantity_str] = useState("");
    const [limit, setLimit] = useState(0);
    const [commission_percentage, setCommission_Percentage] = useState(1);
    const inputRef =  useRef();

    const ref = db.collection('users').doc(user);

    const stableCoinAlert = () =>{
        const message = coinname + ` is a stable coin.\nIts price won't change much.`;
        Alert.alert(
            "Information",
            message,
            [
              {text: "OK"}
            ]
        );
    }
    
    useEffect(() => {
        bool_isDarkMode() ? setActionColor("#42B95D"):setActionColor("#36eb5f");
        db.collection('globalEnv').doc("commission").get().then((doc)=> {
            if(doc.exists){
                upgraded ? setCommission_Percentage(doc.data().as_percentage_pro):setCommission_Percentage(doc.data().as_percentage_default);
            }else{
                console.log("Warning - globalEnv collection not found in db !");
            }
        }).catch((err)=>{console.log(err)});
        const unsubscribe = ref.onSnapshot((doc)=>{
                setSeed(doc.data().seed);
                let _seed = doc.data().seed;
                ref.collection('wallet').doc(coinname).get().then((doc)=> {
                    if(doc.exists){
                        setquantity(doc.data().quantity);
                        if(unitmode==="Fiat"){setLimit(_seed);}else{setLimit(doc.data().quantity);}
                        console.log("Document data:", doc.data().quantity);
                    }else{
                        stablecoins.some(item => item.name === coinname) && stableCoinAlert();
                        ref.collection("wallet").doc(coinname).set({quantity: 0,symbol: coinsymbol})
                            .then(()=>{console.log("successfully created a new wallet ref :", coinname)})
                        // doc.data() will be undefined in this case
                    }
                }).catch((error)=>{console.log(error)});
            })
        return unsubscribe;
    },[]);

    String.prototype.replaceAt = function(index, replacement) {
        return this.substr(0, index) + replacement + this.substr(index + replacement.length);
    }

    const requestReview = async() => {
        let _1 = await StoreReview.isAvailableAsync();
        let _2 = await StoreReview.hasAction();
        let _3 = await StoreReview.storeUrl() ?? "";
        let _4 = Math.random();
        let proba = 0.25; // probability that it will ask to review app.
        console.log("can this device review ??",_1);
        console.log("has action ?? ",_2);
        console.log("What is the store url ?? ",_3);
        if(_1 && _2 && _3 !=="" && _4 < proba){
            console.log("requesting review");
            await StoreReview.requestReview();
        }else{
            (_4<proba) ? console.log("cannot demand review") : console.log("not requesting review this time.");
        }
    }

    const buyPrice = () => {
        return coinprice*(1+(commission_percentage/100));
    }
    const sellPrice = () => {
        return coinprice*(1-(commission_percentage/100));
    }

    const scheme = useColorScheme();
    const bool_isDarkMode = () => {
        return scheme === "dark";
    }
    const containerColor = () => {
        return bool_isDarkMode() ? "#1c1c1c":"#e8e8e8";
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
    const subTextColor = () => {
        return bool_isDarkMode() ? "#CCCCCC":"#737373";
    }
    const unitContainerColor = () => {
        return bool_isDarkMode() ? "white":"#2294DB";
    }
    const unitTextColor = () => {
        return bool_isDarkMode() ? "#468559":"white";
    }
    const containerColor_secondary = () => {
        return bool_isDarkMode() ? "#333333":"#5c5c5c";
    }
    const containerRadiusColor = () => {
        return bool_isDarkMode() ? "#a196b5":"#8c829e";
    }

    const regardingCommissionFees = () => {
        upgraded ? Alert.alert(
            "Information","The commission reduction is already applied.",
        [{ text: "Cool"}]
        ):Alert.alert(
            "Notification","The commission rate can be reduced by upgrading your account. Please check out 'Settings' tab for further information.",
        [{ text: "OK"}]
        )
    }

    const updateLimit = (s,q,a,u) => {
        //seed, quantity, action, unitmode
        if(a==='Buy'){
            if(u==="Fiat"){
                setLimit(s);
                console.log("limit set to :",s);
            }else{
                if(buyPrice<=0){
                    setLimit(0);
                }else{
                    let temp = dynamicRound(s/buyPrice(),8);
                    setLimit(temp);
                    console.log("limit set to :",temp,coinsymbol); 
                }
            }
        }else{
            if(u==="Fiat"){
                let temp = dynamicRound(q*sellPrice(),2);
                setLimit(temp);
                console.log("limit set to :",temp);
            }else{
                setLimit(q);
                console.log("limit set to :",q,coinsymbol);
            }
        }
    }

    const amount_decimalHandler = (i) => {//typeof i = "str"
        let cut = i.substring(0,i.length-1)
        let replaced = cut.replaceAt(cut.length-1,i[i.length-1]);
        let asNum = Number(replaced);
        setActionQuantity_str(replaced);
        trigger_handleAmount(asNum);
    }

    const amountHandler = (i) => {
        if(unitmode==="Fiat"){
            if(lengthOfDecimal(i)>2){
                if(lengthOfDecimal(i)>3){
                    amount_decimalHandler(dynamicRound(i,3).toString());
                    return;
                }
                if(i[i.length-1]==="0"){
                    return;
                }else{
                    amount_decimalHandler(i);
                    return;
                }
            }
        }else{
            if(lengthOfDecimal(i)>8){
                if(lengthOfDecimal(i)>9){
                    amount_decimalHandler(dynamicRound(i,9).toString());
                    return;
                }
                if(i[i.length-1]==="0"){
                    return;
                }else{
                    amount_decimalHandler(i);
                    return;
                }
            }
        }
        if(i===""){
            setActionQuantity_str("");
            setActionQuantity(0);setActionQuantity_crypto(0);setActionQuantity_fiat(0);setPercentage(0);
            return;
        }
        if(i==="." || i===","){
            setActionQuantity_str("0.");
            return;
        }
        if(i[i.length-1]===","){
            if(char_count(i,".")===0){
                setActionQuantity_str(i.replace(',', '.'))
                return;
            }else{
                return;
            }
        }
        if(char_count(i,".")>1){
            console.log("More than one dot ! return.")
            return;
        }
        if(i[i.length-1]!=="."){
            let param = Number(i);
            if(param===0 && i.length<2){
                setActionQuantity_str("0");setActionQuantity(0);setActionQuantity_crypto(0);setActionQuantity_fiat(0);
                setPercentage(0);
                return;
            }
            if(char_count(i,".")<1){
                setActionQuantity_str(param.toString());
            }else{
                setActionQuantity_str(i);
            }
            if(param>limit){
                console.log("Warning - action quantity (", param , ") surpassed the limit :",limit);
                setActionQuantity(limit);slideHandler_justCrypto(1);slideHandler_justFiat(1);
                setPercentage(1);setActionQuantity_str(limit.toString());
            }else{
                console.log("OK - Action quantity (", param , ") does not surpass the limit :",limit);
                trigger_handleAmount(param);
            }
        }else{
            setActionQuantity_str(i);
        }
    }

    const trigger_handleAmount = (param) => {
        let asPercentage = (param/limit);
        asPercentage = dynamicRound(asPercentage,3);
        setPercentage(asPercentage);//slideHandler_justCrypto(asPercentage);slideHandler_justFiat(asPercentage);
        setActionQuantity(param);//setActionQuantity_fiat(param);
        if(unitmode==="Fiat"){
            setActionQuantity_fiat(param);
            if(action==='Buy'){
                setActionQuantity_crypto(min_threshold(dynamicRound(param/buyPrice(),8)));
            }else{
                setActionQuantity_crypto(min_threshold(dynamicRound(param/sellPrice(),8)));
            }
        }else{
            if(action==='Buy'){
                setActionQuantity_fiat(buyPrice()*param);
                if(buyPrice()*param<0.01){
                    setActionQuantity_crypto(0);
                }else{
                    setActionQuantity_crypto(min_threshold_sell(param));
                }
            }else{
                setActionQuantity_fiat(sellPrice()*param);
                if(sellPrice()*param<0.01){
                    setActionQuantity_crypto(0);
                }else{
                    setActionQuantity_crypto(min_threshold_sell(param));
                }
            }
        }
    }

    const slideHandler_justCrypto = (i) => {
        if(i===0){
            setActionQuantity_crypto(0);
            return;
        }
        if(action==='Buy'){
            let tempseed = dynamicRound(seed*i,2);
            if(buyPrice()<=0){//security
                setActionQuantity_crypto(0);
                return;
            }
            let tempcrypto = dynamicRound((tempseed/buyPrice()),8);
            setActionQuantity_crypto(tempcrypto);
        }else{
            let tempquantity = dynamicRound(quantity*i,8);
            setActionQuantity_crypto(tempquantity);
        }
    }

    const slideHandler_justFiat = (i) => {
        if(i===0){
            setActionQuantity_fiat(0);
            return;
        }
        if(action==='Buy'){
            if(buyPrice()<=0){//security
                setActionQuantity_fiat(0);
                return;
            }
            let tempfiat = dynamicRound(seed*i,2);
            setActionQuantity_fiat(tempfiat);
        }else{
            let tempquantity = dynamicRound(quantity*i,8);
            let tempfiat = dynamicRound(tempquantity*sellPrice(),2);
            setActionQuantity_fiat(tempfiat);
        }
    }

    const slideHandler = (i) => {
        let param = Number(i); //because the parameter is an array with a single element as a number value...
        setPercentage(param);
        if(param===0){
            setActionQuantity_str("");setActionQuantity(0);setActionQuantity_crypto(0);setActionQuantity_fiat(0);
            return;
        }
        if(action==='Buy'){
            if(buyPrice()<=0){
                setActionQuantity(0);setActionQuantity_str("");setActionQuantity_crypto(0);setActionQuantity_fiat(0);
                return;
            }
            let tempfiat = dynamicRound(seed*param,2);
            setActionQuantity_fiat(tempfiat);
            let tempcrypto = dynamicRound((tempfiat/buyPrice()),8);
            setActionQuantity_crypto(tempcrypto);
            if(unitmode==="Fiat"){
                setActionQuantity(tempfiat);
                setActionQuantity_str(tempfiat.toString());
            }else{
                setActionQuantity(tempcrypto);
                setActionQuantity_str(tempcrypto.toString());
            }
        }else{
            let tempquantity = dynamicRound(quantity*param,8);
            setActionQuantity_crypto(tempquantity);
            let tempfiat = dynamicRound(tempquantity*sellPrice(),2);
            setActionQuantity_fiat(tempfiat);
            if(unitmode==="Fiat"){
                setActionQuantity(tempfiat);
                setActionQuantity_str(tempfiat.toString());
            }else{
                setActionQuantity(tempquantity);
                setActionQuantity_str(tempquantity.toString());
            }
        }
    }

    const setActionFilter = (i) => {
        if(action === i){
            if(actionQuantity>0){
                triggerTrade();return;
            }else{
                alert_noAmount();return;
            }
        }
        if(i==="Buy"){bool_isDarkMode() ? setActionColor("#42B95D"):setActionColor("#36eb5f");}//Previously #35934A
        else{bool_isDarkMode() ? setActionColor("#FF5A4A"):setActionColor("#ff6161");}
        setAction(i);setPercentage(0);setActionQuantity(0);setActionQuantity_str("");
        setActionQuantity_fiat(0);setActionQuantity_crypto(0);
        updateLimit(seed,quantity,i,unitmode);
    }

    const setUnitFilter = (i) => {
        setUnitmode(i);
        if(action==='Buy'){
            if(i==="Fiat"){
                setLimit(seed);
                let temp = dynamicRound(seed *percentage,2);
                setActionQuantity(temp);
                setActionQuantity_fiat(temp);
                setActionQuantity_str(temp.toString());
            }else{
                if(buyPrice()<=0){
                    setLimit(0);
                    setActionQuantity(0);
                    setActionQuantity_str("");
                    setActionQuantity_crypto(0);
                    setActionQuantity_fiat(0);
                }else{
                    let temp = dynamicRound(seed/buyPrice(),8);
                    setLimit(temp);
                    let temp2 = dynamicRound(temp*percentage,8);
                    setActionQuantity(temp2);
                    setActionQuantity_str(temp2.toString());
                    setActionQuantity_crypto(temp2);
                }
            }
        }else{
            if(i==="Fiat"){
                let temp = dynamicRound(quantity*sellPrice(),2);
                setLimit(temp);
                let temp2 = dynamicRound(temp*percentage,2);
                setActionQuantity(temp2);
                setActionQuantity_str(temp2.toString());
                setActionQuantity_fiat(temp2);
            }else{
                setLimit(quantity);
                let temp = dynamicRound(quantity*percentage,8);
                setActionQuantity(temp);
                setActionQuantity_str(temp.toString());
                setActionQuantity_crypto(temp);
            }
        }
    }

    const alert_noAmount = () => {
        const message = `Please type your ${(action === "Buy") ? ("buying"):("selling")} quantity`;
        Alert.alert(
            "Information",
            message,
            [
              {text: "OK"}
            ]
        );
        inputRef.current.focus();
    }

    const determineDecimals = (i) => {
        if(i<=1){
            if(i<=0.001){return 7;}
            else{return 4;}
        }else{return 2;}
    }

    const min_threshold = (i) => {
        return i<0.000001 ? 0:i;
    }

    const min_threshold_sell = (i) => {
        return i<0.00000001 ? 0:i;
    }

    const dynamicRound = (i,j) => {
        return (Math.round(i * Math.pow(10,j)) / Math.pow(10,j));
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

    function lengthOfDecimal(i){
        if(typeof i !== "number" && typeof i !== "string" ){
            console.log("type error")
            return 0;
        }
        let asStr = i.toString();
        if(char_count(asStr,".")<1 || asStr[asStr.length-1]==="."){
            return 0;
        }else{
            let j = i.toString();
            let k = j.split(".");
            let decimalpart = k[1].toString();
            return decimalpart.length;
        }
    }

    function char_count(str, letter) {
        var letter_Count = 0;
        for (var position = 0; position < str.length; position++) 
        {
            if (str.charAt(position) == letter) 
            {
            letter_Count += 1;
            }
        }
        return letter_Count;
    }

    const renderPlaceHolder = () => {
        if(unitmode==="Fiat"){
            return "amount ($)";
        }else{
            return "amount ("+coinsymbol+")";
        }
    }

    const simplifyDate = (i) => {
        let j = i.toString();
        let k = j.split(" ");
        let l = k.slice(1, 5);
        l[3] = l[3].substring(0,5);
        return l.join(' ');
    }

    const triggerTrade = () => {
        if(action==="Buy"){
            let newquantity = dynamicRound(quantity + actionQuantity_crypto,8);
            ref.get().then((doc)=>{
                let seed_serverSide = doc.data().seed;
                if(actionQuantity_fiat<= seed_serverSide){
                    ref
                        .collection("wallet")
                        .doc(coinname).update({quantity: newquantity,}).then(()=>{
                            updateSeed(-actionQuantity_fiat);
                            slideHandler(0);
                            setquantity(newquantity);
                            slideHandler(0);
                            ref
                            .collection("history")
                            .add({
                                type: "Bought",
                                target: coinsymbol,
                                targetName: coinname,
                                quantity: actionQuantity_crypto,
                                fiat: actionQuantity_fiat,
                                price: buyPrice(),
                                imgsrc: coinIcon,
                                orderNum: Number(new Date().getTime()).toString().substring(0, 10),
                                time: simplifyDate(new Date()),
                                commissionRate: commission_percentage
                            })
                            .then(()=>{
                                console.log("successfully updated coin quantity of : ", coinname, " (",newquantity,")");
                                requestReview();
                            })
                            .catch((err)=>{
                                console.log("An error occurred while recording history:", err);
                                slideHandler(0);
                                return;
                            })
                        })
                        .catch((err)=>{
                            console.log("Error:", err);
                            slideHandler(0);
                            return;
                        })
                }else{
                    console.log("Fraud detected ! - serverside seed is ", seed_serverSide, "but input seed was",actionQuantity_fiat);
                    slideHandler(0);
                }
            })
            .catch((err)=>{
                console.log("Error:", err);
                slideHandler(0);
                return;
            })
        }else{
            let newquantity = dynamicRound(quantity - actionQuantity_crypto,8);
            ref
                .collection("wallet")
                .doc(coinname).get().then((doc)=>{
                    if(doc.exists){
                        let quantity_serverSide = doc.data().quantity;
                        if(actionQuantity_crypto<=quantity_serverSide){
                            ref
                                .collection("wallet")
                                .doc(coinname).update({quantity: newquantity,}).then(()=>{
                                    updateSeed(+actionQuantity_fiat);
                                    slideHandler(0);
                                    setquantity(newquantity);
                                    ref
                                    .collection("history")
                                    .add({
                                        type: "Sold",
                                        target: coinsymbol,
                                        targetName: coinname,
                                        quantity: actionQuantity_crypto,
                                        fiat: actionQuantity_fiat,
                                        price: sellPrice(),
                                        imgsrc: coinIcon,
                                        orderNum: Number(new Date().getTime()).toString().substring(0, 10),
                                        time: simplifyDate(new Date()),
                                        commissionRate: commission_percentage
                                    })
                                    .then(()=>{
                                        console.log("successfully updated coin quantity of : ", coinname, " (",newquantity,")");
                                        requestReview();
                                    })
                                    .catch((err)=>{
                                        console.log("An error occurred while recording history:", err);
                                        slideHandler(0);
                                        return;
                                    })
                                })
                                .catch((err)=>{
                                    console.log("Error:", err);
                                    slideHandler(0);
                                    return;
                                })
                        }else{
                            console.log("Fraud detected ! - serverside total quantity is ", quantity_serverSide, "but input seed was",actionQuantity_crypto);
                            slideHandler(0);
                        }
                    }else{
                        console.log("error - the user does not have any", coinname," to sell.");
                        slideHandler(0);
                        return;
                    }
                })
                .catch((err)=>{
                    console.log("Error:", err);
                    slideHandler(0);
                    return;
                })
        }
    }

    const updateSeed = async (i) => {
        let newSeed = dynamicRound(seed + i,2);
        return ref.update({seed:newSeed}).then(()=>{console.log("successfully updated seed quantity as : ", newSeed);})   
    }

    return (
        <View style={{alignItems:"center",marginTop:10}}>
            <View style={{flexDirection:"row",justifyContent:"space-between",borderWidth:2,borderRadius:10,borderColor:containerRadiusColor(),backgroundColor:containerColor(), width:width, height:50,padding:5,marginBottom:10}}>
                <View style={{flexDirection:"row", width:((width/2)-15), alignItems:"center"}}>
                    <View style={{position:"absolute",width:38,height:38,borderRadius:8,backgroundColor:"white"}} />
                    <Image source={{uri:coinIcon}} style={{width:32,height:32,marginLeft:3}}/>
                    <Text style={{fontSize:15,fontWeight:"bold",color:textColor(),marginLeft:10}}>My {coinsymbol} wallet</Text>
                </View>
                <View style={{flexDirection:"column", width:((width/2)-15)}}>
                    <Text style={{fontSize:15,fontWeight:"bold",color:textColor(),marginRight:5,textAlign:"right"}}>${numberWithCommas(dynamicRound(quantity*coinprice,2))}</Text>
                    <Text style={{fontSize:15,fontWeight:"bold",color:subTextColor(),marginRight:5,textAlign:"right"}}>{quantity} {coinsymbol}</Text>
                </View>
            </View>
            <View style={{flexDirection:"row",justifyContent:"space-between",borderWidth:2,borderRadius:10,borderColor:containerRadiusColor(),backgroundColor:containerColor(), width:width, height:50,padding:5,marginBottom:6}}>
                <View style={{flexDirection:"row", width:((width/2)-15), alignItems:"center"}}>
                    <View style={{position:"absolute",width:38,height:38,borderRadius:8,backgroundColor:"white"}} />
                    <Image source={require('../assets/icons/1x/usd_custom.png')} style={{width:32,height:32,marginLeft:3}}/>
                    <Text style={{fontSize:15,fontWeight:"bold",color:textColor(),marginLeft:10}}>My virtual USD wallet</Text>
                </View>
                <View style={{flexDirection:"column", width:((width/2)-15)}}>
                    <Text style={{fontSize:15,fontWeight:"bold",color:textColor(),marginRight:5,textAlign:"right"}}>${numberWithCommas(seed)}</Text>
                    <Text style={{fontSize:15,fontWeight:"bold",color:subTextColor(),marginRight:5,textAlign:"right"}}>= {dynamicRound((seed/coinprice),2)} {coinsymbol}</Text>
                </View>
            </View>
            {<AdMobRewardedComponent user={user} width={width}/>}
            <View style={{flexDirection:"row",justifyContent:"space-between",backgroundColor:containerColor_secondary(),borderRadius:5,width:width,marginBottom:5,height:35}}>
                {actionListTab.map((e) => (
                <TouchableOpacity key={e.action} style={[styles.action_tab, (action===e.action&&e.action==="Sell")&&{backgroundColor:sellColor()}, (action===e.action&&e.action==="Buy")&&{backgroundColor:buyColor()}]} onPress={()=>setActionFilter(e.action)}>
                    <Text style={{color:"white",fontWeight:"bold",fontSize:15,textAlign:"center"}}>{e.action}</Text>
                </TouchableOpacity>))}
            </View>
            <TouchableOpacity onPress={()=>regardingCommissionFees()}>
                <View style={{backgroundColor:containerColor_secondary(),borderRadius:5,width:width,marginBottom:5,justifyContent:"center",height:35}}>
                    {(action==="Buy") ? (
                        <Text style={{color:"white",fontWeight:"bold",fontSize:15,textAlign:"center"}}>$ {numberWithCommas(dynamicRound(buyPrice(),determineDecimals(buyPrice())))}</Text>
                        ):(
                        <Text style={{color:"white",fontWeight:"bold",fontSize:15,textAlign:"center"}}>$ {numberWithCommas(dynamicRound(sellPrice(),determineDecimals(sellPrice())))}</Text>
                    )}
                    <Text style={{color:"#F2F2F2",fontWeight:"bold",fontSize:12,position:"absolute",alignSelf:"flex-end"}}>commission: {commission_percentage}%  </Text>
                    {(action==="Buy") ? (
                        <Text style={{color:"#F2F2F2",fontWeight:"bold",fontSize:12,position:"absolute",alignSelf:"flex-start"}}>  purchase price</Text>
                        ):(
                        <Text style={{color:"#F2F2F2",fontWeight:"bold",fontSize:12,position:"absolute",alignSelf:"flex-start"}}>  selling price</Text>
                    )}
                </View>
            </TouchableOpacity>
            <View style={{flexDirection:"row",justifyContent:"space-between",backgroundColor:containerColor_secondary(),borderRadius:5,width:width,height:35}}>
                <TouchableOpacity key={"Fiat"} style={[styles.unit_tab, unitmode==="Fiat"&&{backgroundColor:unitContainerColor()}]} onPress={()=>setUnitFilter("Fiat")}>
                    <Text style={[styles.unit_text, unitmode==="Fiat"&&{color:unitTextColor()}]}>Fiat</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.unit_tab, unitmode===coinsymbol&&{backgroundColor:unitContainerColor()}]} onPress={()=>setUnitFilter(coinsymbol)}>
                    <Text style={[styles.unit_text, unitmode===coinsymbol&&{color:unitTextColor()}]}>{coinsymbol}</Text>
                </TouchableOpacity>
            </View>
            <View style={{width:width,justifyContent:"center",alignItems:"center",height:35,marginTop:5,marginBottom:5}}>
                <TextInput
                    ref={inputRef}
                    style={{paddingHorizontal: 10,backgroundColor: containerColor_secondary(),color:actionColor,width:width,height:35,borderRadius: 5,fontSize:18,fontWeight:"bold",textAlign:"center"}}
                    //color="#ffffff"
                    label="actionQuantity"
                    value={actionQuantity_str}
                    onChangeText={value => amountHandler(value)}
                    placeholder={renderPlaceHolder()}
                    placeholderTextColor="#CCCCCC"
                    keyboardType="numeric"
                />
                <Text style={{color:actionColor,fontWeight:"bold",fontSize:14,position:"absolute",alignSelf:"flex-start"}}>  {dynamicRound(percentage*100,2)}%</Text>
                {(unitmode==="Fiat") ? (
                    <Text style={{color:actionColor,fontWeight:"bold",fontSize:14,position:"absolute",alignSelf:"flex-end"}}>$  </Text>
                ):(
                    <Text style={{color:actionColor,fontWeight:"bold",fontSize:14,position:"absolute",alignSelf:"flex-end"}}>{coinsymbol}  </Text>
                )}
            </View>

            <View style={{width:width*0.7,justifyContent: "center"}}>
                <Slider
                    value={percentage}
                    onValueChange={value => slideHandler(value)}
                    step={0.05}
                    thumbTintColor="white"
                    minimumTrackTintColor={actionColor}
                    trackStyle={{height:15,borderRadius:5}}
                    thumbStyle={{width: 30, height: 30}}
                />
            </View>
            {(action==="Sell") ? (
            <View>
                <View style={{marginBottom: 15,marginTop: 5,width:width,height:50,textAlign:"center"}}>
                    <Button disabled={(actionQuantity_crypto<=0)} buttonStyle={{backgroundColor:sellColor(),borderRadius:5}} titleStyle={{color: "#ffffff", fontSize: 16, fontWeight:"bold"}} title={"Sell "+actionQuantity_crypto+" "+coinsymbol} onPress={triggerTrade}>
                    </Button>
                </View>
                {(unitmode!=="Fiat") && <Text style={{color:textColor(),alignSelf:"center"}}>Expected return : $ {actionQuantity_fiat}</Text>}
            </View>
            ):(
            <View>
                <View style={{marginBottom: 15,marginTop: 5,width:width,height:50}}>
                    <Button disabled={(actionQuantity_crypto<=0)} buttonStyle={{backgroundColor:buyColor(),borderRadius:5}} titleStyle={{color: "#ffffff", fontSize: 16, fontWeight:"bold"}} title={"Buy "+actionQuantity_crypto+" "+coinsymbol}  onPress={triggerTrade}>
                    </Button>
                </View>
                {(unitmode!=="Fiat") && <Text style={{color:textColor(),alignSelf:"center"}}>Expected cost : $ {actionQuantity_fiat}</Text>}
            </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    action_tab:{
        borderRadius:5,paddingHorizontal:8,width:(Dimensions.get("window").width-20)/2,height:35,justifyContent:"center"
    },
    unit_tab:{
        borderRadius:5,paddingHorizontal:8,width:(Dimensions.get("window").width-20)/2,height:35,justifyContent:"center"
    },
    unit_text:{
        color:"white",fontWeight:"bold",fontSize:15,textAlign:"center"
    }
  });

export default Trader