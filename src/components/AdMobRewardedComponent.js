import React, { Component } from "react";
import { TouchableOpacity, Text, Platform, Alert } from 'react-native';
import { AdMobRewarded } from 'expo-ads-admob';
import { db } from '../../firebase';
import AwesomeAlert from 'react-native-awesome-alerts';
import Env from '../env.json';

const android_rewarded_test = "ca-app-pub-3940256099942544/5224354917";
const ios_rewarded_test = "ca-app-pub-3940256099942544/1712485313";

const android_rewarded = "ca-app-pub-xxxxxxxxxxxxxxxxxx/xxxxxxxxxx";
const ios_rewarded = "ca-app-pub-xxxxxxxxxxxxxxxxxx/xxxxxxxxxx";

const bool_AD_is_test = (Env.Test_ads ?? "false") === "true" ? true:false;

export default class AdMobRewardedComponent extends Component {
    state = {
        rewarded: false,
        loadedAd: false,
        showAlert: false,
        showAlert_skip: false,
        error: false,
        reward_1: 0,
        reward_2: 0,
        reward_7: 0,
        reward_20: 0,
        reward_70: 0,
        message_reward: 0,
    }

    async componentDidMount() {
        let ad_controller = await db.collection('globalEnv').doc('ad_controller').get();
        let ad_config = ad_controller.data();
        let override = ad_config.always_test ?? false;
        this.setState({
            reward_1: ad_config.video_reward_1 ?? 9999, // real value hidden for security reasons
            reward_2: ad_config.video_reward_2 ?? 9999, // real value hidden for security reasons
            reward_7: ad_config.video_reward_7 ?? 9999, // real value hidden for security reasons
            reward_20: ad_config.video_reward_20 ?? 9999, // real value hidden for security reasons
            reward_70: ad_config.video_reward_70 ?? 9999 // real value hidden for security reasons
        });
        if(bool_AD_is_test || override){
            AdMobRewarded.setAdUnitID((Platform.OS === 'ios') ? ios_rewarded_test:android_rewarded_test);
        }else{
            AdMobRewarded.setAdUnitID((Platform.OS === 'ios') ? ios_rewarded:android_rewarded);
        }
        AdMobRewarded.addEventListener('rewardedVideoUserDidEarnReward', () => {
            console.log('User Did Earn Reward');
            this.setState({ rewarded: true });
            this.giveReward();
        });
        AdMobRewarded.addEventListener('rewardedVideoDidLoad', () => {console.log('VideoLoaded with test status : ',(bool_AD_is_test || override));this.setState({ loadedAd: true });});
        AdMobRewarded.addEventListener('rewardedVideoDidFailToLoad', (e) => {console.log('FailedToLoad :',e.error);this.setState({ error: true });});
        AdMobRewarded.addEventListener('rewardedVideoDidPresent', () => console.log('Did Present'));
        AdMobRewarded.addEventListener('rewardedVideoDidFailToPresent', () => console.log('Failed To Present'));
        AdMobRewarded.addEventListener('rewardedVideoDidDismiss', () => {
            console.log('Video Did Dismiss');
            console.log("This.rewarded is :",this.state.rewarded);
            if(!this.state.rewarded){
                this.showAlert_skip();
            }
            AdMobRewarded.requestAdAsync()
                .then(()=>{
                    this.setState({ loadedAd: true, rewarded: false });
                })
                .catch(error => {
                    (error.message === "Ad is already loaded.") && this.setState({ loadedAd: true });
                    console.warn(error.message);
            });
        });

        await AdMobRewarded.requestAdAsync().catch(error => {
            (error.message === "Ad is already loaded.") && this.setState({ loadedAd: true });
            console.warn(error.message);
        });
    }

    componentWillUnmount() {
        console.log("componentWillUnmount");
        AdMobRewarded.removeAllListeners();
    }

    _handlePress = () => {
        const { error } = this.state;
        if(!error){
            this.showAd();
        }else{
            Alert.alert(
            "Reward unavailable",
            `No reward available at the moment. Please come back later.`,
            [{ text: "OK" },]
            );
        }
    }

    showAd = async() => {
        this.setState({ loadedAd: false });
        await AdMobRewarded.showAdAsync().catch(error => {console.warn(error.message);});
    }

    showAlert = () => {
        this.setState({
          showAlert: true
        });
    };
    
    hideAlert = () => {
        this.setState({
            showAlert: false
        });
    };

    showAlert_skip = () => {
        this.setState({
          showAlert_skip: true
        });
    };
    
    hideAlert_skip = () => {
        this.setState({
            showAlert_skip: false
        });
    };

    giveReward = async() => {
        const { reward_1, reward_2, reward_7, reward_20, reward_70 } = this.state;
        const dynamicRound = (i,j) => {
            return (Math.round(i * Math.pow(10,j)) / Math.pow(10,j));
        }
        const getReward = () => {
            const rndInt = Math.random();
            let bonus = Math.floor((Math.random()*9999)+9999) // real value hidden for security reasons
            if(rndInt<=0.01){
                return reward_1;
            }else if(rndInt<=0.02){
                return reward_2;
            }else if(rndInt<=0.07){
                return reward_7;
            }else if(rndInt<=0.3){
                return reward_20+bonus;
            }else{
                return reward_70+bonus;
            }
        }
        const dir = db.collection('users').doc(this.props.user);
        const get_data = await dir.get();
        const data = get_data.data();
        let reward = getReward();
        this.setState({message_reward:reward});
        console.log("REWARD SET TO : ",reward);
        let theseed = data.seed;
        let thetotalbuyin = data.totalbuyin;
        let thetotalbuyin_const = data.totalbuyin_constant;
        let newSeed = dynamicRound(theseed + reward,2);
        let newThetotalbuyin = dynamicRound(thetotalbuyin + reward,2);
        let newThetotalbuyin_const = dynamicRound(thetotalbuyin_const + reward,2);
        let j = new Date().toString();
        let k = j.split(" ");
        let l = k.slice(1, 5);
        l[3] = l[3].substring(0,5);
        dir.update({seed:newSeed, totalbuyin:newThetotalbuyin, totalbuyin_constant:newThetotalbuyin_const}).then(()=>{
            dir
            .collection("history")
            .add({
                type: "Earned",
                target: "VUSD",
                targetName: "Virtual USD",
                quantity: reward,
                fiat: 0,
                price: 1,
                imgsrc: Env.fiatCoinIcon,
                orderNum: Number(new Date().getTime()).toString().substring(0, 10),
                time: l.join(' ')
             })
            console.log("User gained [",reward,"] VUSD with the rewarded video ad.");
            this.showAlert();
        }).catch((e)=>{
            console.log("Error - User did not gain reward because :",e);
        });
    }

    render() {
        const { loadedAd, showAlert, showAlert_skip, error, message_reward } = this.state;
        const dynamicColor = () => {
            return loadedAd ? "#2394DB":"#a3a3a3";
        }
        const dynamicTextColor = () => {
            return loadedAd ? "#ffffff":"#5c5c5c";
        }
        return (
            <>
            <TouchableOpacity onPress={this._handlePress} disabled={!loadedAd} 
            style={{width:this.props.width,marginBottom:5,height:35,borderRadius:5,backgroundColor:dynamicColor(),justifyContent:"center",alignItems:"center"}}>
                <Text style={{fontSize:16, fontWeight:"700", color:dynamicTextColor()}}>{error ? "reward unavailable":"Get random VUSD reward"}</Text>
            </TouchableOpacity>
            <AwesomeAlert
                show={showAlert}
                showProgress={false}
                title="VUSD Reward"
                message={`You earned ${message_reward} VUSD!`}
                closeOnTouchOutside={true}
                closeOnHardwareBackPress={true}
                showCancelButton={false}
                showConfirmButton={true}
                confirmText=" Cool! "
                confirmButtonColor="#55ddab"
                onDismiss={()=>{
                    this.hideAlert();
                }}
                onConfirmPressed={() => {
                    this.hideAlert();
                }}
            />
            <AwesomeAlert
                show={showAlert_skip}
                showProgress={false}
                title="Error"
                message="You skipped the reward"
                closeOnTouchOutside={true}
                closeOnHardwareBackPress={true}
                showCancelButton={false}
                showConfirmButton={true}
                confirmText=" Retry "
                confirmButtonColor="#DD6B55"
                onDismiss={()=>{
                    this.hideAlert_skip();
                }}
                onConfirmPressed={() => {
                    this.hideAlert_skip();
                }}
            />
            </>
            )
    }
}