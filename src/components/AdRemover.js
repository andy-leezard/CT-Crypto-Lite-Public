import React, {useEffect, useState} from 'react';
import { Text, View, TouchableOpacity, Dimensions } from 'react-native';
import { db } from '../../firebase';
import { useColorScheme } from "react-native-appearance";
import AwesomeAlert from 'react-native-awesome-alerts';
import Env from '../env.json';

const AdRemover = ({route, navigation}) => {
    const scheme = useColorScheme();
    const { email, boughtPro } = route.params;
    const [seed, setSeed] = useState(0);
    const [totalbuyin, setTotalbuyin] = useState();
    const [totalbuyin_const, setTotalbuyin_const] = useState();
    const [clicked, setClicked] = useState(false);
    const [proCommission, setProCommission] = useState(0.3);
    const [upgradeCost, setUpgradeCost] = useState(0);
    const [showAlert, setShowAlert] = useState(false);
    const [prevent_doublePurchase, setPrevent] = useState(false);

    const [alertMessage, setAlertMessage] = useState('');
    const [alertBtnColorState, setAlertBtnColorState] = useState(false);

    const initializeAlert = () => {
        setShowAlert(false);
        setAlertBtnColorState(false);
    }
    const onFailUpgrade = (message) => {
        setAlertBtnColorState(true);
        setAlertMessage(message);
    }
    const onSucceedUpgrade = () => {
        setAlertBtnColorState(false);
    }

    const ref = db.collection('users').doc(email);
    useEffect(() => {
        initializeAlert();
        if(boughtPro){
            navigation.goBack();
        }else{
            db.collection('globalEnv').doc("commission").get().then((doc)=> {
                if(doc.exists){
                    setProCommission(doc.data().as_percentage_pro);
                    setUpgradeCost(doc.data().upgrade_cost);
                    
                }else{
                    console.log("Warning - globalEnv collection not found in db !");
                }
            })
        }
        const unsubscribe = ref.onSnapshot((doc)=>{
                setSeed(doc.data().seed);
                setTotalbuyin(doc.data().totalbuyin);
                setTotalbuyin_const(doc.data().totalbuyin_constant);
                setPrevent(doc.data().boughtPro);
        })
        return unsubscribe;
    },[]);

    const bool_isDarkMode = () => {
        return scheme === "dark";
    }
    const containerColor = () => {
        return bool_isDarkMode() ? "#2e2e2e":"#e8e8e8";
    }
    const textColor = () => {
        return bool_isDarkMode() ? "#FFFFFF":"#000000";
    }
    const tryUpgrade = () => {
        setShowAlert(true);
    }
    const defaultConfirmBtnText = () => {
        return prevent_doublePurchase ? 'Cool!':'Upgrade'
    }
    const defaultTitleText = () => {
        return prevent_doublePurchase ? 'Upgraded':'Information'
    }
    const defaultMessage = () => {
        return prevent_doublePurchase ? 'Your account is now upgraded!':`Upgrade cost : ${upgradeCost} VUSD`
    }
    const _update = () => {
        return new Promise((resolve,reject)=>{
            let newSeed = dynamicRound(seed - upgradeCost,2);
            let newTotalBuyin = dynamicRound(totalbuyin - upgradeCost,2);
            let newTotalBuyin_const = dynamicRound(totalbuyin_const - upgradeCost,2);
            ref
            .update({
                boughtPro: true,
                pro: true,
                seed: newSeed,
                totalbuyin : newTotalBuyin,
                totalbuyin_constant : newTotalBuyin_const
            })
            .then(()=>{
                resolve("successfully updated seed")
            })
            .catch(reject);
        })
    }
    const _create_history = () => {
        return new Promise((resolve,reject)=>{
            ref
            .collection("history")
            .add({
                type: "Spent",
                target: "VUSD",
                targetName: "Virtual USD",
                quantity: upgradeCost,
                fiat: -1,
                price: 1,
                imgsrc: Env.fiatCoinIcon,
                orderNum: Number(new Date().getTime()).toString().substring(0, 10),
                time: simplifyDate(new Date())
            })
            .then(()=>{
                resolve("successfully added history")
            })
            .catch(reject);
        })
    }

    const triggerUpgrade = () => {
        Promise.all([_update(),_create_history()])
            .then(() => {
                setPrevent(true);
                onSucceedUpgrade();
            })
            .catch((err)=>{
                onFailUpgrade("Network error occurred. If this issue is persisting, please send a feedback.")
                console.warn(err);
            });
    }

    const upgrade = () => {
        if(prevent_doublePurchase || boughtPro){navigation.goBack();return;}
        if(seed < upgradeCost){console.log("seed not enough : ",seed);onFailUpgrade("Not enough VUSD.");return;}
        else{
            setClicked(true);
            triggerUpgrade();
        }
    }

    const dynamicRound = (i,j) => {
        return (Math.round(i * Math.pow(10,j)) / Math.pow(10,j));
    }

    const simplifyDate = (i) => {
        let j = i.toString();
        let k = j.split(" ");
        let l = k.slice(1, 5);
        l[3] = l[3].substring(0,5);
        return l.join(' ');
    }
    if(upgradeCost===0){
        return(
        <View style={{flex:1,alignItems:"center",marginTop:15}}>
            <View>
                <View style={{width: Dimensions.get("window").width-40, height:"auto", padding:5, borderRadius:10, backgroundColor:containerColor(),marginVertical:5}}>
                    <Text style={{color:textColor(),fontSize:17,fontWeight:"700"}}>Advantages</Text>
                    <Text style={{color:textColor(),fontSize:15,fontWeight:"500",marginLeft:5}}>- AD Free means removal of all banner and interstitial ads. Rewarded ads will always be available to earn more VUSD any time.</Text>
                    <Text style={{color:textColor(),fontSize:15,fontWeight:"500",marginLeft:5}}>- lower commission fees ({proCommission}%)</Text>
                    <Text style={{color:textColor(),fontSize:17,fontWeight:"700",marginTop:5}}>Reminder</Text>
                    <Text style={{color:textColor(),fontSize:15,fontWeight:"500",marginLeft:5}}>- Spending your VUSD does not affect your PNL negatively, as the upgrade cost is not considered as an investment.</Text>
                    <Text style={{color:textColor(),fontSize:15,fontWeight:"500",marginLeft:5}}>- This purcahse is permanent and cannot be canceled.</Text>
                </View>
                <TouchableOpacity disabled={true} style={{alignSelf:"center", height: 45, width: Dimensions.get("window").width-40,justifyContent:"center", alignItems:"center",backgroundColor:"#a3a3a3",borderRadius:10}}>
                    <Text style={{fontSize:17,color:"white",fontWeight:"bold"}}>Upgrade</Text>
                </TouchableOpacity>
            </View>
        </View>
        )
    }else{
        return(
        <View style={{flex:1,alignItems:"center",marginTop:15}}>
            <View>
                <View style={{width: Dimensions.get("window").width-40, height:"auto", padding:5, borderRadius:10, backgroundColor:containerColor(),marginVertical:5}}>
                    <Text style={{color:textColor(),fontSize:17,fontWeight:"700"}}>Advantages</Text>
                    <Text style={{color:textColor(),fontSize:15,fontWeight:"500",marginLeft:5}}>- AD Free means removal of all banner and interstitial ads. Rewarded ads will always be available to earn more VUSD any time.</Text>
                    <Text style={{color:textColor(),fontSize:15,fontWeight:"500",marginLeft:5}}>- lower commission fees ({proCommission}%) for higher gains !</Text>
                    <Text style={{color:textColor(),fontSize:17,fontWeight:"700",marginTop:5}}>Reminder</Text>
                    <Text style={{color:textColor(),fontSize:15,fontWeight:"500",marginLeft:5}}>- Upgrade cost : {upgradeCost} VUSD.</Text>
                    <Text style={{color:textColor(),fontSize:15,fontWeight:"500",marginLeft:5}}>- Spending your VUSD does not affect your PNL negatively, as the upgrade cost is not considered as an investment.</Text>
                    <Text style={{color:textColor(),fontSize:15,fontWeight:"500",marginLeft:5}}>- This purcahse is permanent and cannot be canceled as long as your account exists.</Text>
                    <Text style={{color:textColor(),fontSize:15,fontWeight:"500",marginLeft:5}}>- Your VUSD wallet has : {seed} $</Text>
                </View>
                <TouchableOpacity disabled={clicked} style={{alignSelf:"center", height: 45, width: Dimensions.get("window").width-40,justifyContent:"center", alignItems:"center",backgroundColor:"#81d466",borderRadius:10}} onPress={()=>tryUpgrade()}>
                    <Text style={{fontSize:17,color:"white",fontWeight:"bold"}}>Upgrade</Text>
                </TouchableOpacity>
            </View>
            <AwesomeAlert
                show={showAlert}
                showProgress={false}
                title={alertBtnColorState ? 'Error':defaultTitleText()}
                message={alertBtnColorState ? alertMessage:defaultMessage()}
                closeOnTouchOutside={true}
                closeOnHardwareBackPress={true}
                showCancelButton={!alertBtnColorState && !prevent_doublePurchase}
                showConfirmButton={true}
                cancelText="Cancel"
                confirmText={alertBtnColorState ? 'OK':defaultConfirmBtnText()}
                confirmButtonColor={alertBtnColorState ? "#DD6B55":"#55ddab"}
                onDismiss={()=>{
                    (alertBtnColorState || prevent_doublePurchase) ? navigation.goBack():initializeAlert();
                }}
                onCancelPressed={() => {
                    (alertBtnColorState || prevent_doublePurchase) ? navigation.goBack():initializeAlert();
                }}
                onConfirmPressed={() => {
                    if(alertBtnColorState){
                        navigation.goBack();
                    }else{
                        prevent_doublePurchase ? navigation.goBack():upgrade();
                    }
                }}
            />
        </View>
        )
    }
}

export default AdRemover
