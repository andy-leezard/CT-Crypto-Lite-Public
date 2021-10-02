import React, { useEffect, useContext, useState } from "react";
import { TouchableOpacity, Text, Platform, Image } from 'react-native';
import { AdMobRewarded } from 'expo-ads-admob';
import { db } from '../../firebase';
import AwesomeAlert from 'react-native-awesome-alerts';
import { DocumentReference } from '@firebase/firestore-types'
import Env from '../env.json';
import I18n from "i18n-js";
import { GlobalContext, MainContext } from '../StateManager';
import { GlobalContextInterfaceAsReducer, MainContextInterface, Rewards } from "../lib/Types";
import { dynamicRound } from "../lib/FuncLib";

interface Props {
    width?: number;
    height?: number;
    show_text: boolean;
    fontSize?: number;
    borderRadius?: number;
}

const AdMobRewardedFC:React.FC<Props> = (props:Props) => {
    const globalContext = useContext<GlobalContextInterfaceAsReducer>(GlobalContext);
    const mainContext = useContext<MainContextInterface>(MainContext);
    const [loadedAD, setLoadedAD] = useState<boolean>(false);
    const [showAlert, setShowAlert] = useState<boolean>(false);
    const [showAlert_noad, setShowAlert_noad] = useState<boolean>(false);
    const [error, setError] = useState<boolean>(false);
    const [message_reward, setMessage_reward] = useState<any>(null);

    const requestAd = () => {
        AdMobRewarded.requestAdAsync()
            .then(()=>{
                setLoadedAD(true);
            })
            .catch(error => {
                setLoadedAD(Boolean(error.code === "E_AD_ALREADY_LOADED"));
                console.log(error.message);
            })
    }

    const reportError = async(e:any) => {
        try{
            const msg = e.name ?? JSON.stringify(e);
            const reporter = globalContext.state.auth.userEmail ?? "anonymous";
            const timestamp = new Date().toUTCString();
            db.collection('globalEnv').doc('ad_controller').collection('logs').add({type:"Video",error:msg,timestamp:timestamp,reporter:reporter});
        }catch(e){
            console.log(e);
        }
    }

    const _set = async() => {
        try{
            if(Env.Test_ads || mainContext.adEnv.testAD_video){
                AdMobRewarded.setAdUnitID((Platform.OS === 'ios') ? Env.ios_rewarded_test:Env.android_rewarded_test);
            }else{
                AdMobRewarded.setAdUnitID((Platform.OS === 'ios') ? Env.ios_rewarded:Env.android_rewarded);
            }
            AdMobRewarded.addEventListener('rewardedVideoUserDidEarnReward', () => {
                //e:{amount:number,type:string}
                console.log('User Did Earn Reward');
                giveReward(getReward(mainContext.adEnv.rewards));
            });
            AdMobRewarded.addEventListener('rewardedVideoDidFailToLoad', (e) => {
                setError(true);
                reportError(e);
            });
            AdMobRewarded.addEventListener('rewardedVideoDidDismiss', () => {
                requestAd();
            });
            AdMobRewarded.addEventListener('rewardedVideoDidLoad', () => {
                console.log('VideoLoaded with test status : ',(Env.Test_ads || mainContext.adEnv.testAD_video));
                setLoadedAD(true);
            });
        }catch(e){
            reportError(e);
        }finally{
            requestAd();
        }
    }

    useEffect(() => {
        _set();
        return () => {
            AdMobRewarded.removeAllListeners();
        }
    }, [])

    const _handlePress = () => {
        if(error){
            func_showAlert_noad();
        }else if(loadedAD){
            showAd();
        }
    }

    const showAd = () => {
        setLoadedAD(false);
        AdMobRewarded.showAdAsync().catch(console.warn);
    }

    const func_showAlert = () => {
        setShowAlert(true);
    };
    
    const hideAlert = () => {
        setShowAlert(false);
    };

    const func_showAlert_noad = () => {
        setShowAlert_noad(true);
    };

    const hideAlert_noad = () => {
        setShowAlert_noad(false);
    };

    const getReward = (rewards:Rewards):number => {
        const rndInt = Math.random();
        let bonus = Math.floor((Math.random()*50)+1)
        if(rndInt<=0.01){
            return rewards._1;
        }else if(rndInt<=0.02){
            return rewards._2;
        }else if(rndInt<=0.07){
            return rewards._7;
        }else if(rndInt<=0.3){
            return rewards._20+bonus;
        }else{
            return rewards._70+bonus;
        }
    }

    const _giveReward = (dir:DocumentReference,reward:number) => {
        return new Promise((resolve,reject)=>{
            dir.update({
                seed:dynamicRound(mainContext.user.seed+reward,2),
                totalbuyin:dynamicRound(mainContext.user.totalbuyin+reward,2),
                totalbuyin_constant:dynamicRound(mainContext.user.totalbuyin_const+reward,2),
                reward_acc:dynamicRound((mainContext.user.reward_acc??0)+reward,2),
                times_watched_ads:(mainContext.user.times_watched_ads??1)
            }).then(resolve).catch(reject)
        })
    }

    const _addHistory = (dir:DocumentReference,reward:number) => {
        return new Promise((resolve,reject)=>{
            const time = new Date();
            dir.collection("history")
                .add({
                    type: "Earned",
                    target: "VUSD",
                    targetName: "Virtual USD",
                    quantity: reward,
                    fiat: 0,
                    price: 1,
                    imgsrc: Env.fiatCoinIcon,
                    orderNum: time.getTime(),
                    time: time.toLocaleString()
                }).then(resolve).catch(reject)
        })
    }

    const giveReward = async(reward:number) => {
        const dir = db.collection('users').doc(globalContext.state.auth.userEmail!);
        setMessage_reward(reward);
        console.log("REWARD SET TO : ",reward);
        Promise.all([_giveReward(dir,reward),_addHistory(dir,reward)]).then(()=>{
            console.log("User has earned [",reward,"] VUSD with the rewarded video ad.");
            func_showAlert();
        }).catch((e)=>{
            console.log("Error - User did not earn the reward because :",e);
        })
    }

    const dynamicColor = () => {
        return loadedAD ? "#2394DB":"#a3a3a3";
    }

    const dynamicTextColor = () => {
        return loadedAD ? "#ffffff":"#5c5c5c";
    }
        
    return (
        <>
        <TouchableOpacity  onPress={_handlePress}
        style={{width:props.width, height:props.height ?? "auto", marginVertical:10, padding:5, borderRadius:props.borderRadius??10, backgroundColor:dynamicColor(),justifyContent:"center",alignItems:"center"}}>
            {!error && <Image source={require('../assets/icons/1x/gift3.png')} style={{width:20,height:20,alignSelf:"center",marginBottom:5}} />}
            {!error && <Text style={{fontSize:props.fontSize ?? 17, fontWeight:"700", color:dynamicTextColor()}}>{I18n.t('random_reward_pre') + " " + I18n.t('random_reward_suf')}</Text>}
            {error && <Text style={{fontSize:17, fontWeight:"700", color:dynamicTextColor()}}>{I18n.t('reward_er1')}</Text>}
        </TouchableOpacity>
        <AwesomeAlert
            show={showAlert}
            showProgress={false}
            title={I18n.t('random_reward_pre')+" "+I18n.t('random_reward_suf')}
            message={`${I18n.t('you_earned_pre')} ${message_reward} ${I18n.t('you_earned_suf')}`}
            closeOnTouchOutside={true}
            closeOnHardwareBackPress={true}
            showCancelButton={false}
            showConfirmButton={true}
            confirmText={` ${I18n.t('cool')} `}
            confirmButtonColor="#55ddab"
            onDismiss={()=>{
                hideAlert();
            }}
            onConfirmPressed={() => {
                hideAlert();
            }}
        />
        <AwesomeAlert
            show={showAlert_noad}
            showProgress={false}
            title={I18n.t('reward_er1_alert')}
            message={I18n.t('reward_er1_msg')}
            closeOnTouchOutside={true}
            closeOnHardwareBackPress={true}
            showCancelButton={false}
            showConfirmButton={true}
            confirmText={` ${I18n.t('ok')} `}
            confirmButtonColor="#DD6B55"
            onDismiss={()=>{
                hideAlert_noad();
            }}
            onConfirmPressed={() => {
                hideAlert_noad();
            }}
        />
        </>
        )
    
}

export default AdMobRewardedFC
