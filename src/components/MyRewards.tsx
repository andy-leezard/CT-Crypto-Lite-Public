import React, { useEffect, useState, useContext  } from 'react';
import { Text, View,  Dimensions, ScrollView } from 'react-native';
import { db } from '../../firebase';
import AdMobRewardedComponent from './AdMobRewardedComponent';
import I18n from 'i18n-js';
import { GlobalContext, MainContext } from '../StateManager';
import { GlobalContextInterfaceAsReducer, MainContextInterface } from '../lib/Types';
import { DocumentSnapshot } from '@firebase/firestore-types'
import { containerColor, dynamic_bottom_tab_Height, textColor } from '../lib/StyleLib';

const screenWidth = Dimensions.get("window").width;

interface Props{
    route:any
    navigation:any
}

const MyRewards:React.FC<Props> = ({route, navigation}) => {
    const globalContext = useContext<GlobalContextInterfaceAsReducer>(GlobalContext);
    const mainContext = useContext<MainContextInterface>(MainContext);
    const [rewards,setRewards] = useState<any>({});
    const [acc,setAcc] = useState<number>(-1);
    const [seed, setSeed] = useState<number>();

    useEffect(() => {
        db.collection('globalEnv').doc('ad_controller').get().then((doc:DocumentSnapshot)=>{
            const data = doc.data()!;
            let object = {reward_1:data.video_reward_1 ?? 750,reward_70:data.video_reward_70 ?? 100}
            setRewards(object);
        }).catch(console.log)
        const ref = db.collection('users').doc(globalContext.state.auth.userEmail!)
        const unsubscribe = ref.onSnapshot((doc:DocumentSnapshot)=>{
            const data = doc.data()!;
            console.log("Snapshot triggered in - MyRewards.js ");
            setSeed(data.seed);
            setAcc(data.reward_acc ?? 0);
        })
        return unsubscribe;
    }, [])

    return(
        <View style={{alignItems:"center",marginTop:15, height:globalContext.state.env.screenHeight-dynamic_bottom_tab_Height(mainContext.adblock)-15}}>
            <View style={{flex:1}}>
                <ScrollView>
                    <View style={{width: Dimensions.get("window").width-40, height:"auto", padding:5, borderRadius:10, backgroundColor:containerColor(globalContext.state.env.darkmode!),marginVertical:5}}>
                        <Text style={{color:textColor(globalContext.state.env.darkmode!),fontSize:17,fontWeight:"700",marginBottom:5}}>{I18n.t('p_my_rewards._1')}</Text>
                        <Text style={{color:textColor(globalContext.state.env.darkmode!),fontSize:15,fontWeight:"500",marginLeft:5}}>{I18n.t('p_my_rewards._1_1')}</Text>
                        <Text style={{color:textColor(globalContext.state.env.darkmode!),fontSize:15,fontWeight:"500",marginLeft:5}}>- {I18n.t('p_my_rewards._1_2')} {rewards.reward_1 ?? 750} $</Text>
                        <Text style={{color:textColor(globalContext.state.env.darkmode!),fontSize:15,fontWeight:"500",marginLeft:5}}>- {I18n.t('p_my_rewards._1_3')} {rewards.reward_70 ?? 100} $</Text>
                        <Text style={{color:textColor(globalContext.state.env.darkmode!),fontSize:17,fontWeight:"700",marginVertical:5}}>{I18n.t('my_rewards')}</Text>
                        <Text style={{color:textColor(globalContext.state.env.darkmode!),fontSize:15,fontWeight:"500",marginLeft:5}}>- {I18n.t('p_my_rewards._1_4')} {acc ?? -2} $</Text>
                        <Text style={{color:textColor(globalContext.state.env.darkmode!),fontSize:15,fontWeight:"500",marginLeft:5}}>- {I18n.t('p_my_rewards._1_5')} {seed} $</Text>
                        <View style={{height:10}}/>
                    </View>
                    <AdMobRewardedComponent user={globalContext.state.auth.userEmail} width={screenWidth-40} height={50} borderRadius={10} show_text textSize={20}/>
                </ScrollView>
            </View>
        </View>
    )
}

export default MyRewards
