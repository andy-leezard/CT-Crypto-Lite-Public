import React, {useEffect, useState, useContext} from 'react';
import { Text, View, TouchableOpacity, Dimensions } from 'react-native';
import { db } from '../../firebase';
import AwesomeAlert from 'react-native-awesome-alerts';
import Env from '../env.json';
import I18n from 'i18n-js';
import { GlobalContext, MainContext } from '../StateManager';
import { GlobalContextInterfaceAsReducer, MainContextInterface } from '../lib/Types';
import { DocumentSnapshot } from '@firebase/firestore-types'
import { dynamicRound } from '../lib/FuncLib';

interface Props{
    route:any
    navigation:any
}

const AdRemover:React.FC<Props> = ({route, navigation}) => {
    const globalContext = useContext<GlobalContextInterfaceAsReducer>(GlobalContext);
    const mainContext = useContext<MainContextInterface>(MainContext);
    const [seed, setSeed] = useState<number>(0);
    const [totalbuyin, setTotalbuyin] = useState<number>();
    const [totalbuyin_const, setTotalbuyin_const] = useState<number>();
    const [clicked, setClicked] = useState<boolean>(false);
    const [proCommission, setProCommission] = useState<number>(0.3);
    const [upgradeCost, setUpgradeCost] = useState<number>(0);
    const [showAlert, setShowAlert] = useState<boolean>(false);
    const [prevent_doublePurchase, setPrevent] = useState<boolean>(false);

    const [alertMessage, setAlertMessage] = useState<string>('');
    const [alertBtnColorState, setAlertBtnColorState] = useState<boolean>(false);

    const initializeAlert = () => {
        setShowAlert(false);
        setAlertBtnColorState(false);
    }
    const onFailUpgrade = (message:string) => {
        setAlertBtnColorState(true);
        setAlertMessage(message);
    }
    const onSucceedUpgrade = () => {
        setAlertBtnColorState(false);
    }

    const ref = db.collection('users').doc(globalContext.state.auth.userEmail!);
    useEffect(() => {
        initializeAlert();
        if(mainContext.vip){
            navigation.goBack();
        }else{
            db.collection('globalEnv').doc("commission").get()
            .then((doc:DocumentSnapshot)=> {
                if(doc.exists){
                    const data = doc.data()!;
                    setProCommission(data.as_percentage_pro);
                    setUpgradeCost(data.upgrade_cost);
                }else{
                    navigation.goBack();
                }
            }).catch(()=>{navigation.goBack();})
        }
        const unsubscribe = ref.onSnapshot((doc:DocumentSnapshot)=>{
                const data = doc.data()!;
                setSeed(data.seed);
                setTotalbuyin(data.totalbuyin);
                setTotalbuyin_const(data.totalbuyin_constant);
                setPrevent(data.boughtPro);
        })
        return unsubscribe;
    },[]);

    const containerColor = () => {
        return globalContext.state.env.darkmode ? "#2e2e2e":"#e8e8e8";
    }
    const textColor = () => {
        return globalContext.state.env.darkmode ? "#FFFFFF":"#000000";
    }
    const tryUpgrade = () => {
        setShowAlert(true);
    }
    const defaultConfirmBtnText = () => {
        return prevent_doublePurchase ? I18n.t('cool'):I18n.t('upgrade')
    }
    const defaultTitleText = () => {
        return prevent_doublePurchase ? I18n.t('upgraded'):I18n.t('information')
    }
    const defaultMessage = () => {
        return prevent_doublePurchase ? I18n.t('success_vip'):`${I18n.t('vip_cost')} : ${upgradeCost} VUSD`
    }
    const _update = () => {
        return new Promise((resolve,reject)=>{
            let newSeed = dynamicRound(seed - upgradeCost,2);
            let newTotalBuyin = dynamicRound(totalbuyin! - upgradeCost,2);
            let newTotalBuyin_const = dynamicRound(totalbuyin_const! - upgradeCost,2);
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
                onFailUpgrade(I18n.t('p_upgrade.er_1'))
                console.warn(err);
            });
    }

    const upgrade = () => {
        if(prevent_doublePurchase || mainContext.vip){navigation.goBack();return;}
        if(seed < upgradeCost){console.log("seed not enough : ",seed);onFailUpgrade(I18n.t('p_upgrade.er_2'));return;}
        else{
            setClicked(true);
            triggerUpgrade();
        }
    }

    const simplifyDate = (i:Date) => {
        let j = i.toString();
        let k = j.split(" ");
        let l = k.slice(1, 5);
        l[3] = l[3].substring(0,5);
        return l.join(' ');
    }
    
    return(
        <View style={{flex:1,alignItems:"center",marginTop:15}}>
            <View>
                <View style={{width: Dimensions.get("window").width-40, height:"auto", padding:5, borderRadius:10, backgroundColor:containerColor(),marginVertical:5}}>
                    <Text style={{color:textColor(),fontSize:17,fontWeight:"700"}}>{I18n.t('p_upgrade.advantages')}</Text>
                    <Text style={{color:textColor(),fontSize:15,fontWeight:"500",marginLeft:5}}>- {I18n.t('p_upgrade._1')}</Text>
                    <Text style={{color:textColor(),fontSize:15,fontWeight:"500",marginLeft:5}}>- {I18n.t('p_upgrade._2_pre')} ({proCommission}%) {I18n.t('p_upgrade._2_suf')}</Text>
                    <Text style={{color:textColor(),fontSize:17,fontWeight:"700",marginTop:5}}>{I18n.t('p_upgrade.reminder')}</Text>
                    <Text style={{color:textColor(),fontSize:15,fontWeight:"500",marginLeft:5}}>- {I18n.t('p_upgrade.uc')} : {upgradeCost} VUSD.</Text>
                    <Text style={{color:textColor(),fontSize:15,fontWeight:"500",marginLeft:5}}>- {I18n.t('p_upgrade._3')}</Text>
                    <Text style={{color:textColor(),fontSize:15,fontWeight:"500",marginLeft:5}}>- {I18n.t('p_upgrade._4')}</Text>
                    <Text style={{color:textColor(),fontSize:15,fontWeight:"500",marginLeft:5}}>- {I18n.t('p_upgrade._5')} : {seed} $</Text>
                </View>
                <TouchableOpacity disabled={clicked} style={{alignSelf:"center", height: 45, width: Dimensions.get("window").width-40,justifyContent:"center", alignItems:"center",backgroundColor:"#81d466",borderRadius:10}} onPress={()=>tryUpgrade()}>
                    <Text style={{fontSize:17,color:"white",fontWeight:"bold"}}>{I18n.t('upgrade')}</Text>
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

export default AdRemover
