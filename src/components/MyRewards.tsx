import React, { useEffect, useState, useContext  } from 'react';
import { Text, View, ScrollView, Image, Alert, Modal, StyleSheet, Pressable, TextInput, FlatList } from 'react-native';
import { db } from '../../firebase';
import AdMobRewardedFC from './AdMobRewardedFC';
import I18n from 'i18n-js';
import { GlobalContext, MainContext } from '../StateManager';
import { GlobalContextInterfaceAsReducer, MainContextInterface } from '../lib/Types';
import { DocumentSnapshot } from '@firebase/firestore-types'
import { bgColor, containerColor, containerColor_bis, dynamic_bottom_tab_Height, textColor } from '../lib/StyleLib';
import { TouchableOpacity } from 'react-native-gesture-handler';
import * as Clipboard from 'expo-clipboard';
import Env from '../env.json';
import axios from 'axios';

interface Props{
    route:any
    navigation:any
}

type Referral = {
    id: string,
    memo: string,
    time: number,
}

const MyRewards:React.FC<Props> = ({route, navigation}) => {
    const globalContext = useContext<GlobalContextInterfaceAsReducer>(GlobalContext);
    const mainContext = useContext<MainContextInterface>(MainContext);
    const [modalVisible, setModalVisible] = useState(false);
    const [referral, setReferral] = useState<string>('');
    const [processing, setProcessing] = useState<boolean>(false);
    const [error_referral, setError_ref] = useState<string>('');
    const [my_referrals, setMy_referrals] = useState<Referral[]>([]);
    const [config_modalVisible, setConfig_ModalVisible] = useState(false);
    const [config_code, setConfig_code] = useState<string>('');
    const [list_modalVisible, setList_ModalVisible] = useState(false);
    const [keyword, setKeyword] = useState<string>('');

    const [currentItem, setCurrentItem] = useState<Referral|null>(null);
    const [note,setNote] = useState<string>('');

    const [render_referrals, setRenderReferrals] = useState<Referral[]>([]);

    const [rewardCode,setRewardCode] = useState<string>('');
    const [code_modalVisible, setCode_ModalVisible] = useState(false);

    const locale = I18n.currentLocale();

    const handleModalClose = () => {
        if(!processing){
            setModalVisible(false);
            setError_ref('');
            setReferral('');
        }
    }

    const config_handleModalClose = () => {
        if(!processing){
            setConfig_ModalVisible(false);
            setError_ref('');
            setConfig_code('');
        }
    }

    const list_handleModalClose = () => {
        if(currentItem!==null){
            setNote('');
            setCurrentItem(null);
        }else if(!processing){
            setList_ModalVisible(false);
            setKeyword('');
        }
    }

    const code_handleModalClose = () => {
        if(!processing){
            setCode_ModalVisible(false);
            setError_ref('');
            setRewardCode('');
        }
    }

    const addNote = (i:Referral) => {
        setCurrentItem(i);
    }

    const confirmNote = async() => {
        if(note.length ===0){
            Alert.alert(
                I18n.t('notification'),I18n.t('enter_text'),
            [{ text: I18n.t('ok')}]
            );
            return;
        }else{
            try{
                db.collection('users')
                .doc(globalContext.state.auth.userEmail!)
                .collection('referrals')
                .doc(currentItem!.id)
                .update({
                    memo:note
                })
                .then(()=>{
                    Alert.alert(
                        I18n.t('notification'),I18n.t('noted_added')+currentItem!.id,
                    [{ text: I18n.t('done')}]
                    );
                    setCurrentItem(null);
                    setNote('');
                })
            }catch(e:any){
                Alert.alert(
                    I18n.t('error'),e.message,
                [{ text: I18n.t('retry')}]
                );
            }
        }
    }

    const openUseReferral = () => {
        if(mainContext.user.referral_code !== ''){
            setModalVisible(true);
        }else{
            Alert.alert(
                I18n.t('notification'), I18n.t('ref_er1'),
            [{ text: I18n.t('ok'), onPress: () => setConfig_ModalVisible(true)},{ text: I18n.t('cancel'), style: 'cancel' }]
            );
        }
    }

    const copyToClipboard = () => {
        Clipboard.setString(mainContext.user.referral_code??'');
        Alert.alert(
            I18n.t('notification'),I18n.t('ref_clipboard')+(mainContext.user.referral_code??''),
        [{ text: I18n.t('ok'),}]
        );
    }

    const copyButtonColor = () => {
        return globalContext.state.env.darkmode ? "#2490BD":"#009cdb";
    }

    const useReferralButtonColor = () => {
        return globalContext.state.env.darkmode ? "#24BD8A":"#00bf7f";
    }

    const viewReferralButtonColor = () => {
        return globalContext.state.env.darkmode ? "#56BA60":"#00c213";
    }

    const useRewardCodeButtonColor = () => {
        return globalContext.state.env.darkmode ? "#eb7d6c":"#ff734d";
    }

    const iconBgColor = () => {
        return globalContext.state.env.darkmode ? "#FFFFFF":"#C9DFFF";
    }

    const itemBgColor = () => {
        return globalContext.state.env.darkmode ? "#CCCCCC":"#C9DFFF";
    }

    const placeHolderTextColor = () => {
        return globalContext.state.env.darkmode ? "#CCCCCC":"#FFFFFF";
    }

    const handleSetConfigCode = (input:string) => {
        if((input[input.length-1] ?? '') === ' '){
            return;
        }else{
            setConfig_code(input);
        }
    }

    const handleSetRewardCode = (input:string) => {
        if((input[input.length-1] ?? '') === ' '){
            return;
        }else{
            setRewardCode(input);
        }
    }

    const handleSetReferral = (input:string) => {
        if((input[input.length-1] ?? '') === ' '){
            return;
        }else{
            setReferral(input);
        }
    }

    const configure_code = async() => {
        if(config_code.length<4 || config_code.length>16){
            setError_ref(I18n.t('ref_er2'))
            return;
        }else{
            setProcessing(true);
            try{
                const duplicate = await db.collection('referrals').doc(config_code).get().then((doc:DocumentSnapshot)=>{return Boolean(doc.exists);})
                if(duplicate){
                    setError_ref(I18n.t('ref_er3'));
                }else{
                    const stage1 = () => {
                        return new Promise((resolve,reject)=>{
                            db.collection('referrals').doc(config_code).set({target:globalContext.state.auth.userEmail}).then(resolve).catch(reject);
                        })
                    }
                    const stage2 = () => {
                        return new Promise((resolve,reject)=>{
                            db.collection('users').doc(globalContext.state.auth.userEmail!).update({referral_code:config_code}).then(resolve).catch(reject);
                        })
                    }
                    Promise.all([stage1(), stage2()]).then(()=>{
                        setError_ref(I18n.t('ref_created'));
                    })
                }
            }catch(e:any){
                setError_ref(e.message);
            }finally{
                setProcessing(false);
            }
        }
    }

    const useRewardCode = async() => {
        if(rewardCode.length === 0){
            setError_ref(I18n.t('enter_code'));
            return;
        }else{
            setProcessing(true);
            const body = {
                userEmail: globalContext.state.auth.userEmail,
                code: rewardCode
            }
            try{
                const response = await axios.post(Env.cfapi_useCode, body)
                if(response.status === 200){
                    if(response.data === "ref/success"){
                        setError_ref('');
                        Alert.alert(
                            I18n.t('notification'),I18n.t('reward_code_success') + rewardCode,
                        [{ text: I18n.t('done'), onPress: () => code_handleModalClose()},{ text: I18n.t('continue'), onPress: () => setRewardCode('') }]
                        );
                    }else if(response.data === "ref/404"){
                        setError_ref(`${I18n.t('ref_er3')} : [${rewardCode}]`);
                    }else{
                        setError_ref(response.data);
                    }
                }else{
                    setError_ref(response.data);
                }
            }catch(error:any){
                setError_ref(error.message);
            }finally{
                setProcessing(false);
            }
        }
    }

    const useReferral = async() => {
        if(referral === mainContext.user.referral_code){
            setError_ref(I18n.t('ref_er4'));
            return;
        }else{
            setProcessing(true);
            try {
                let inferred_mail_address:string|null = null;
                const referral_is_legit = await db.collection('referrals').doc(referral).get().then((doc:DocumentSnapshot)=>{
                    if(doc.exists){
                        inferred_mail_address = doc.data()!.target
                        return true
                    }else{
                        return false
                    }
                })
                if(referral_is_legit && inferred_mail_address!==null){
                    const body = {
                        userEmail: globalContext.state.auth.userEmail,
                        referralEmail: inferred_mail_address,
                        userReferralCode: mainContext.user.referral_code,
                        referralCode: referral
                    }
                    const response = await axios.post(Env.cfapi_useReferral, body)
                    if(response.status === 200){
                        if(response.data === "ref/success"){
                            setError_ref('');
                            Alert.alert(
                                I18n.t('notification'),I18n.t('ref_success') + referral,
                            [{ text: I18n.t('done'), onPress: () => handleModalClose()},{ text: I18n.t('continue'), onPress: () => setReferral('') }]
                            );
                        }else if(response.data === "ref/duplicate"){
                            setError_ref(`${I18n.t('error')} : ${I18n.t('ref_er5_pre')} [${referral}] ${I18n.t('ref_er5_suf')}`);
                        }else if(response.data === "ref/404"){
                            setError_ref(`${I18n.t('ref_er3')} : [${referral}]`);
                        }else{
                            setError_ref(response.data);
                        }
                    }else{
                        setError_ref(response.data);
                    }
                }else{
                    setError_ref(I18n.t('ref_er3'));
                }
            }catch(error:any){
                setError_ref(error.message);
            }finally{
                setProcessing(false);
            }
        }
    }

    useEffect(() => {
        const ref = db.collection('users').doc(globalContext.state.auth.userEmail!).collection('referrals').orderBy("time", "desc");
        const unsubscribe = ref.onSnapshot((qs)=>{
            console.log("Referral snapshot triggered in - MyRewards.tsx ");
            const list:Referral[] = (qs.docs.map((order) => ({
                id: order.id,
                time: order.data().time,
                memo: order.data().memo,
            })));
            //console.log(list);
            setMy_referrals(list);
        }, (err) => {
            console.log(err);
            setMy_referrals([]);
        });
        return () => {
            unsubscribe();
        }
    }, [])

    useEffect(() => {
        if(my_referrals.length>0){
            let renderData = [...my_referrals]
            //console.log(my_referrals);
            if(keyword.length>0){
                renderData = renderData.filter(i => i.id.toLowerCase().includes(keyword.toLowerCase()) || i.memo.toLowerCase().includes(keyword.toLowerCase()));
            }
            setRenderReferrals(renderData);
        }
    }, [keyword,my_referrals])

    const Item:React.FC<{i:Referral}> = ({i}) => {
        const time = new Date(i.time);
        return(
            <TouchableOpacity style={{width:190,justifyContent:"center",alignItems:"center",borderRadius:10,backgroundColor:itemBgColor(),paddingVertical:5}} onPress={()=>addNote(i)}>
                <Text style={{fontWeight:"bold"}}>{i.id}</Text>
                <Text style={{fontWeight:"bold"}}>{time.toLocaleDateString(locale)}</Text>
                <Text>{(i.memo !=='' || currentItem!==null) ? i.memo:I18n.t('add_note')}</Text>
            </TouchableOpacity>
        )
    }

    const modal = (
        <Modal
            animationType="fade"
            hardwareAccelerated={true}
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
                handleModalClose();
            }}
        >
            <View style={[styles.centeredView]}>
                <Pressable style={{width:'100%',height:"100%",backgroundColor:'rgba(0,0,0,0.5)',position:'absolute'}} onPress={()=>handleModalClose()}/>
                    <View style={[styles.modalView,{backgroundColor:bgColor(globalContext.state.env.darkmode!)}]}>
                        <View style={{marginLeft:6,justifyContent:"center",width:38,height:38,borderRadius:8,backgroundColor:iconBgColor(),alignItems:"center",marginBottom:12}}>
                        <Image source={require('../assets/icons/1x/referral.png')} style={{width:20,height:20}} />
                        </View>
                        {(!processing && error_referral.length===0) &&
                            <Text style={{color:textColor(globalContext.state.env.darkmode!),fontSize:15,fontWeight:"500",marginBottom:12}}>{I18n.t('ref_reg')}</Text>
                        }
                        {(error_referral.length>0 && !processing) &&
                            (<View style={{backgroundColor:"rgba(0,0,0,0.5)",borderWidth:1,borderColor:"#FDD7D8",borderRadius:5,padding:5,marginBottom:12,maxWidth:210}}>
                                <Text style={{color:"#ffffff",fontSize:15,fontWeight:"700"}}>{error_referral}</Text>
                            </View>)
                        }
                        {!processing &&
                            <TextInput
                                style={[styles.input,{backgroundColor: globalContext.state.env.darkmode? '#333333':'rgba(0,0,0,0.25)'}]}
                                autoFocus={true}
                                placeholder='referral code'
                                placeholderTextColor={placeHolderTextColor()}
                                value={referral}
                                onChangeText={handleSetReferral}
                                maxLength = {16}
                            />
                        }
                        <Pressable
                            disabled={processing}
                            style={[styles.button, {backgroundColor: processing ? "#5c5c5c":"#2196F3",marginBottom:processing?0:15}]}
                            onPress={() => useReferral()}
                        >
                            <Text style={styles.textStyle}>{processing ? I18n.t('processing'):I18n.t('confirm')}</Text>
                        </Pressable>
                        {!processing &&
                        <Pressable
                            disabled={processing}
                            style={[styles.button, {backgroundColor: "#2196F3"}]}
                            onPress={() => handleModalClose()}
                        >
                            <Text style={styles.textStyle}>{I18n.t('cancel')}</Text>
                        </Pressable>
                        }
                    </View>
            </View>
        </Modal>
    )

    const modal_config = (
        <Modal
            animationType="fade"
            hardwareAccelerated={true}
            transparent={true}
            visible={config_modalVisible}
            onRequestClose={() => {
                handleModalClose();
            }}
        >
            <View style={[styles.centeredView]}>
            <Pressable style={{width:'100%',height:"100%",backgroundColor:'rgba(0,0,0,0.5)',position:'absolute'}} onPress={()=>config_handleModalClose()}/>
                <View style={[styles.modalView,{backgroundColor:bgColor(globalContext.state.env.darkmode!)}]}>
                    <View style={{marginLeft:6,justifyContent:"center",width:38,height:38,borderRadius:8,backgroundColor:iconBgColor(),alignItems:"center",marginBottom:12}}>
                    <Image source={require('../assets/icons/1x/pencil.png')} style={{width:20,height:20}} />
                    </View>
                    {(error_referral.length>0 && !processing && mainContext.user.referral_code==='') &&
                        (<View style={{backgroundColor:"rgba(0,0,0,0.5)",borderWidth:1,borderColor:"#FDD7D8",borderRadius:5,padding:5,marginBottom:12,maxWidth:210}}>
                            <Text style={{color:"#ffffff",fontSize:15,fontWeight:"700"}}>{error_referral}</Text>
                        </View>)
                    }
                    {(mainContext.user.referral_code==='') ? (
                        <>
                        {(error_referral.length===0) && (
                            <Text style={{color:"#ffffff",fontSize:15,fontWeight:"500",marginBottom:12}}>{I18n.t('ref_warning')}</Text>
                        )}
                        </>
                    ):(
                        <Text style={{color:"#ffffff",fontSize:15,fontWeight:"500",marginBottom:12}}>{error_referral}</Text>
                    )}
                    {(!processing && mainContext.user.referral_code==='') &&
                        <TextInput
                            style={[styles.input,{backgroundColor: globalContext.state.env.darkmode? '#333333':'rgba(0,0,0,0.25)'}]}
                            autoFocus={true}
                            placeholder='mycode123'
                            placeholderTextColor={placeHolderTextColor()}
                            value={config_code}
                            onChangeText={handleSetConfigCode}
                            maxLength = {16}
                        />
                    }
                    {(mainContext.user.referral_code==='') && (
                        <Pressable
                            disabled={processing}
                            style={[styles.button, {backgroundColor: processing ? "#5c5c5c":"#2196F3",marginBottom:15}]}
                            onPress={() => configure_code()}
                        >
                            <Text style={styles.textStyle}>{processing ? I18n.t('processing'):I18n.t('confirm')}</Text>
                        </Pressable>
                    )}
                    {!processing &&
                        <Pressable
                            disabled={processing}
                            style={[styles.button, {backgroundColor: "#2196F3",marginBottom:15}]}
                            onPress={() => config_handleModalClose()}
                        >
                            <Text style={styles.textStyle}>{(mainContext.user.referral_code==='') ? I18n.t('cancel'):I18n.t('done')}</Text>
                        </Pressable>
                    }
                </View>
            </View>
        </Modal>
    )

    const modal_list = (
        <Modal
            animationType="fade"
            hardwareAccelerated={true}
            transparent={true}
            visible={list_modalVisible}
            onRequestClose={() => {
                list_handleModalClose();
            }}
        >
            <View style={[styles.centeredView]}>
            <Pressable style={{width:'100%',height:"100%",backgroundColor:'rgba(0,0,0,0.5)',position:'absolute'}} onPress={()=>list_handleModalClose()}/>
                <View style={[styles.modalView,{backgroundColor:bgColor(globalContext.state.env.darkmode!)}]}>
                    <View style={{marginLeft:6,justifyContent:"center",width:38,height:38,borderRadius:8,backgroundColor:iconBgColor(),alignItems:"center",marginBottom:12}}>
                    <Image source={require('../assets/icons/1x/connections.png')} style={{width:20,height:20}} />
                    </View>
                    {currentItem ? 
                        (
                        <>
                        <Text style={{color:textColor(globalContext.state.env.darkmode!),fontSize:15,fontWeight:"500",marginBottom:12}}>{I18n.t('add_note')}</Text>
                        <Item i={{id:currentItem.id,memo:note,time:currentItem.time}}/>
                        <View>
                        <TextInput
                            style={{paddingHorizontal: 10,minHeight:40,width: 250,marginVertical: 12,borderRadius: 10,fontSize:20,
                                color: "#FFFFFF",backgroundColor: globalContext.state.env.darkmode? '#333333':'rgba(0,0,0,0.25)'}}
                            value={note}
                            onChangeText={setNote}
                            maxLength = {32}
                        />
                        <Image source={require("../assets/icons/1x/pencil.png")} style={{width:20,height:20,tintColor:"#519ABA",position:"absolute", right:10, top:20}}/>
                        </View>
                        <Pressable
                            style={[styles.button, {backgroundColor: "#2196F3",marginBottom:12}]}
                            onPress={() => confirmNote()}
                        >
                            <Text style={styles.textStyle}>{I18n.t('confirm')}</Text>
                        </Pressable>
                        </>
                        ):(
                        <>
                        <Text style={{color:textColor(globalContext.state.env.darkmode!),fontSize:15,fontWeight:"500",marginBottom:12}}>{I18n.t('my_refs')}</Text>
                        <View>
                            <TextInput
                                style={{paddingHorizontal: 10,height: 40,width: 200,marginBottom: 12,borderRadius: 10,fontSize:20,
                                    color: "#FFFFFF",backgroundColor: globalContext.state.env.darkmode? '#333333':'rgba(0,0,0,0.25)'}}
                                value={keyword}
                                onChangeText={setKeyword}
                                maxLength = {16}
                            />
                            <Image source={require("../assets/icons/1x/search.png")} style={{width:20,height:20,tintColor:"#519ABA",position:"absolute", right:10, top:10}}/>
                        </View>
                        <View style={{width:200,height:200,overflow:"scroll",backgroundColor:containerColor_bis(globalContext.state.env.darkmode!),borderRadius:10,padding:5,marginBottom:12,justifyContent:"center",alignItems:"center"}}>
                        {(render_referrals.length > 0) ?
                            (<FlatList
                                style={{borderRadius: 5}}
                                data={render_referrals}
                                renderItem={({item})=>(
                                    <Item i={item}/>
                                )}
                                keyExtractor={(item) => item.id}
                                onEndReachedThreshold={0.5}
                                initialNumToRender={10}
                            />
                            ):(
                            <Text style={{fontWeight:"bold",color:textColor(globalContext.state.env.darkmode!)}}>{I18n.t('no_result')}</Text>
                            )
                        }
                        </View>
                        </>
                        )
                    }
                    <Pressable
                        style={[styles.button, {backgroundColor: "#2196F3"}]}
                        onPress={() => list_handleModalClose()}
                    >
                        <Text style={styles.textStyle}>{I18n.t('cancel')}</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    )

    const modal_rewardCode = (
        <Modal
            animationType="fade"
            hardwareAccelerated={true}
            transparent={true}
            visible={code_modalVisible}
            onRequestClose={() => {
                code_handleModalClose();
            }}
        >
            <View style={[styles.centeredView]}>
                <Pressable style={{width:'100%',height:"100%",backgroundColor:'rgba(0,0,0,0.5)',position:'absolute'}} onPress={()=>code_handleModalClose()}/>
                    <View style={[styles.modalView,{backgroundColor:bgColor(globalContext.state.env.darkmode!)}]}>
                        <View style={{marginLeft:6,justifyContent:"center",width:38,height:38,borderRadius:8,backgroundColor:iconBgColor(),alignItems:"center",marginBottom:12}}>
                        <Image source={require('../assets/icons/1x/redeem-points.png')} style={{width:20,height:20}} />
                        </View>
                        {(!processing && error_referral.length===0) &&
                            <Text style={{color:textColor(globalContext.state.env.darkmode!),fontSize:15,fontWeight:"500",marginBottom:12}}>{I18n.t('enter_code')}</Text>
                        }
                        {(error_referral.length>0 && !processing) &&
                            (<View style={{backgroundColor:"rgba(0,0,0,0.5)",borderWidth:1,borderColor:"#FDD7D8",borderRadius:5,padding:5,marginBottom:12,maxWidth:210}}>
                                <Text style={{color:"#ffffff",fontSize:15,fontWeight:"700"}}>{error_referral}</Text>
                            </View>)
                        }
                        {!processing &&
                            <TextInput
                                style={{
                                    backgroundColor: globalContext.state.env.darkmode? '#333333':'rgba(0,0,0,0.25)',
                                    paddingHorizontal: 10,
                                    height: 40,
                                    width: 300,
                                    marginBottom: 12,
                                    borderRadius: 10,
                                    fontSize:20,
                                    color: "#FFFFFF",
                                }}
                                autoFocus={true}
                                placeholder='reward code'
                                placeholderTextColor={placeHolderTextColor()}
                                value={rewardCode}
                                onChangeText={handleSetRewardCode}
                                maxLength = {32}
                            />
                        }
                        <Pressable
                            disabled={processing}
                            style={[styles.button, {backgroundColor: processing ? "#5c5c5c":"#2196F3",marginBottom:processing?0:15}]}
                            onPress={() => useRewardCode()}
                        >
                            <Text style={styles.textStyle}>{processing ? I18n.t('processing'):I18n.t('confirm')}</Text>
                        </Pressable>
                        {!processing &&
                        <Pressable
                            disabled={processing}
                            style={[styles.button, {backgroundColor: "#2196F3"}]}
                            onPress={() => code_handleModalClose()}
                        >
                            <Text style={styles.textStyle}>{I18n.t('cancel')}</Text>
                        </Pressable>
                        }
                    </View>
            </View>
        </Modal>
    )

    return(
        <>
        <View style={{alignItems:"center", height:globalContext.state.env.screenHeight-dynamic_bottom_tab_Height(Boolean(mainContext.user.adblock || mainContext.adEnv.globalAdBlock))}}>
            <View style={{flex:1}}>
                <ScrollView>
                    <View style={{width: globalContext.state.env.screenWidth-40, height:"auto", padding:5, borderRadius:10, backgroundColor:containerColor(globalContext.state.env.darkmode!),marginVertical:5,justifyContent:"center",alignItems:"center"}}>
                        <Text style={{color:textColor(globalContext.state.env.darkmode!),fontSize:17,fontWeight:"700",marginVertical:5}}>{I18n.t('refs')}</Text>
                        <Text style={{color:textColor(globalContext.state.env.darkmode!),fontSize:15,fontWeight:"500",marginLeft:10,marginBottom:10}}>{I18n.t('refs_msg')}</Text>
                        {(mainContext.user.referral_code!=='') && (<Text style={{color:textColor(globalContext.state.env.darkmode!),fontSize:17,fontWeight:"700",marginLeft:10}}>{I18n.t('my_refcode')} : {mainContext.user.referral_code}</Text>)}
                        {(mainContext.user.referral_code!=='') && (
                            <TouchableOpacity style={{width: globalContext.state.env.screenWidth-60, marginVertical:10, padding:5, borderRadius:10, backgroundColor:copyButtonColor(),justifyContent:"center",alignItems:"center"}} onPress={()=>copyToClipboard()}>
                                <Image source={require('../assets/icons/1x/share.png')} style={{width:20,height:20,alignSelf:"center",marginBottom:5,tintColor:bgColor(globalContext.state.env.darkmode!)}} />
                                <Text style={{color:"white",fontSize:17,fontWeight:"700",marginBottom:5}}>{I18n.t('ref_share')}</Text>
                            </TouchableOpacity>
                        )}
                        {(mainContext.user.referral_code==='') && (
                            <TouchableOpacity style={{width: globalContext.state.env.screenWidth-60, marginVertical:10, padding:5, borderRadius:10, backgroundColor:copyButtonColor(),justifyContent:"center",alignItems:"center"}} onPress={()=>setConfig_ModalVisible(true)}>
                                <Image source={require('../assets/icons/1x/pencil.png')} style={{width:20,height:20,alignSelf:"center",marginBottom:5,tintColor:bgColor(globalContext.state.env.darkmode!)}} />
                                <Text style={{color:"white",fontSize:17,fontWeight:"700",marginBottom:5}}>{I18n.t('ref_create')}</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity style={{width: globalContext.state.env.screenWidth-60, marginVertical:10, padding:5, borderRadius:10, backgroundColor:useReferralButtonColor(),justifyContent:"center",alignItems:"center"}} onPress={()=>openUseReferral()}>
                            <Image source={require('../assets/icons/1x/referral.png')} style={{width:20,height:20,alignSelf:"center",marginBottom:5,tintColor:bgColor(globalContext.state.env.darkmode!)}} />
                            <Text style={{color:"white",fontSize:17,fontWeight:"700",marginBottom:5}}>{I18n.t('ref_use')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{width: globalContext.state.env.screenWidth-60, marginVertical:10, padding:5, borderRadius:10, backgroundColor:viewReferralButtonColor(),justifyContent:"center",alignItems:"center"}} onPress={()=>setList_ModalVisible(true)}>
                            <Image source={require('../assets/icons/1x/connections.png')} style={{width:20,height:20,alignSelf:"center",marginBottom:5,tintColor:bgColor(globalContext.state.env.darkmode!)}} />
                            <Text style={{color:"white",fontSize:17,fontWeight:"700",marginBottom:5}}>{I18n.t('ref_view')}</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{width: globalContext.state.env.screenWidth-40, height:"auto", padding:10, borderRadius:10, backgroundColor:containerColor(globalContext.state.env.darkmode!),marginVertical:5}}>
                        <Text style={{color:textColor(globalContext.state.env.darkmode!),fontSize:17,fontWeight:"700",marginBottom:5,marginLeft:5}}>{I18n.t('my_rewards')}</Text>
                        <Text style={{color:textColor(globalContext.state.env.darkmode!),fontSize:15,fontWeight:"500",marginLeft:15}}>- {I18n.t('p_my_rewards._1_4')} {mainContext.user.reward_acc ?? -2} $</Text>
                        <Text style={{color:textColor(globalContext.state.env.darkmode!),fontSize:15,fontWeight:"500",marginLeft:10,marginBottom:10}}>- {I18n.t('p_my_rewards._1_5')} {mainContext.user.seed} $</Text>
                        <Text style={{color:textColor(globalContext.state.env.darkmode!),fontSize:17,fontWeight:"700",marginVertical:5,marginLeft:5}}>{I18n.t('p_my_rewards._1')}</Text>
                        <Text style={{color:textColor(globalContext.state.env.darkmode!),fontSize:15,fontWeight:"500",marginLeft:10}}>{I18n.t('p_my_rewards._1_1')}</Text>
                        <Text style={{color:textColor(globalContext.state.env.darkmode!),fontSize:15,fontWeight:"500",marginLeft:15}}>- {I18n.t('p_my_rewards._1_2')} {mainContext.adEnv.rewards._1} $</Text>
                        <Text style={{color:textColor(globalContext.state.env.darkmode!),fontSize:15,fontWeight:"500",marginLeft:15}}>- {I18n.t('p_my_rewards._1_3')} {mainContext.adEnv.rewards._70} $</Text>
                        <View style={{marginTop:10}}>
                            <AdMobRewardedFC width={globalContext.state.env.screenWidth-60} show_text fontSize={20}/>
                        </View>
                    </View>
                    <View style={{width: globalContext.state.env.screenWidth-40, height:"auto", padding:5, borderRadius:10, backgroundColor:containerColor(globalContext.state.env.darkmode!),marginVertical:5,justifyContent:"center",alignItems:"center"}}>
                        <Text style={{color:textColor(globalContext.state.env.darkmode!),fontSize:17,fontWeight:"700",marginVertical:5}}>{I18n.t('reward_code')}</Text>
                        <TouchableOpacity style={{width: globalContext.state.env.screenWidth-60, marginVertical:10, padding:5, borderRadius:10, backgroundColor:useRewardCodeButtonColor(),justifyContent:"center",alignItems:"center"}} onPress={()=>setCode_ModalVisible(true)}>
                            <Image source={require('../assets/icons/1x/redeem-points.png')} style={{width:20,height:20,alignSelf:"center",marginBottom:5}} />
                            <Text style={{color:"white",fontSize:17,fontWeight:"700",marginBottom:5}}>{I18n.t('redeem_code')}</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{height:10}}/>
                </ScrollView>
            </View>
        </View>
        {modal_rewardCode}
        {modal_config}
        {modal_list}
        {modal}
        </>
    )
}

export default MyRewards

const styles = StyleSheet.create({
    input: {
        paddingHorizontal: 10,
        height: 40,
        width: 200,
        marginBottom: 12,
        borderRadius: 10,
        fontSize:20,
        color: "#FFFFFF",
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    modalView: {
        marginBottom: 80,
        marginHorizontal: 20,
        marginTop:20,
        borderRadius: 15,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    button: {
        minWidth:200,
        borderRadius: 10,
        padding: 10,
        elevation: 2
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
    }
})
