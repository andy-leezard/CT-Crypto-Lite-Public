import React, { useState, useContext } from 'react';
import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity, Dimensions, Alert, Modal, Pressable, Platform } from 'react-native';
import { PieChart } from "react-native-chart-kit";
import { db } from '../../firebase';
import i18n from 'i18n-js';
import { GlobalContext, MainContext, PortfolioContext, TradingContext } from '../StateManager';
import { Coin, Coin_Asso, CT_Wallet, GlobalContextInterfaceAsReducer, MainContextInterface, Obj, TradingContextInterfaceAsReducer } from '../lib/Types';
import { autoRound, avoidScientificNotation_withSign, dynamicRound, isInList, isStableCoin, numberWithCommas } from '../lib/FuncLib';
import * as StyleLib from '../lib/StyleLib';
import { SwipeablePanel } from 'rn-swipeable-panel';
import { Enum_coin_actions } from '../lib/Reducers';
import Trading from './Trading';
import { removeFromArray } from '../lib/JSFuncLib';

const screenWidth = Dimensions.get("window").width;
const width = screenWidth-20;

interface Props{
    route:any
    navigation:any
}

const chartConfig = {
    backgroundGradientFrom: '#000000',
    backgroundGradientTo: '#000000',
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`
}

const Portfolio:React.FC<Props> = ({route,navigation}) => {
    const globalContext = useContext<GlobalContextInterfaceAsReducer>(GlobalContext);
    const mainContext = useContext<MainContextInterface>(MainContext);
    const tradingContext = useContext<TradingContextInterfaceAsReducer>(TradingContext);
    const portfolioContext = useContext<{portfolio:Obj}>(PortfolioContext);
    const [viewStatus,setViewStatus] = useState<number>(0);
    const [modalVisible, setModalVisible] = useState(false);
    const [touchedCoin, setTouchedCoin] = useState<Coin|null>(null)

    const handleModalClose = () => {
            (Platform.OS === 'android') && tradingContext.dispatch({type:Enum_coin_actions.INIT});
            setModalVisible(false);
    }
    const touchCoin = (coin:Coin_Asso) => {
        setTouchedCoin({
            name:coin.name,
            image:coin.img,
            current_price:coin.crntPrice,
            symbol:coin.id,
            market_cap_rank:coin.rank,
            id:coin.url
        });
        setModalVisible(true);
    }

    // Start - panel
    const [panelProps, setPanelProps] = useState({
        fullWidth: true,
        openLarge: false,
        showCloseButton: true,
        onClose: () => closePanel(),
        onPressCloseButton: () => closePanel(),
        // ...or any prop you want
    });
    const [isPanelActive, setIsPanelActive] = useState(false);

    const openPanel = () => {
        tradingContext.dispatch({type:Enum_coin_actions.SET,payload:touchedCoin!});
        if(Platform.OS === 'ios'){
            setModalVisible(false);
            setIsPanelActive(true);
        }
    };

    const closePanel = () => {
        tradingContext.dispatch({type:Enum_coin_actions.INIT});
        setIsPanelActive(false);
    };
    // End - panel

    const tryDeleteDelisted = (i:string,s:string) => {
        Alert.alert(
            i18n.t('delisted_crypto'),
            `${i} (${s}) ${i18n.t('delisted_er1')}\n${i18n.t('delisted_er2_pre')} ${s} ${i18n.t('delisted_er2_suf')}\n${i18n.t('delisted_er3')}`,
        [
            { text: i18n.t('confirm'), onPress: () =>  deleteDelisted(i) },
            { text: i18n.t('cancel'), style: "cancel"}
        ]
        );
    }

    const deleteDelisted = (i:string) => {
        db.collection('users').doc(globalContext.state.auth.userEmail!).collection('wallet').doc(i).delete().then(()=>{
            Alert.alert(
                i18n.t('notification'),
                `${i18n.t('delisted_requested_pre')} ${i} ${i18n.t('delisted_requested_suf')}`,
            [{ text: i18n.t('ok')},]);
            console.log(i," wallet has been deleted at : "+new Date().toLocaleString());
        }).catch((e)=>{
            Alert.alert(
                i18n.t('error'),
                e,
            [{ text: i18n.t('ok')},]);
        })
    }

    const triggerUpdatePNL = () =>{
        Alert.alert(
            i18n.t('notification'),i18n.t('init_pnl'),
        [
            { text: i18n.t('confirm'), onPress: () =>  updatePNL() },
            { text: i18n.t('s_cancel'), style: "cancel"}
        ]
        );
    }
    const updatePNL = () => {
        let dateobj = Number(new Date().getTime());
        const directory = db.collection('users').doc(globalContext.state.auth.userEmail!);
        directory.update({totalbuyin: portfolioContext.portfolio.totalAppreciation,pnldate: dateobj});
    }

    const toggleViewStatus = () => {
        (viewStatus<2) ? setViewStatus(viewStatus+1):setViewStatus(0);
    }

    const conditionalRender = (i:any,degree:number,length:number) => {
        return (degree>=viewStatus) ? i:new String("*").repeat(length);
    }
    const displayChange = (i:Coin_Asso) => {
        return dynamicRound((i.crntPrice/((i.avg_price ?? i.crntPrice))-1)*100,2)
    }
    const toggleRegisterFavorite = async(name:string) => {
        let tempo = [...mainContext.user.fav];
        (isInList(tempo,name)) ? tempo = removeFromArray(tempo,name) : tempo.push(name);
        await db.collection('users').doc(globalContext.state.auth.userEmail!).update({favorites: tempo,});
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
                    {(touchedCoin && !tradingContext.state) &&
                        <View style={styles.modalView}>
                        <View style={{marginLeft:6,justifyContent:"center",width:38,height:38,borderRadius:8,backgroundColor:"white",alignItems:"center"}}>
                            <Image
                                source={{uri:touchedCoin.image}}
                                style={{width:32,height:32}}
                            />
                        </View>
                        {isStableCoin(touchedCoin.name) ? (
                            <>
                            <Text style={{textAlign: "center"}}>{touchedCoin.name} ({touchedCoin.symbol.toUpperCase()})</Text>
                            <Text style={{marginBottom: 15, textAlign: "center"}}>({i18n.t('stablecoin')})</Text>
                            </>
                            ):(
                            <Text style={{marginBottom: 15, textAlign: "center"}}>{touchedCoin.name} ({touchedCoin.symbol.toUpperCase()})</Text>
                        )}
                        <Pressable
                            style={[styles.button, {backgroundColor: "#2196F3",marginBottom:15}]}
                            onPress={() => toggleRegisterFavorite(touchedCoin.name)}
                        >
                        <Text style={styles.textStyle}>
                            {isInList(mainContext.user.fav,touchedCoin.name)?"Remove from favorites":"Add to favorites"}
                        </Text>
                        </Pressable>
                        {!isStableCoin(touchedCoin.name) &&
                            <Pressable
                                style={[styles.button, {backgroundColor: "#2196F3"}]}
                                onPress={openPanel}
                            >
                            <Text style={styles.textStyle}>{i18n.t('buy')}/{i18n.t('sell')}</Text>
                            </Pressable>
                        }
                        </View>
                    }
                    {tradingContext.state &&
                        <View style={styles.modalView_Trading}>
                            <Trading/>
                        </View>
                    }
            </View>
        </Modal>
    )

    return (
        <View style={{backgroundColor:StyleLib.bgColor(globalContext.state.env.darkmode!),height:globalContext.state.env.screenHeight-StyleLib.dynamic_bottom_tab_Height(mainContext.user.adblock)}}>
            <View style={{width:width, borderRadius:10, borderWidth:3, borderColor:StyleLib.containerRadiusColor_bis(globalContext.state.env.darkmode!), backgroundColor:StyleLib.containerColor_bis(globalContext.state.env.darkmode!), padding:10,marginBottom:10,marginTop:10,alignSelf:"center"}}>
                <TouchableOpacity style={{alignSelf:"center"}} onPress={()=>toggleViewStatus()}>
                    <Text style={{position:"absolute",alignSelf:"flex-start",color:StyleLib.textColor(globalContext.state.env.darkmode!),fontSize:16,marginBottom:10,fontWeight:"bold",marginLeft:10}}>{i18n.t('tot_value')} : ${conditionalRender(portfolioContext.portfolio.totalAppreciation,0,6)} ({i18n.t('fiat')}:{conditionalRender((dynamicRound((mainContext.user.seed/portfolioContext.portfolio.totalAppreciation)*100,2)),1,2)}%)</Text>
                    <View style={{position:"absolute",alignSelf:"flex-end"}} >
                        <View style={{width:30,height:25,borderRadius:5,backgroundColor:"#CBCBCB",justifyContent:"center",alignItems:"center"}}>
                            {(viewStatus===0) && <Image source={require("../assets/icons/1x/view.png")} style={{width:20,height:20,tintColor:"#40B2AB"}}/>}
                            {(viewStatus===1) && <Image source={require("../assets/icons/1x/hide.png")} style={{width:20,height:20,tintColor:"#2D7E71"}}/>}
                            {(viewStatus===2) && <Image source={require("../assets/icons/1x/hide.png")} style={{width:20,height:20,tintColor:"#D65F3E"}}/>}
                        </View>
                    </View>
                    {(portfolioContext.portfolio.piedata != undefined) && (
                    <View style={{marginTop:8}}>
                    <PieChart
                        width={width-20}
                        height={200}
                        data={portfolioContext.portfolio.piedata}
                        accessor="appreciation"
                        backgroundColor="transparent"
                        paddingLeft="40"
                        chartConfig={chartConfig}
                    />
                    </View>
                    )}
                </TouchableOpacity>
            </View>
            {/*onPress={ toggle history }*/}
            <View style={{flex:1,width:width,marginBottom:5,alignSelf:"center",backgroundColor:StyleLib.containerColor_bis(globalContext.state.env.darkmode!),borderRadius:10}}>
                <ScrollView>
                    <View style={{alignItems:"center"}}>
                        <TouchableOpacity onPress={()=>navigation.navigate('Stack_History')}>
                            <View style={{flexDirection:"row",justifyContent:"space-between",borderWidth:2,borderRadius:10,borderColor:StyleLib.containerRadiusColor_bis(globalContext.state.env.darkmode!),backgroundColor:StyleLib.containerColor_bis(globalContext.state.env.darkmode!), width:width-20, minHeight:50,padding:5,marginTop:10}}>
                                    <View style={{flexDirection:"row", width:((width/2)-15), alignItems:"center"}}>
                                        <Image source={require("../assets/icons/1x/Analytic.png")} style={{width:32,height:32,tintColor:"#40AAF2",marginLeft:3}}/>
                                        <View style={{flexDirection:"column"}}>
                                            <Text style={{fontSize:15,fontWeight:"bold",color:StyleLib.textColor(globalContext.state.env.darkmode!),marginLeft:11}}>{i18n.t('my_pnl')}</Text>
                                            <Text style={{fontSize:15,fontWeight:"bold",color:StyleLib.subTextColor_ter(globalContext.state.env.darkmode!),marginLeft:11}}>{i18n.t('all_time')}</Text>
                                        </View>
                                    </View>
                                    <View style={{flexDirection:"column", width:((width/2)-15)}}>
                                        {(portfolioContext.portfolio.pnl_const>=0) ? (
                                            <Text style={[styles.changetext, viewStatus>1 ? (globalContext.state.env.darkmode? styles.changetext_neutral_dark:styles.changetext_neutral_light):{color:StyleLib.buyColor(globalContext.state.env.darkmode!)}]}>{viewStatus<2 && "+"}{conditionalRender(portfolioContext.portfolio.pnl_const,1,2)}%</Text>
                                            ):(
                                            <Text style={[styles.changetext, viewStatus>1 ? (globalContext.state.env.darkmode? styles.changetext_neutral_dark:styles.changetext_neutral_light):{color:StyleLib.sellColor(globalContext.state.env.darkmode!)}]}>{conditionalRender(portfolioContext.portfolio.pnl_const,1,2)}%</Text>
                                        )}
                                        {(portfolioContext.portfolio.pnl_const>=0) ? (
                                            <Text style={globalContext.state.env.darkmode? styles.changetext_neutral_dark:styles.changetext_neutral_light}>{viewStatus<1 && "+"} ${conditionalRender(numberWithCommas(dynamicRound(portfolioContext.portfolio.totalAppreciation-mainContext.user.totalbuyin_const,2)),0,6)}</Text>
                                        ):(
                                            <Text style={globalContext.state.env.darkmode? styles.changetext_neutral_dark:styles.changetext_neutral_light}>{viewStatus<1 && "-"} ${conditionalRender(numberWithCommas(Math.abs(dynamicRound(portfolioContext.portfolio.totalAppreciation-mainContext.user.totalbuyin_const,2))),0,6)}</Text>
                                        )}
                                    </View>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={triggerUpdatePNL}>
                            <View style={{flexDirection:"row",justifyContent:"space-between",borderWidth:2,borderRadius:10,borderColor:StyleLib.containerRadiusColor_bis(globalContext.state.env.darkmode!),backgroundColor:StyleLib.containerColor_bis(globalContext.state.env.darkmode!), width:width-20, minHeight:50,padding:5,marginTop:10}}>
                                <View style={{flexDirection:"row", width:((width/2)-15), alignItems:"center"}}>
                                    <Image source={require("../assets/icons/1x/Analytic.png")} style={{width:32,height:32,tintColor:"#40AAF2",marginLeft:3}}/>
                                    <View style={{flexDirection:"column"}}>
                                        <Text style={{fontSize:15,fontWeight:"bold",color:StyleLib.textColor(globalContext.state.env.darkmode!),marginLeft:11}}>{i18n.t('my_dy_pnl')}</Text>
                                        <Text style={{fontSize:15,fontWeight:"bold",color:StyleLib.subTextColor_ter(globalContext.state.env.darkmode!),marginLeft:11}}>{i18n.t('since_pre')} {(typeof mainContext.user.pnldate == "number") ? new Date(mainContext.user.pnldate).toLocaleDateString(i18n.currentLocale()) : mainContext.user.pnldate} {i18n.t('since_suf')}</Text>
                                    </View>
                                    
                                </View>
                                <View style={{flexDirection:"column", width:((width/2)-15)}}>
                                    {(portfolioContext.portfolio.pnl>=0) ? (
                                        <Text style={[styles.changetext, viewStatus>1 ? (globalContext.state.env.darkmode? styles.changetext_neutral_dark:styles.changetext_neutral_light):{color:StyleLib.buyColor(globalContext.state.env.darkmode!)}]}>{viewStatus<2 && "+"}{conditionalRender(portfolioContext.portfolio.pnl,1,2)}%</Text>
                                        ):(
                                        <Text style={[styles.changetext, viewStatus>1 ? (globalContext.state.env.darkmode? styles.changetext_neutral_dark:styles.changetext_neutral_light):{color:StyleLib.sellColor(globalContext.state.env.darkmode!)}]}>{conditionalRender(portfolioContext.portfolio.pnl,1,2)}%</Text>
                                    )}
                                    {(portfolioContext.portfolio.pnl>=0) ? (
                                        <Text style={globalContext.state.env.darkmode? styles.changetext_neutral_dark:styles.changetext_neutral_light}>{viewStatus<1 && "+"} ${conditionalRender(numberWithCommas(dynamicRound(portfolioContext.portfolio.totalAppreciation-mainContext.user.totalbuyin,2)),0,6)}</Text>
                                    ):(
                                        <Text style={globalContext.state.env.darkmode? styles.changetext_neutral_dark:styles.changetext_neutral_light}>{viewStatus<1 && "-"} ${conditionalRender(numberWithCommas(Math.abs(dynamicRound(portfolioContext.portfolio.totalAppreciation-mainContext.user.totalbuyin,2))),0,6)}</Text>
                                    )}
                                </View>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={()=>navigation.navigate('Stack_History')}>
                            <View style={{flexDirection:"row",justifyContent:"space-between",borderWidth:2,borderRadius:10,borderColor:StyleLib.containerRadiusColor_bis(globalContext.state.env.darkmode!),backgroundColor:StyleLib.containerColor_bis(globalContext.state.env.darkmode!), width:width-20, minHeight:50,padding:5,marginTop:10}}>
                                    <View style={{flexDirection:"row", width:((width/2)-15), alignItems:"center"}}>
                                        <View style={{position:"absolute",width:38,height:38,borderRadius:8,backgroundColor:"white"}} />
                                        <Image source={require('../assets/icons/1x/usd_custom.png')} style={{width:32,height:32,marginLeft:3}}/>
                                        <View style={{flexDirection:"column",justifyContent:"space-between"}}>
                                            <Text style={{fontSize:18,fontWeight:"bold",color:StyleLib.textColor(globalContext.state.env.darkmode!),marginLeft:11}}>{i18n.t('my_wallet_pre')} VUSD {i18n.t('my_wallet_suf')}</Text>
                                            <Text style={{fontSize:12,fontWeight:"bold",color:StyleLib.subTextColor_ter(globalContext.state.env.darkmode!),marginLeft:11}}> {i18n.t('full_vusd')}</Text>
                                        </View>
                                    </View>
                                    <View style={{flexDirection:"column", width:((width/2)-15)}}>
                                        <Text style={{fontSize:15,fontWeight:"bold",color:StyleLib.textColor(globalContext.state.env.darkmode!),marginRight:5,textAlign:"right"}}>${conditionalRender(numberWithCommas(dynamicRound(mainContext.user.seed,2)),0,6)}</Text>
                                        <Text style={[globalContext.state.env.darkmode? styles.changetext_neutral_dark:styles.changetext_neutral_light,{fontSize:15,fontWeight:"bold",marginRight:5,textAlign:"right"}]}>{conditionalRender(mainContext.user.seed,0,6)} VUSD</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                        {portfolioContext.portfolio.associatedData.map((i:Coin_Asso, index:number)=>{
                            if(i.id != "VUSD"){
                                const change_percentage = displayChange(i);
                            return(
                                <TouchableOpacity key={index} onPress={()=>touchCoin(i)}>
                                    <View style={{flexDirection:"row",justifyContent:"space-between",borderWidth:2,borderRadius:10,borderColor:StyleLib.containerRadiusColor_bis(globalContext.state.env.darkmode!),backgroundColor:StyleLib.containerColor_bis(globalContext.state.env.darkmode!), width:width-20, minHeight:50,padding:5,marginTop:10}}>
                                        <View style={{flexDirection:"row", width:((width/2)-15), alignItems:"center"}}>
                                            <View style={{position:"absolute",width:38,height:38,borderRadius:8,backgroundColor:"white"}} />
                                            <Image source={{uri:i.img}} style={{width:32,height:32,marginLeft:3}}/>
                                            <View style={{flexDirection:"column",justifyContent:"space-between"}}>
                                                <Text style={{fontSize:18,fontWeight:"bold",color:StyleLib.textColor(globalContext.state.env.darkmode!),marginLeft:11}}>{i18n.t('my_wallet_pre')} {i.id} {i18n.t('my_wallet_suf')}</Text>
                                                {viewStatus<2 ? (<Text style={[{fontSize:13,fontWeight:"bold",marginLeft:11},change_percentage>=0?{color:StyleLib.buyColor(globalContext.state.env.darkmode!)}:{color:StyleLib.sellColor(globalContext.state.env.darkmode!)}]}> {(change_percentage>0&&viewStatus===0) && "+"}{conditionalRender(avoidScientificNotation_withSign(i.crntPrice - i.avg_price),0,4)}$ ({(change_percentage>0&&viewStatus<=1) && "+"}{conditionalRender(numberWithCommas(change_percentage),1,2)}%)</Text>
                                                ):(
                                                    <Text style={{fontSize:13,fontWeight:"bold",marginLeft:11,color:StyleLib.subTextColor_ter(globalContext.state.env.darkmode!)}}>current price : {avoidScientificNotation_withSign(i.crntPrice)}$</Text>
                                                )}
                                            </View>
                                        </View>
                                        <View style={{flexDirection:"column", width:((width/2)-15)}}>
                                            <Text style={{fontSize:15,fontWeight:"bold",color:StyleLib.textColor(globalContext.state.env.darkmode!),marginRight:5,textAlign:"right"}}>${conditionalRender(numberWithCommas(dynamicRound(i.quantity*i.crntPrice,2)),0,6)}</Text>
                                            <Text style={[globalContext.state.env.darkmode? styles.changetext_neutral_dark:styles.changetext_neutral_light,{fontSize:15,fontWeight:"bold",marginRight:5,textAlign:"right"}]}>{conditionalRender(numberWithCommas(autoRound(i.quantity)),0,6)} {i.id}</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            )}
                        })}
                        {portfolioContext.portfolio.delisted.map((i:CT_Wallet,index:number)=>{
                            return(
                                <TouchableOpacity key={index} onPress={()=>tryDeleteDelisted(i.name!,i.symbol)}>
                                    <View style={{flexDirection:"row",justifyContent:"space-between",borderWidth:2,borderRadius:10,borderColor:StyleLib.containerRadiusColor_bis(globalContext.state.env.darkmode!),backgroundColor:StyleLib.containerColor_bis(globalContext.state.env.darkmode!), width:width-20, minHeight:50,padding:5,marginTop:10}}>
                                        <View style={{flexDirection:"row", width:((width/2)-15), alignItems:"center"}}>
                                            <View style={{position:"absolute",width:38,height:38,borderRadius:8,backgroundColor:"white"}} />
                                            <Image source={{uri:i.img}} style={{width:32,height:32,marginLeft:3}}/>
                                            {("i.symbol".length<13) ? (<View style={{flexDirection:"column",justifyContent:"space-between"}}>
                                                <Text style={{fontSize:15,fontWeight:"bold",color:StyleLib.textColor(globalContext.state.env.darkmode!),marginLeft:11}}>{i18n.t('my_wallet_pre')} {i.symbol.toUpperCase()} {i18n.t('my_wallet_suf')}</Text>
                                                <Text style={{fontSize:14,fontWeight:"bold",color:StyleLib.textColor(globalContext.state.env.darkmode!),marginLeft:11}}>({i18n.t('delisted')})</Text>
                                            </View>):(<View style={{flexDirection:"column",justifyContent:"space-between"}}>
                                                <Text style={{fontSize:15,fontWeight:"bold",color:StyleLib.textColor(globalContext.state.env.darkmode!),marginLeft:11}}>{i18n.t('my_wallet_pre')} {i.symbol.toUpperCase()} {i18n.t('my_wallet_suf')} ({i18n.t('delisted')})</Text>
                                            </View>
                                            )}
                                        </View>
                                        <View style={{flexDirection:"column", width:((width/2)-15)}}>
                                            <Text style={{fontSize:15,fontWeight:"bold",color:StyleLib.textColor(globalContext.state.env.darkmode!),marginRight:5,textAlign:"right"}}>$ 0</Text>
                                            <Text style={[globalContext.state.env.darkmode? styles.changetext_neutral_dark:styles.changetext_neutral_light,{fontSize:15,fontWeight:"bold",marginRight:5,textAlign:"right"}]}>{conditionalRender(numberWithCommas(autoRound(i.quantity)),0,6)} {i.symbol.toUpperCase()}</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            )
                        })}
                        <View style={{height:10}}/>
                    </View>
                </ScrollView>
            </View>
            {modal}
            {Platform.OS === 'ios' &&
                <SwipeablePanel
                {...panelProps}
                    isActive={isPanelActive}
                    style={{
                        backgroundColor:StyleLib.containerColor_bis(globalContext.state.env.darkmode!),
                        bottom:-190,
                        paddingBottom:Boolean(mainContext.user.adblock || mainContext.adEnv.globalAdBlock) ? 100:160
                    }}
                    closeOnTouchOutside={true}
                    showCloseButton={false}
                    onlyLarge={true}
                >
                {tradingContext.state &&
                    <Trading />
                }
                </SwipeablePanel>
            }
        </View>
    )
}

export default Portfolio

const styles = StyleSheet.create({
    changetext:{
        fontSize:15,fontWeight:"bold",marginRight:5,textAlign:"right"
    },
    changetext_neutral_dark:{
        fontSize:15,fontWeight:"bold",color:"#CCCCCC",marginRight:5,textAlign:"right"
    },
    changetext_neutral_light:{
        fontSize:15,fontWeight:"bold",color:"#4A4A4A",marginRight:5,textAlign:"right"
    },


    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
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
    modalView_Trading: {
        maxWidth: "95%",
        maxHeight: "85%",
        backgroundColor: "white",
        borderRadius: 15,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        overflow: 'hidden',
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
    },
    modalText: {
        marginBottom: 15,
        textAlign: "center"
    }
})
