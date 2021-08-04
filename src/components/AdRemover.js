import React, {useEffect, useState} from 'react';
import { StyleSheet, Text, View, Alert, TouchableOpacity, Dimensions } from 'react-native';
import { db } from '../../firebase';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from "react-native-appearance";

const AdRemover = ({route, navigation}) => {
    const scheme = useColorScheme();
    const { email, boughtPro } = route.params;
    const [seed, setSeed] = useState(0);
    const [totalbuyin, setTotalbuyin] = useState();
    const [totalbuyin_const, setTotalbuyin_const] = useState();
    const ref = db.collection('users').doc(email);
    const [clicked, setClicked] = useState(false);
    const [proCommission, setProCommission] = useState(0.3);

    useEffect(() => {
        if(boughtPro){
            navigation.goBack();
        }else{
            db.collection('globalEnv').doc("commission").get().then((doc)=> {
                if(doc.exists){
                    setProCommission(doc.data().as_percentage_pro);
                }else{
                    console.log("Warning - globalEnv collection not found in db !");
                }
            });
        }
        const unsubscribe = ref.onSnapshot((doc)=>{
                setSeed(doc.data().seed);
                setTotalbuyin(doc.data().totalbuyin);
                setTotalbuyin_const(doc.data().totalbuyin_constant);
        })
        return unsubscribe;
    },[]);

    const bool_isDarkMode = () => {
        return scheme === "dark";
    }
    const bgColor = () => {
        return bool_isDarkMode() ? "#000000":"#FFFFFF";
    }
    const containerColor = () => {
        return bool_isDarkMode() ? "#2e2e2e":"#e8e8e8";
    }
    const textColor = () => {
        return bool_isDarkMode() ? "#FFFFFF":"#000000";
    }
    const tryUpgrade = () => {
        Alert.alert(
            "Information","Upgrade cost : 3000 VUSD",
        [
            { text: "Confirm", onPress: () =>  upgrade() },
            { text: "Cancel", style: "cancel"}
        ]
        );
    }
    const notEnoughSeed = () => {
        Alert.alert(
            "Error","Not enough VUSD.",
        [
            { text: "Confirm"}
        ]
        );
    }
    const triggerUpgrade = async () => {
        let newSeed = seed - 3000;
        let newTotalBuyin = totalbuyin - 3000;
        let newTotalBuyin_const = totalbuyin_const - 3000;
        return ref
            .update({
                boughtPro: true,
                pro: true,
                seed: newSeed,
                totalbuyin : newTotalBuyin,
                totalbuyin_constant : newTotalBuyin_const
            })
            .then(()=> {
                ref
                .collection("history")
                .add({
                    type: "Spent",
                    target: "VUSD",
                    targetName: "Virtual USD",
                    quantity: 3000,
                    fiat: -1,
                    price: 1,
                    imgsrc: "https://firebasestorage.googleapis.com/v0/b/cointracer-2fd86.appspot.com/o/usd_custom.png?alt=media&token=857456bf-e06b-4fc6-95a2-72f1d69212dc",
                    orderNum: Number(new Date().getTime()).toString().substring(0, 10),
                    time: simplifyDate(new Date())
                })
                .then(()=>{
                    navigation.goBack();
                })
                .catch((err) => {console.log(err);})
            })
            .catch((err)=>{console.log(err);})
    }
    const upgrade = () => {
        if(boughtPro){navigation.goBack();return;}
        if(seed < 2000){console.log("seed not enough : ",seed);notEnoughSeed();return;}
        else{
            setClicked(true);
            triggerUpgrade();
        }
    }

    const simplifyDate = (i) => {
        let j = i.toString();
        let k = j.split(" ");
        let l = k.slice(1, 5);
        l[3] = l[3].substring(0,5);
        return l.join(' ');
    }

    return (
        <SafeAreaView style={{flex:1,backgroundColor:bgColor(),alignItems:"center"}}>
            <View>
                <View style={{width: Dimensions.get("window").width-40, height:"auto", padding:5, borderRadius:10, backgroundColor:containerColor(),marginVertical:5}}>
                    <Text style={{color:textColor(),fontSize:17,fontWeight:"700"}}>Advantages</Text>
                    <Text style={{color:textColor(),fontSize:15,fontWeight:"500",marginLeft:5}}>- AD Free means removal of all banner and interstitial ads. Rewarded ads will always be available to earn more VUSD any time.</Text>
                    <Text style={{color:textColor(),fontSize:15,fontWeight:"500",marginLeft:5}}>- lower commission fees ({proCommission}%)</Text>
                    <Text style={{color:textColor(),fontSize:17,fontWeight:"700",marginTop:5}}>Reminder</Text>
                    <Text style={{color:textColor(),fontSize:15,fontWeight:"500",marginLeft:5}}>- Upgrade cost : 2500 VUSD.</Text>
                    <Text style={{color:textColor(),fontSize:15,fontWeight:"500",marginLeft:5}}>- Spending your VUSD does not affect your PNL negatively, as the upgrade cost is not considered as an investment.</Text>
                    <Text style={{color:textColor(),fontSize:15,fontWeight:"500",marginLeft:5}}>- This purcahse is irreversible.</Text>
                </View>
                <TouchableOpacity disabled={clicked} style={{alignSelf:"center", height: 45, width: Dimensions.get("window").width-40,justifyContent:"center", alignItems:"center",backgroundColor:"#81d466",borderRadius:10}} onPress={()=>tryUpgrade()}>
                    <Text style={{fontSize:17,color:"white",fontWeight:"bold"}}>Upgrade</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}

export default AdRemover

const styles = StyleSheet.create({})
