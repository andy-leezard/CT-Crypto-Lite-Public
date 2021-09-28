import React, { useEffect, useState, useContext, useMemo } from 'react'
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions, TextInput, Alert, Platform } from 'react-native'
import { db } from '../../firebase';
import { Button } from 'react-native-elements';
import Slider from "@react-native-community/slider";
import AdMobRewardedComponent from './AdMobRewardedComponent';
import * as StoreReview from 'expo-store-review';
import stablecoins from '../stablecoins.json';
import i18n from 'i18n-js';
import { GlobalContext, MainContext } from '../StateManager';
import { numberWithCommas, dynamicRound, determineDecimals, lengthOfDecimal, char_count, avoidScientificNotation_andRound } from '../lib/FuncLib';
import { min_threshold, min_threshold_sell } from '../lib/JSFuncLib';
import * as StyleLib from '../lib/StyleLib';
import { GlobalContextInterfaceAsReducer, MainContextInterface } from '../lib/Types';
import { DocumentSnapshot } from '@firebase/firestore-types'

const width = ((Platform.OS === 'android') ? Dimensions.get("window").width*0.95:Dimensions.get("window").width)-20;

enum actions {
	BUY= "Buy",
	SELL= "Sell",
};

enum history_action {
    BOUGHT = "Bought",
    SOLD = "Sod",
}

const actionListTab = [
    actions.BUY,
    actions.SELL
];

const actionColors = {
    BUY:{
        DARK: "#42B95D",
        LIGHT: "#36eb5f",
    },
    SELL:{
        DARK: "#FF5A4A",
        LIGHT: "#ff6161",
    }
}

interface Props{
    coinname:string
    coinprice:number
    coinsymbol:string
    coinIcon:string
}

const Trader:React.FC<Props> = ({coinname,coinprice,coinsymbol,coinIcon}) => {
    const globalContext = useContext<GlobalContextInterfaceAsReducer>(GlobalContext);

    const unitmodes = useMemo(() => {
        return {FIAT: "Fiat",CRYPTO: coinsymbol}
    }, [coinsymbol])
    const ref = useMemo(() => {
        return db.collection('users').doc(globalContext.state.auth.userEmail!)
    }, [globalContext])

    const mainContext = useContext<MainContextInterface>(MainContext);
    const [quantity, setquantity] = useState<number>(0);
    const [action, setAction] = useState<string>(actions.BUY);
    const [actionColor, setActionColor] = useState<string>(actionColors.BUY.LIGHT);
    const [unitmode, setUnitmode] = useState<string>(unitmodes.FIAT);
    const [percentage, setPercentage] = useState<number>(0);
    const [actionQuantity,setActionQuantity] = useState<number>(0);
    const [actionQuantity_crypto, setActionQuantity_crypto] = useState<number>(0);
    const [actionQuantity_fiat, setActionQuantity_fiat] = useState<number>(0);
    const [actionQuantity_str,setActionQuantity_str] = useState<string>("");
    const [limit, setLimit] = useState<number>(0);
    const [commission_percentage, setCommission_Percentage] = useState<number>(1);
    //const inputRef =  useRef();
    const inputRef = React.createRef<TextInput>();
    const [processing, setProcessing] = useState<boolean>(false);
    const [appreciation, setAppreciation] = useState<number>(0);
    const [buyPrice, setBuyPrice] = useState<number>(coinprice*(1+(commission_percentage/100)));
    const [sellPrice, setSellPrice] = useState<number>(coinprice*(1-(commission_percentage/100)));

    const stableCoinAlert = () =>{
        const message = coinname + ` ${i18n.t('warn_stable_pre')}\n${i18n.t('warn_stable_suf')}`;
        Alert.alert(
            i18n.t('information'),
            message,
            [{text: i18n.t('ok')}]
        );
    }
    
    useEffect(() => {
        globalContext.state.env.darkmode ? setActionColor(actionColors.BUY.DARK):setActionColor(actionColors.BUY.LIGHT);
        db.collection('globalEnv').doc("commission").get().then((doc:DocumentSnapshot)=> {
            if(doc.exists){
                mainContext.vip ? setCommission_Percentage(doc.data()!.as_percentage_pro):setCommission_Percentage(doc.data()!.as_percentage_default);
            }else{
                console.log("Warning - globalEnv collection not found in db !");
            }
        }).catch((err)=>{console.log(err)});
        /*const unsubscribe = ref.onSnapshot((doc:DocumentSnapshot)=>{
                let _seed = doc.data()!.seed;
                setSeed(_seed);
        })
        return unsubscribe;*/
    },[]);

    useEffect(() => {
        const _ref = ref.collection('wallet').doc(coinname);
        const unsubscribe = _ref.onSnapshot((doc:DocumentSnapshot)=>{
            if(doc.exists){
                const data = doc.data()!
                let _quantity = data.quantity;
                let _appre = data.appre ?? 0;
                setquantity(_quantity);
                setAppreciation(_appre);
                if(unitmode===unitmodes.FIAT){setLimit(mainContext.seed);}else{setLimit(_quantity);}
                console.log("Document data:", _quantity);
            }else{// doc.data() will be undefined in this case
                stablecoins.some(item => item.name === coinname) && stableCoinAlert();
                ref.collection("wallet").doc(coinname).set({quantity: 0,symbol: coinsymbol,avg_price: 0,appre:0})
                    .then(()=>{console.log("successfully created a new wallet ref :", coinname)})
            }
        })
        return unsubscribe;
    },[mainContext]);

    useEffect(() => {
        setBuyPrice(coinprice*(1+(commission_percentage/100)));
        setSellPrice(coinprice*(1-(commission_percentage/100)));
    }, [commission_percentage,coinprice])

    const requestReview = async() => {
        let _1 = await StoreReview.isAvailableAsync();
        let _2 = await StoreReview.hasAction();
        let _3 = StoreReview.storeUrl() ?? "";
        let _4 = Math.random();
        let proba = 0.25;
        if(_1 && _2 && _3 !=="" && _4 < proba){
            console.log("requesting a review");
            await StoreReview.requestReview();
        }else{
            (_4<proba) ? console.log("cannot ask for a review") : console.log("not requesting a review this time.");
        }
    }

    const regardingCommissionFees = () => {
        mainContext.vip ? Alert.alert(
            i18n.t('settings_vip'),i18n.t('notif_alrdy_vip'),
        [{ text: i18n.t('cool')}]
        ):Alert.alert(
            i18n.t('notification'),i18n.t('notif_notyet_vip'),
        [{ text: i18n.t('ok')}]
        )
    }

    const updateLimit = (s:number,q:number,a:string,u:string) => {
        //seed, quantity, action, unitmode
        if(a===actions.BUY){
            if(u===unitmodes.FIAT){
                setLimit(s);
                console.log("limit set to :",s);
            }else{
                if(buyPrice<=0){
                    setLimit(0);
                }else{
                    let temp = dynamicRound(s/buyPrice,8);
                    setLimit(temp);
                    console.log("limit set to :",temp,coinsymbol); 
                }
            }
        }else{
            if(u===unitmodes.FIAT){
                let temp = dynamicRound(q*sellPrice,2);
                setLimit(temp);
                console.log("limit set to :",temp);
            }else{
                setLimit(q);
                console.log("limit set to :",q,coinsymbol);
            }
        }
    }

    const amount_decimalHandler = (i:string) => {//typeof i = "str"
        let cut = i.substring(0,i.length-1)
        let replaced = cut.replaceAt(cut.length-1,i[i.length-1]);
        let asNum = Number(replaced);
        setActionQuantity_str(replaced);
        trigger_handleAmount(asNum);
    }

    const amountHandler = (i:string) => {//typeof i = "str"
        if(processing){
            return;
        }
        if(unitmode===unitmodes.FIAT){
            if(lengthOfDecimal(i)>2){
                if(lengthOfDecimal(i)>3){
                    amount_decimalHandler(dynamicRound(Number(i),3).toString());
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
                    amount_decimalHandler(dynamicRound(Number(i),9).toString());
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

    const trigger_handleAmount = (param:number) => {
        let asPercentage = (param/limit);
        asPercentage = dynamicRound(asPercentage,3);
        setPercentage(asPercentage);
        setActionQuantity(param);
        if(unitmode===unitmodes.FIAT){
            setActionQuantity_fiat(param);
            if(action===actions.BUY){
                setActionQuantity_crypto(min_threshold(dynamicRound(param/buyPrice,8)));
            }else{
                setActionQuantity_crypto(min_threshold(dynamicRound(param/sellPrice,8)));
            }
        }else{
            if(action===actions.BUY){
                setActionQuantity_fiat(buyPrice*param);
                if(buyPrice*param<0.01){
                    setActionQuantity_crypto(0);
                }else{
                    setActionQuantity_crypto(min_threshold_sell(param));
                }
            }else{
                setActionQuantity_fiat(sellPrice*param);
                if(sellPrice*param<0.01){
                    setActionQuantity_crypto(0);
                }else{
                    setActionQuantity_crypto(min_threshold_sell(param));
                }
            }
        }
    }

    const slideHandler_justCrypto = (i:number) => {
        if(i===0){
            setActionQuantity_crypto(0);
            return;
        }
        if(action===actions.BUY){
            let tempseed = dynamicRound(mainContext.seed*i,2);
            if(buyPrice<=0){//security
                setActionQuantity_crypto(0);
                return;
            }
            let tempcrypto = dynamicRound((tempseed/buyPrice),8);
            setActionQuantity_crypto(tempcrypto);
        }else{
            let tempquantity = dynamicRound(quantity*i,8);
            setActionQuantity_crypto(tempquantity);
        }
    }

    const slideHandler_justFiat = (i:number) => {
        if(i===0){
            setActionQuantity_fiat(0);
            return;
        }
        if(action===actions.BUY){
            if(buyPrice<=0){//security
                setActionQuantity_fiat(0);
                return;
            }
            let tempfiat = dynamicRound(mainContext.seed*i,2);
            setActionQuantity_fiat(tempfiat);
        }else{
            let tempquantity = dynamicRound(quantity*i,8);
            let tempfiat = dynamicRound(tempquantity*sellPrice,2);
            setActionQuantity_fiat(tempfiat);
        }
    }

    const slideHandler = (param:number) => {
        if(processing){
            return;
        }
        setPercentage(param);
        if(param===0){
            setActionQuantity_str("");setActionQuantity(0);setActionQuantity_crypto(0);setActionQuantity_fiat(0);
            return;
        }
        if(action===actions.BUY){
            if(buyPrice<=0){
                setActionQuantity(0);setActionQuantity_str("");setActionQuantity_crypto(0);setActionQuantity_fiat(0);
                return;
            }
            let tempfiat = dynamicRound(mainContext.seed*param,2);
            setActionQuantity_fiat(tempfiat);
            let tempcrypto = dynamicRound((tempfiat/buyPrice),8);
            setActionQuantity_crypto(tempcrypto);
            if(unitmode===unitmodes.FIAT){
                setActionQuantity(tempfiat);
                setActionQuantity_str(tempfiat.toString());
            }else{
                setActionQuantity(tempcrypto);
                setActionQuantity_str(tempcrypto.toString());
            }
        }else{
            let tempquantity = dynamicRound(quantity*param,8);
            setActionQuantity_crypto(tempquantity);
            let tempfiat = dynamicRound(tempquantity*sellPrice,2);
            setActionQuantity_fiat(tempfiat);
            if(unitmode===unitmodes.FIAT){
                setActionQuantity(tempfiat);
                setActionQuantity_str(tempfiat.toString());
            }else{
                setActionQuantity(tempquantity);
                setActionQuantity_str(tempquantity.toString());
            }
        }
    }

    const setActionFilter = (i:string) => {
        if(processing){
            return;
        }
        if(action === i){
            if(actionQuantity>0){
                triggerTrade();return;
            }else{
                alert_noAmount();return;
            }
        }
        if(i===actions.BUY){globalContext.state.env.darkmode ? setActionColor(actionColors.BUY.DARK):setActionColor(actionColors.BUY.LIGHT);}//Previously #35934A
        else{globalContext.state.env.darkmode ? setActionColor(actionColors.SELL.DARK):setActionColor(actionColors.SELL.LIGHT);}
        setAction(i);setPercentage(0);setActionQuantity(0);setActionQuantity_str("");
        setActionQuantity_fiat(0);setActionQuantity_crypto(0);
        updateLimit(mainContext.seed,quantity,i,unitmode);
    }

    const setUnitFilter = (i:string) => {
        if(processing){
            return;
        }
        if(i===unitmode){
            if(actionQuantity>0){
                triggerTrade();return;
            }else{
                alert_noAmount();return;
            }
        }
        setUnitmode(i);
        if(actionQuantity_str === ""){return;}
        if(action===actions.BUY){
            if(i===unitmodes.FIAT){
                setLimit(mainContext.seed);
                let temp = dynamicRound(mainContext.seed *percentage,2);
                setActionQuantity(temp);
                setActionQuantity_fiat(temp);
                setActionQuantity_str(temp.toString());
            }else{
                if(buyPrice<=0){
                    setLimit(0);
                    setActionQuantity(0);
                    setActionQuantity_str("");
                    setActionQuantity_crypto(0);
                    setActionQuantity_fiat(0);
                }else{
                    let temp = dynamicRound(mainContext.seed/buyPrice,8);
                    setLimit(temp);
                    let temp2 = dynamicRound(temp*percentage,8);
                    setActionQuantity(temp2);
                    setActionQuantity_str(temp2.toString());
                    setActionQuantity_crypto(temp2);
                }
            }
        }else{
            if(i===unitmodes.FIAT){
                let temp = dynamicRound(quantity*sellPrice,2);
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
        const message = (action === actions.BUY) ? i18n.t('type_buy_q'):i18n.t('type_sell_q')
        Alert.alert(
            i18n.t('information'),
            message,
            [
              {text: i18n.t('ok')}
            ]
        );
        inputRef.current!.focus();
    }

    const renderPlaceHolder = () => {
        if(action===actions.BUY){
            return (unitmode===unitmodes.FIAT) ? `${i18n.t('amount_p')} ($)`:`${i18n.t('amount_p')} (${coinsymbol})`;
        }else{
            return (unitmode===unitmodes.FIAT) ? `${i18n.t('amount_s')} ($)`:`${i18n.t('amount_s')} (${coinsymbol})`;
        }
    }

    const triggerTrade = () => {
        (action===actions.BUY) ? trigger_buy():trigger_sell();
    }

    const trigger_buy = async() =>{
        const serverSide = await ref.get();
        if(actionQuantity_fiat<=serverSide.data()!.seed){
            setProcessing(true);
            promise_buy();
        }else{
            console.log("fraud detected - return");
            slideHandler(0);
        }
    }

    const trigger_sell = async() =>{
        const serverSide = await ref.collection("wallet").doc(coinname).get();
        let _serverSide = serverSide.data()!.quantity ?? 0;
        if(actionQuantity_crypto<=_serverSide){
            setProcessing(true);
            promise_sell();
        }else{
            console.log("fraud detected - return");
            slideHandler(0);
        }
    }

    const promise_buy = () => {
        let nq = dynamicRound(quantity + actionQuantity_crypto,8);
        let new_appre = (appreciation===0) ? nq*buyPrice:appreciation + (actionQuantity_crypto * buyPrice);
        let avg_price = (appreciation===0) ? buyPrice:(new_appre)/nq;
        new_appre = dynamicRound(new_appre,determineDecimals(buyPrice));
        avg_price = dynamicRound(avg_price,determineDecimals(buyPrice));
        Promise.all([addHistory(history_action.BOUGHT),updateQuantity_buy(nq,new_appre,avg_price),_updateSeed(-actionQuantity_fiat)])
        .then(()=>{
            console.log("All promises successful !");
            requestReview();
        })
        .catch(console.log)
        .finally(()=>{
            slideHandler(0);
            setProcessing(false);
        })
    }

    const promise_sell = () => {
        let nq = dynamicRound(quantity - actionQuantity_crypto,8);
        Promise.all([addHistory("Sold"),updateQuantity_sell(nq,nq*buyPrice),_updateSeed(actionQuantity_fiat)])
        .then(()=>{
            console.log("All promises successful !");
            requestReview();
        })
        .catch(console.log)
        .finally(()=>{
            slideHandler(0);
            setProcessing(false);
        })
    }

    const _updateSeed = (modifier:number) => {
        return new Promise((resolve,reject)=>{
            let newSeed = dynamicRound(mainContext.seed + modifier,2);
            ref.update({seed:newSeed})
            .then(()=>{
                console.log("successfully updated seed quantity as : ", newSeed);
                resolve("_updateSeed - success");
            })
            .catch(reject)
        })
    }

    const updateQuantity_buy = (newquantity:number,newappre:number,avg_price:number) => { // should update the average price
        return new Promise((resolve,reject)=>{
            ref
            .collection("wallet")
            .doc(coinname).update({quantity: newquantity,appre: newappre,avg_price:avg_price}).then(()=>{
                setquantity(newquantity);
                resolve("sell_updateQuantity - success");
            })
            .catch(reject)
        })
    }

    const updateQuantity_sell = (newquantity:number,newappre:number) => { // don't need to update the average price
        return new Promise((resolve,reject)=>{
            ref
            .collection("wallet")
            .doc(coinname).update({quantity: newquantity,appre: newappre}).then(()=>{
                setquantity(newquantity);
                resolve("sell_updateQuantity - success");
            })
            .catch(reject)
        })
    }

    const addHistory = (type:string) => {
        return new Promise((resolve,reject)=>{
            const time = new Date();
            ref
            .collection("history")
            .add({
                type: type,
                target: coinsymbol,
                targetName: coinname,
                quantity: actionQuantity_crypto,
                fiat: actionQuantity_fiat,
                price: (type == history_action.BOUGHT) ? buyPrice:sellPrice,
                imgsrc: coinIcon,
                orderNum: time.getTime(),
                commissionRate: commission_percentage
            })
            .then(()=>{
                resolve("sell_addHistory - success");
            })
            .catch(reject)
        })
    }

    const buttonHandler = (dir:boolean) => {
        /**
         * @param {boolean} dir = up or down ? (true : false)
         */
        dir ? increase():decrease();
    }

    const increase = () => {
        (percentage<0.9) ? slideHandler(percentage+0.1):slideHandler(1);
    }

    const decrease = () => {
        (percentage>0.1) ? slideHandler(percentage-0.1):slideHandler(0);
    }
    
    const _parseAction = (i:string) => {
        return (i === actions.BUY) ? i18n.t('buy') : i18n.t('sell');
    }

    return (
        <View style={{alignItems:"center",marginTop:10}}>
            <View style={{flexDirection:"row",justifyContent:"space-between",borderWidth:2,borderRadius:10,borderColor:StyleLib.containerRadiusColor_bis(globalContext.state.env.darkmode!),backgroundColor:StyleLib.containerColor_bis(globalContext.state.env.darkmode!), width:width, minHeight:50,padding:5,marginBottom:10}}>
                <View style={{flexDirection:"row", width:((width/2)-15), alignItems:"center"}}>
                    <View style={{position:"absolute",width:38,height:38,borderRadius:8,backgroundColor:"white"}} />
                    <Image source={{uri:coinIcon}} style={{width:32,height:32,marginLeft:3}}/>
                    <Text style={{fontSize:15,fontWeight:"bold",color:StyleLib.textColor(globalContext.state.env.darkmode!),marginLeft:10}}>{i18n.t('my_wallet_pre')} {coinsymbol} {i18n.t('my_wallet_suf')}</Text>
                </View>
                <View style={{flexDirection:"column", width:((width/2)-15)}}>
                    <Text style={{fontSize:15,fontWeight:"bold",color:StyleLib.textColor(globalContext.state.env.darkmode!),marginRight:5,textAlign:"right"}}>${numberWithCommas(dynamicRound(quantity*coinprice,2))}</Text>
                    <Text style={{fontSize:15,fontWeight:"bold",color:StyleLib.subTextColor_ter(globalContext.state.env.darkmode!),marginRight:5,textAlign:"right"}}>{quantity} {coinsymbol}</Text>
                </View>
            </View>
            <View style={{flexDirection:"row",justifyContent:"space-between",borderWidth:2,borderRadius:10,borderColor:StyleLib.containerRadiusColor_bis(globalContext.state.env.darkmode!),backgroundColor:StyleLib.containerColor_bis(globalContext.state.env.darkmode!), width:width, minHeight:50,padding:5,marginBottom:6}}>
                <View style={{flexDirection:"row", width:((width/2)-15), alignItems:"center"}}>
                    <View style={{position:"absolute",width:38,height:38,borderRadius:8,backgroundColor:"white"}} />
                    <Image source={require('../assets/icons/1x/usd_custom.png')} style={{width:32,height:32,marginLeft:3}}/>
                    <Text style={{fontSize:15,fontWeight:"bold",color:StyleLib.textColor(globalContext.state.env.darkmode!),marginLeft:10}}>{i18n.t('my_wallet_pre')} VUSD {i18n.t('my_wallet_suf')}</Text>
                </View>
                <View style={{flexDirection:"column", width:((width/2)-15)}}>
                    <Text style={{fontSize:15,fontWeight:"bold",color:StyleLib.textColor(globalContext.state.env.darkmode!),marginRight:5,textAlign:"right"}}>${numberWithCommas(mainContext.seed)}</Text>
                    <Text style={{fontSize:15,fontWeight:"bold",color:StyleLib.subTextColor_ter(globalContext.state.env.darkmode!),marginRight:5,textAlign:"right"}}>= {dynamicRound((mainContext.seed/coinprice),2)} {coinsymbol}</Text>
                </View>
            </View>
            {<AdMobRewardedComponent user={globalContext.state.auth.userEmail} width={width} show_text={true}/>}
            <View style={{flexDirection:"row",justifyContent:"space-between",backgroundColor:StyleLib.containerColor_quinquies(globalContext.state.env.darkmode!),borderRadius:5,width:width,marginBottom:5,height:35}}>
                {actionListTab.map((e,index) => (
                <TouchableOpacity key={index} style={[styles.action_tab, (action===e&&e===actions.SELL)&&{backgroundColor:StyleLib.sellColor(globalContext.state.env.darkmode!)}, (action===e&&e===actions.BUY)&&{backgroundColor:StyleLib.buyColor(globalContext.state.env.darkmode!)}]} onPress={()=>setActionFilter(e)}>
                    <Text style={{color:"white",fontWeight:"bold",fontSize:15,textAlign:"center"}}>{_parseAction(e)}</Text>
                </TouchableOpacity>))}
            </View>
            <TouchableOpacity onPress={()=>regardingCommissionFees()}>
                <View style={{backgroundColor:StyleLib.containerColor_quinquies(globalContext.state.env.darkmode!),borderRadius:5,width:width,marginBottom:5,justifyContent:"center",height:35}}>
                    {(action===actions.BUY) ? (
                        <Text style={{color:"#F2F2F2",fontWeight:"bold",fontSize:12,position:"absolute",alignSelf:"flex-start"}}>  {i18n.t("purchase_price")}</Text>
                        ):(
                        <Text style={{color:"#F2F2F2",fontWeight:"bold",fontSize:12,position:"absolute",alignSelf:"flex-start"}}>  {i18n.t("selling_price")}</Text>
                    )}
                    {(action===actions.BUY) ? (
                        <Text style={{color:"white",fontWeight:"bold",fontSize:15,textAlign:"center"}}>$ {avoidScientificNotation_andRound(buyPrice)}</Text>
                        ):(
                        <Text style={{color:"white",fontWeight:"bold",fontSize:15,textAlign:"center"}}>$ {avoidScientificNotation_andRound(sellPrice)}</Text>
                    )}
                    <Text style={{color:"#F2F2F2",fontWeight:"bold",fontSize:12,position:"absolute",alignSelf:"flex-end"}}>{i18n.t("commission")}: {commission_percentage}%  </Text>
                </View>
            </TouchableOpacity>
            <View style={{flexDirection:"row",justifyContent:"space-between",backgroundColor:StyleLib.containerColor_quinquies(globalContext.state.env.darkmode!),borderRadius:5,width:width,height:35}}>
                <TouchableOpacity style={[styles.unit_tab, unitmode===unitmodes.FIAT&&{backgroundColor:StyleLib.unitContainerColor(globalContext.state.env.darkmode!)}]} onPress={()=>setUnitFilter(unitmodes.FIAT)}>
                    <Text style={[styles.unit_text, unitmode===unitmodes.FIAT&&{color:StyleLib.unitTextColor(globalContext.state.env.darkmode!)}]}>{i18n.t("fiat")}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.unit_tab, unitmode===coinsymbol&&{backgroundColor:StyleLib.unitContainerColor(globalContext.state.env.darkmode!)}]} onPress={()=>setUnitFilter(coinsymbol)}>
                    <Text style={[styles.unit_text, unitmode===coinsymbol&&{color:StyleLib.unitTextColor(globalContext.state.env.darkmode!)}]}>{coinsymbol}</Text>
                </TouchableOpacity>
            </View>
            <View style={{width:width,justifyContent:"center",alignItems:"center",height:35,marginTop:5,marginBottom:5}}>
                <TextInput
                    ref={inputRef}
                    style={{paddingHorizontal: 10,backgroundColor: StyleLib.containerColor_quinquies(globalContext.state.env.darkmode!),color:actionColor,width:width,height:35,borderRadius: 5,fontSize:18,fontWeight:"bold",textAlign:"center"}}
                    value={actionQuantity_str}
                    onChangeText={value => amountHandler(value)}
                    placeholder={renderPlaceHolder()}
                    placeholderTextColor="#CCCCCC"
                    keyboardType="numeric"
                />
                <Text style={{color:actionColor,fontWeight:"bold",fontSize:14,position:"absolute",alignSelf:"flex-start"}}>  {dynamicRound(percentage*100,2)}%</Text>
                {(unitmode===unitmodes.FIAT) ? (
                    <Text style={{color:actionColor,fontWeight:"bold",fontSize:14,position:"absolute",alignSelf:"flex-end"}}>$  </Text>
                ):(
                    <Text style={{color:actionColor,fontWeight:"bold",fontSize:14,position:"absolute",alignSelf:"flex-end"}}>{coinsymbol}  </Text>
                )}
            </View>
            <View style={{flexDirection:"row",justifyContent: "center",alignItems:"center", backgroundColor:StyleLib.containerColor_quinquies(globalContext.state.env.darkmode!),borderRadius:5}}>
                <TouchableOpacity style={[{width:30,height:30,borderRadius:5,marginLeft:5,justifyContent:"center",alignItems:"center"},actionQuantity<=0 ? {backgroundColor:"#CCCCCC"}:{backgroundColor:"white"}]} onPress={()=>buttonHandler(false)}>
                    <Image source={require('../assets/icons/1x/minus.png')} style={[{width:20,height:20},(action===actions.BUY&&actionQuantity>0)&&{tintColor:StyleLib.sellColor(globalContext.state.env.darkmode!)},(action===actions.SELL&&actionQuantity>0)&&{tintColor:StyleLib.buyColor(globalContext.state.env.darkmode!)}]}/>
                </TouchableOpacity>
                <View style={{width:width-110,marginHorizontal:20}}>
                    <Slider
                        value={percentage}
                        onValueChange={value => slideHandler(value)}
                        step={0.05}
                        thumbTintColor="white"
                        minimumTrackTintColor={actionColor}
                        style={{height:35}}
                        //trackStyle={{height:15,borderRadius:5}}
                        //thumbStyle={{width: 30, height: 30}}
                    />
                </View>
                <TouchableOpacity style={[{width:30,height:30,backgroundColor:"white",borderRadius:5,marginRight:5,justifyContent:"center",alignItems:"center"},percentage>=1 ? {backgroundColor:"#CCCCCC"}:{backgroundColor:"white"}]} onPress={()=>buttonHandler(true)}>
                <Image source={require('../assets/icons/1x/plus.png')} style={[{width:20,height:20},(action===actions.BUY&&percentage<1)&&{tintColor:StyleLib.buyColor(globalContext.state.env.darkmode!)},(action===actions.SELL&&percentage<1)&&{tintColor:StyleLib.sellColor(globalContext.state.env.darkmode!)}]}/>
                </TouchableOpacity>
            </View>
            
            {(action===actions.SELL) ? (
                <Button disabled={(actionQuantity_crypto<=0) || processing} buttonStyle={{backgroundColor:StyleLib.sellColor(globalContext.state.env.darkmode!),borderRadius:5, marginTop: 5,width:width,height:50}} titleStyle={{color: "#ffffff", fontSize: 16, fontWeight:"bold"}} title={processing ? (i18n.t('s_processing')):(i18n.t('sell')+" "+actionQuantity_crypto+" "+coinsymbol)} onPress={triggerTrade}/>
            ):(
                <Button disabled={(actionQuantity_crypto<=0) || processing} buttonStyle={{backgroundColor:StyleLib.buyColor(globalContext.state.env.darkmode!),borderRadius:5, marginTop: 5,width:width,height:50}} titleStyle={{color: "#ffffff", fontSize: 16, fontWeight:"bold"}} title={processing ? (i18n.t('s_processing')):(i18n.t('buy')+" "+actionQuantity_crypto+" "+coinsymbol)}  onPress={triggerTrade}/>
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