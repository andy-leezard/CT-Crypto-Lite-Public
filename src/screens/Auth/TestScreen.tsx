import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Platform, Alert, ImageBackground } from 'react-native';
import { Button, Image } from 'react-native-elements';
import Env from '../../env.json'
import axios from 'axios';
import { db } from '../../../firebase';
import { brandColor, subTextColor } from '../../lib/StyleLib';

interface Props {
    _arr?:any[]
}

const TestScreen:React.FC<Props> = ({ _arr }) => {
    const [email, setEmail] = useState<string>('');
    const [redoInfo, setRedoInfo] = useState<boolean>(false);
    const [msg_error, setmsg_error] = useState<string>('Incorrect information');
    const [processing, setProcessing] = useState<boolean>(false);

    const localTest = () => {
        setProcessing(true);
        if(!_arr){return;}
        db.collection('users').doc(email.toLowerCase()).collection('wallet').where("quantity", ">", 0).get()
            .then((qs)=>{
                let changes = 0;
                qs.docs.forEach((i:any) => {
                    let onceonly = _arr.filter(j => i.id === j.name);
                    if(onceonly.length>0){
                        let coin = onceonly[0];
                        let has_appre = i.appre ?? false;
                        let has_avg_price = i.avg_price ?? false;
                        console.log(coin.name,"has appre ? : ", has_appre);
                        console.log(coin.name,"has avg_price ? : ", has_avg_price);
                        if(has_appre===false&&has_avg_price===false){
                        const ref = db.collection('users').doc(email.toLowerCase()).collection('wallet').doc(coin.name);
                        ref.get().then((doc:any)=>{
                            let q = doc.data().quantity;
                            let price = coin.current_price*1.01;
                            changes++;
                            ref.update({
                            appre: q*price,
                            avg_price: price,
                            symbol: coin.symbol
                            })
                        }).catch((e)=>{
                            console.log("error 2");
                            handleError(e);
                        })
                        console.log(`Refreshed [${coin.name}] wallet for user : ${email.toLowerCase()}`);
                        }
                    }
                });
                console.log(`Iterated all wallets, refreshed ${changes} wallets for user : ${email.toLowerCase()}`);
                Alert.alert(
                    "C'est bon chef",
                    `utilisateur [${email.toLowerCase()}] a été mis à jour`,
                [{ text: "OK"},]);
            })
            .catch((e)=>{
                console.log("error 1");
                handleError(e);
            })
            .finally(()=>{
                setProcessing(false);
            });
    }

    const testAPI = async ():Promise<void> => {
        const withBody = Boolean(email.length>0);
        //localTest();
        //const function_address = 'https://us-central1-project.cloudfunctions.net/deleteuser';
        //const function_address = 'https://us-central1-project.cloudfunctions.net/optimizeHistory';
        //const function_address = 'https://us-central1-project.cloudfunctions.net/whatsMyPIN';
        //const function_address = 'https://us-central1-project.cloudfunctions.net/pushCoinData';
        const function_address = 'https://us-central1-project.cloudfunctions.net/testHTTP';
        setProcessing(true);
        const body = withBody ? { userEmail: email }:{}
        try {
            //const response:any = await fetch(function_address, { method:"POST", body: JSON.stringify(body) })
            const response = await axios.post(function_address, body)
            // response is an object
            console.log(response.data);
        }catch(error){
            console.log("Error occurred while testing API");handleError(error);
        }finally{
            setProcessing(false);
        }
    }
    const handleError = (e:any):void => {
        setRedoInfo(true);//console.log(e);
        e.message ? setmsg_error(e.message):setmsg_error(JSON.stringify(e));
    }

    return (
        <ImageBackground source={require('../../assets/bg/bg.png')} style={[styles.container,{width:"100%",height:"100%"}]}>
            <View style={{alignItems: 'center', justifyContent: 'center',}}>
                <View>
                    <Image
                    source={require('../../assets/icon.png')}
                    style={[{width:40,height:40,marginBottom:5,marginTop:100,},(Platform.OS === 'ios') && {borderRadius:5}]}
                    />
                </View>
                <Text style={{color:brandColor(true),marginBottom:40,fontSize:20,fontWeight:"bold"}}>Developer Tool</Text>
                <View style={{width:300, alignItems:"center"}}>
                    {redoInfo && (<View style={{backgroundColor:"rgba(0,0,0,0.5)",borderWidth:1,borderColor:"#FDD7D8",borderRadius:5,padding:5,marginBottom:10}}>
                        <Text style={{color:"#ffffff",fontSize:15,fontWeight:"700"}}>{msg_error}</Text>
                    </View>)}
                    <TextInput
                        style={[styles.input,styles.darkTheme]}
                        autoFocus={true}
                        placeholder="Email"
                        placeholderTextColor={subTextColor(true)}
                        value={email}
                        onChangeText={setEmail}
                        maxLength = {32}
                    />
                </View>
                {processing ? (
                    <View style={styles.btn}>
                        <Button disabled={true} buttonStyle={{backgroundColor:"#1DC08B",borderRadius:5}} titleStyle={{color: "#ffffff", fontSize: 16, fontWeight:"bold"}} title="processing"/>
                    </View>
                    ):(
                    <View style={styles.btn}>
                        <Button buttonStyle={{backgroundColor:"#1DC08B",borderRadius:5}} titleStyle={{color: "#ffffff", fontSize: 16, fontWeight:"bold"}} title="test" onPress={testAPI}/>
                    </View>
                )}
                <View>
                    <Text style={{color:brandColor(true),fontSize:14,fontWeight:"600",marginTop:20, alignSelf:"center"}}>© 2021 | Developed by Andy Lee</Text>
                    <Text style={{color:brandColor(true),fontSize:12,fontWeight:"600",marginTop:10, alignSelf:"center"}}>{Env.currentVersion}</Text>
                </View>
            </View>
        </ImageBackground>
    )
}

export default TestScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: "flex-start",
    },
    input: {
        paddingHorizontal: 10,
        height: 40,
        width: 300,
        margin: 12,
        borderWidth: 1,
        borderRadius: 15,
        fontSize:20,
    },
    btn: {
        marginBottom: 15,
        marginTop: 5,
        width:160,
        height:40,
    },
    darkTheme: {
        color: "#FFFFFF",
        backgroundColor: "#333333"
    },
    lightTheme: {
        color: "#000000",
        backgroundColor: "#FFFFFF"
    }
})
