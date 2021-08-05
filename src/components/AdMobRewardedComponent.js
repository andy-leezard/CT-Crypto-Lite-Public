import React, { Component } from "react";
import { Alert, TouchableOpacity, Text, Platform } from 'react-native';
import { AdMobRewarded, setTestDeviceIDAsync } from 'expo-ads-admob';
import { db } from '../../firebase';

const android_rewarded_test = "ca-app-pub-3940256099942544/5224354917";
const ios_rewarded_test = "ca-app-pub-3940256099942544/1712485313";

const android_rewarded = "ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx";
const ios_rewarded = "ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx";
const bool_AD_is_test = true;

export default class AdMobRewardedComponent extends Component {
    state = {
        loadedAd: false,
    }

    async componentDidMount() {
        await setTestDeviceIDAsync('EMULATOR');
        if(bool_AD_is_test){
            AdMobRewarded.setAdUnitID((Platform.OS === 'ios') ? ios_rewarded_test:android_rewarded_test);
        }else{
            AdMobRewarded.setAdUnitID((Platform.OS === 'ios') ? ios_rewarded:android_rewarded);
        }
        //AdMobRewarded.setAdUnitID(android_rewarded_test); // Test ID, Replace with your-admob-unit-id
        AdMobRewarded.addEventListener('rewardedVideoUserDidEarnReward', () => {
            console.log('User Did Earn Reward');
            this.setState({ loadedAd: false });
            const dir = db.collection('users').doc(this.props.user);
            dir.get().then((doc)=>{
                let theseed = doc.data().seed;
                let thetotalbuyin = doc.data().totalbuyin;
                let thetotalbuyin_const = doc.data().totalbuyin_constant;
                let newSeed = theseed + 100;
                let newThetotalbuyin = thetotalbuyin + 100;
                let newThetotalbuyin_const = thetotalbuyin_const + 100;
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
                        quantity: 100,
                        fiat: 0,
                        price: 1,
                        imgsrc: "https://imgsrc",
                        orderNum: Number(new Date().getTime()).toString().substring(0, 10),
                        time: l.join(' ')
                     })
                });
                console.log("updated seed from ",theseed, "to", newSeed);
                console.log("updated total buy-in from ",thetotalbuyin, "to", newThetotalbuyin);
                console.log("updated constant total buy-in from ",thetotalbuyin_const, "to", newThetotalbuyin_const);
                Alert.alert(
                    "VUSD Reward",
                    "You earned 100 VUSD !",
                    [{ text: "OK"}]
                );
            });
        });
        AdMobRewarded.addEventListener('rewardedVideoDidLoad', () => {console.log('VideoLoaded');this.setState({ loadedAd: true });});
        AdMobRewarded.addEventListener('rewardedVideoDidFailToLoad', () => console.log('FailedToLoad'));
        AdMobRewarded.addEventListener('rewardedVideoDidPresent', () => console.log('Did Present'));
        AdMobRewarded.addEventListener('rewardedVideoDidFailToPresent', () => console.log('Failed To Present'));
        AdMobRewarded.addEventListener('rewardedVideoDidDismiss', () => {
            console.log('Video Did Dismiss');
            AdMobRewarded.requestAdAsync()
                .then(()=>{
                    this.setState({ loadedAd: true });
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

    _handlePress = async () => {
        await AdMobRewarded.showAdAsync().catch(error => {console.warn(error.message);});
    }

    render() {
        const { loadedAd } = this.state;
        const dynamicColor = () => {
            return loadedAd ? "#2394DB":"#E3E6E8";
        }
        const dynamicTextColor = () => {
            return loadedAd ? "#ffffff":"#1e1e1e";
        }
        if(loadedAd){
            return (
                <TouchableOpacity onPress={this._handlePress} disabled={!loadedAd} 
                style={{width:this.props.width,marginBottom:5,height:35,borderRadius:5,backgroundColor:dynamicColor(),justifyContent:"center",alignItems:"center"}}>
                    <Text style={{fontSize:16, fontWeight:"700", color:dynamicTextColor()}}>Get free 100 VUSD</Text>
                </TouchableOpacity>
                )
        }else{
            return (
                <>
                </>
                )
        }
    }
}