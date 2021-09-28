import React, { Component } from "react";
import { TouchableOpacity, Text, Platform, Image } from 'react-native';
import { AdMobRewarded } from 'expo-ads-admob';
import { db } from '../../firebase';
import AwesomeAlert from 'react-native-awesome-alerts';
import Env from '../env.json';
import I18n from "i18n-js";

// JS-only component : preference
export default class AdMobRewardedComponent extends Component {
    state = {
        rewarded: false,
        loadedAd: false,
        showAlert: false,
        showAlert_skip: false,
        showAlert_noad: false,
        error: false,
        reward_1: 0,
        reward_2: 0,
        reward_7: 0,
        reward_20: 0,
        reward_70: 0,
        message_reward: 0,
    }

    async componentDidMount() {
        const ad_controller = db.collection('globalEnv').doc('ad_controller');
        const _ad_controller = await ad_controller.get();
        const ad_config = _ad_controller.data();
        const override = ad_config.always_test ?? false;
        this.setState({
            reward_1: ad_config.video_reward_1 ?? 750,
            reward_2: ad_config.video_reward_2 ?? 500,
            reward_7: ad_config.video_reward_7 ?? 350,
            reward_20: ad_config.video_reward_20 ?? 250,
            reward_70: ad_config.video_reward_70 ?? 100
        });
        if(Env.Test_ads || override){
            AdMobRewarded.setAdUnitID((Platform.OS === 'ios') ? Env.ios_rewarded_test:Env.android_rewarded_test);
        }else{
            AdMobRewarded.setAdUnitID((Platform.OS === 'ios') ? Env.ios_rewarded:Env.android_rewarded);
        }
        AdMobRewarded.addEventListener('rewardedVideoUserDidEarnReward', () => {
            console.log('User Did Earn Reward');
            this.setState({ rewarded: true });
            this.giveReward();
        });
        AdMobRewarded.addEventListener('rewardedVideoDidLoad', () => {console.log('VideoLoaded with test status : ',(Env.Test_ads || override));this.setState({ loadedAd: true });});
        AdMobRewarded.addEventListener('rewardedVideoDidFailToLoad', (e) => {
            this.setState({ error: true });
            this.reportError(e);
        });
        AdMobRewarded.addEventListener('rewardedVideoDidDismiss', () => {
            console.log("This.rewarded is :",this.state.rewarded);
            (!this.state.rewarded) && this.showAlert_skip();
            this.requestAd(false);
        });
        this.requestAd(true);
    }

    reportError = async(e) => {
        const msg = e.name ?? e;
        const reporter = this.props.user ?? "anonymous";
        const timestamp = new Date().toUTCString();
        await ad_controller.collection('logs').add({type:"Video",error:msg,timestamp:timestamp,reporter:reporter});
    }

    componentWillUnmount() {
        AdMobRewarded.removeAllListeners();
    }

    _handlePress = () => {
        if(this.state.error){
            this.showAlert_noad();
        }else if(this.state.loadedAd){
            this.showAd();
        }
    }

    requestAd = (firstTime) => {
        AdMobRewarded.requestAdAsync()
            .then(()=>{
                !firstTime && this.setState({ loadedAd: true, rewarded: false });
            })
            .catch(error => {
                (error.code === "E_AD_ALREADY_LOADED") && this.setState({ loadedAd: true });
                console.log(error.message);
            });
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

    showAlert_noad = () => {
        this.setState({
          showAlert_noad: true
        });
    };

    hideAlert_noad = () => {
        this.setState({
            showAlert_noad: false
        });
    };

    giveReward = async() => {
        const { reward_1, reward_2, reward_7, reward_20, reward_70 } = this.state;
        const dynamicRound = (i,j) => {
            return (Math.round(i * Math.pow(10,j)) / Math.pow(10,j));
        }
        const getReward = () => {
            const rndInt = Math.random();
            let bonus = Math.floor((Math.random()*50)+1)
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
        let reward_acc = data.reward_acc ?? 0;
        let newSeed = dynamicRound(theseed + reward,2);
        let newThetotalbuyin = dynamicRound(thetotalbuyin + reward,2);
        let newThetotalbuyin_const = dynamicRound(thetotalbuyin_const + reward,2);
        let newReward_acc = dynamicRound(reward_acc + reward,2);
        let j = new Date().toString();
        let k = j.split(" ");
        let l = k.slice(1, 5);
        l[3] = l[3].substring(0,5);
        dir.update({seed:newSeed, totalbuyin:newThetotalbuyin, totalbuyin_constant:newThetotalbuyin_const, reward_acc:newReward_acc}).then(()=>{
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
            console.log("User has earned [",reward,"] VUSD with the rewarded video ad.");
            this.showAlert();
        }).catch((e)=>{
            console.log("Error - User did not earn the reward because :",e);
        });
    }

    render() {
        const { loadedAd, showAlert, showAlert_skip, error, message_reward, showAlert_noad } = this.state;
        const dynamicColor = () => {
            return loadedAd ? "#2394DB":"#a3a3a3";
        }
        const dynamicTextColor = () => {
            return loadedAd ? "#ffffff":"#5c5c5c";
        }
        return (
            <>
            <TouchableOpacity onPress={this._handlePress}
            style={{flexDirection:"row",width:this.props.width,marginBottom:5,height:this.props.height??35,borderRadius:this.props.borderRadius??5,backgroundColor:dynamicColor(),justifyContent:"center",alignItems:"center",flexDirection:"row"}}>
                {!error && this.props.show_text && <Text style={{fontSize:this.props.textSize ?? 17, fontWeight:"700", color:dynamicTextColor()}}>{I18n.t('random_reward_pre') + " " + I18n.t('random_reward_suf')}</Text>}
                {error && <Text style={{fontSize:17, fontWeight:"700", color:dynamicTextColor()}}>{I18n.t('reward_er1')}</Text>}
                {!error && <Image source={require('../assets/icons/1x/gift3.png')} style={{width:this.props.height?this.props.height-10:26,height:this.props.height?this.props.height-10:26,marginLeft:5}}/>}
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
                    this.hideAlert();
                }}
                onConfirmPressed={() => {
                    this.hideAlert();
                }}
            />
            <AwesomeAlert
                show={showAlert_skip}
                showProgress={false}
                title={I18n.t('error')}
                message={I18n.t('reward_er2_msg')}
                closeOnTouchOutside={true}
                closeOnHardwareBackPress={true}
                showCancelButton={false}
                showConfirmButton={true}
                confirmText={` ${I18n.t('retry')} `}
                confirmButtonColor="#DD6B55"
                onDismiss={()=>{
                    this.hideAlert_skip();
                }}
                onConfirmPressed={() => {
                    this.hideAlert_skip();
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
                    this.hideAlert_noad();
                }}
                onConfirmPressed={() => {
                    this.hideAlert_noad();
                }}
            />
            </>
            )
    }
}