import React, { useState, useLayoutEffect, useEffect, useContext } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, Image, TextInput, Platform, FlatList, Modal, Pressable } from 'react-native';
import Trace_RenderGlobalChange from './Trace_RenderGlobalChange';
import { db } from '../../firebase';
import { useNavigation } from '@react-navigation/native';
import stablecoins from '../stablecoins.json';
import i18n from 'i18n-js';
import Loading from './Loading';
import { GlobalContext, MainContext, TradingContext } from '../StateManager';
import { isInList, avoidScientificNotation, displayVolume, isStableCoin } from '../lib/FuncLib';
import { StackNavigationProp } from '@react-navigation/stack';
import { PriceRoutes, PriceScreens } from '../screens/Routes';
import * as StyleLib from '../lib/StyleLib';
import { Coin, GlobalContextInterfaceAsReducer, MainContextInterface, TradingContextInterfaceAsReducer } from '../lib/Types';
import { removeFromArray } from '../lib/JSFuncLib';
import Picker_Android from './Widgets/Picker_Android';
import Picker_iOS from './Widgets/Picker_iOS';
import { SwipeablePanel } from 'rn-swipeable-panel';
import { Enum_coin_actions } from '../lib/Reducers';
import Trading from './Trading';

type ScreenProp = StackNavigationProp<PriceRoutes, PriceScreens>;

enum ViewMode{
    PRICES='Prices',
    TOPMOVERS='24H',
    CAPS='Market Cap'
}

const listTab:string[] = [
    ViewMode.PRICES,
    ViewMode.CAPS,
    ViewMode.TOPMOVERS,
];

const screenWidth = Dimensions.get("window").width;

const Prices:React.FC = () => {
    const globalContext = useContext<GlobalContextInterfaceAsReducer>(GlobalContext);
    const mainContext = useContext<MainContextInterface>(MainContext);
    const tradingContext = useContext<TradingContextInterfaceAsReducer>(TradingContext);
    const navigation = useNavigation<ScreenProp>();
    const [viewmode, setViewmode] = useState<string>(ViewMode.PRICES); //By default we want to show all status
    const [renderFavorites, setRenderFavorites] = useState<boolean>(false);
    const [keyword, setkeyword] = useState<string>('');
    const [datainterval, setdatainterval] = useState<string>(i18n.t('inthepast_d'));
    const [limit, setlimit] = useState<number>(globalContext.state.env.isTablet?35:15);
    const [renderData, setRenderData] = useState<any>();
    const flatListRef = React.createRef<FlatList>();
    const [extra, setExtra] = useState<boolean>(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [touchedCoin, setTouchedCoin] = useState<Coin|null>(null)

    const handleModalClose = () => {
        (Platform.OS === 'android') && tradingContext.dispatch({type:Enum_coin_actions.INIT});
        setModalVisible(false);
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
    
    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitleAlign: 'center',
            headerTitle: () => (
                <TouchableOpacity style={{alignSelf:"center",width:"100%"}} onPress={()=>mainContext.reload(true)}>
                    <Image
                        source={require('../assets/icon_rounded.png')}
                        style={{width:25,height:25}}
                    />
                </TouchableOpacity>
            )
        });
    }, [])

    const handleKeyword = (input:string) => {
        setlimit(globalContext.state.env.isTablet?35:15);
        setkeyword(input.trimStart());
        ScrollBackToTop();
    }

    const viewModeHandler = (status:string):void => {
        setlimit(globalContext.state.env.isTablet?35:15);
        setViewmode(status);
        console.log("status set to :",status);
        ScrollBackToTop();
    }

    const toggleRenderFavorites = () => {
        setlimit(globalContext.state.env.isTablet?35:15);
        setRenderFavorites(!renderFavorites);
        ScrollBackToTop();
    }

    const toggleRegisterFavorite = async(name:string) => {
        let tempo = [...mainContext.user.fav];
        (isInList(tempo,name)) ? tempo = removeFromArray(tempo,name) : tempo.push(name);
        await db.collection('users').doc(globalContext.state.auth.userEmail!).update({favorites: tempo,});
    }

    const ScrollBackToTop = () => {
        flatListRef.current!.scrollToOffset({ animated: true, offset: 0 });
    }

    const touchCoin = (coin:any) => {
        setTouchedCoin(coin);
        setModalVisible(true);
    }

    const _parseInterval = (i:string) => {
        switch(i){
            case(ViewMode.PRICES):
                return i18n.t('prices');
            case(ViewMode.TOPMOVERS):
                return i18n.t('top_movers');
            case(ViewMode.CAPS):
                return i18n.t('market_cap');
            default:
                return i
        }
    }

    const _setDataInterval = (i:string) => {
        mainContext.extend();
        setdatainterval(i);
        console.log("set data interval : ",i);
    }

    useEffect(() => {
        let finaldata = [...mainContext.coindata]
        if(renderFavorites){
            finaldata = finaldata.filter(i => mainContext.user.fav.some((item:any) => item === i.name));
        }
        if(keyword.length > 0){
            finaldata = finaldata.filter(i => i.name.toLowerCase().includes(keyword.toLowerCase()) || i.symbol.toLowerCase().includes(keyword.toLowerCase()));
        }else if(!renderFavorites && viewmode !== ViewMode.CAPS){
            finaldata = finaldata.filter(i => !stablecoins.some(item => item.name === i.name));
        }
        if(viewmode === ViewMode.TOPMOVERS){
            finaldata = finaldata.sort((a, b) => Math.abs(b.price_change_percentage_24h!) - Math.abs(a.price_change_percentage_24h!));
        }
        setRenderData(finaldata.slice(0, limit));
        setExtra(!extra);
    }, [mainContext,keyword,renderFavorites,viewmode,limit])//

    const ParseChangeByInterval:React.FC<{i:any}> = ({i}) => {
        let change1h = i.price_change_percentage_1h_in_currency ?? ((i.price_change_percentage_1h_in_currency !== null) ? NaN:null)
        let change7d = i.price_change_percentage_7d_in_currency ?? ((i.price_change_percentage_7d_in_currency !== null) ? NaN:null)
        let change14d = i.price_change_percentage_14d_in_currency ?? ((i.price_change_percentage_14d_in_currency !== null) ? NaN:null)
        let change30d = i.price_change_percentage_30d_in_currency ?? ((i.price_change_percentage_30d_in_currency !== null) ? NaN:null)
        let change200d = i.price_change_percentage_200d_in_currency ?? ((i.price_change_percentage_200d_in_currency !== null) ? NaN:null)
        let change1y = i.price_change_percentage_1y_in_currency ?? ((i.price_change_percentage_1y_in_currency !== null) ? NaN:null)
        let price = i.current_price;let vol = i.market_cap;
        let change = i.price_change_percentage_24h;
        if(datainterval === i18n.t('inthepast_d')){}
        else if(datainterval === i18n.t('inthepast_h')){change = change1h}
        else if(datainterval === i18n.t('inthepast_w')){change = change7d}
        else if(datainterval === i18n.t('inthepast_2w')){change = change14d}
        else if(datainterval === i18n.t('inthepast_m')){change = change30d}
        else if(datainterval === i18n.t('inthepast_200')){change = change200d}
        else if(datainterval === i18n.t('inthepast_y')){change = change1y}
        let display = '';

        if(viewmode===ViewMode.CAPS){
            display = displayVolume(vol);
        }else{
            if(Math.round(price)>=1000 && !globalContext.state.env.isTablet){
                price = price / 1000;
                price = Math.round(price * 100) / 100 ;
                display = "$"+price.toString()+"K";
            }else{
                let asString = avoidScientificNotation(price);
                display = "$"+asString;
            }
        }
        let loading = isNaN(change);
        let data_unavailable = change === null;
        change = Math.round(change * 100) / 100;
        let asString24price = change.toString();
        let activeColor24price = '#E2E2E2';
        if(data_unavailable || loading){
            activeColor24price = StyleLib.subTextColor_bis(globalContext.state.env.darkmode!);
        }else if(change>=0){
            asString24price = "+"+asString24price+"%";
            activeColor24price = StyleLib.buyColor(globalContext.state.env.darkmode!);
        }else{
            asString24price = asString24price+"%";
            activeColor24price = StyleLib.sellColor(globalContext.state.env.darkmode!);
        }
        
        if(globalContext.state.env.isTablet){
            return(
            <View style={{flexDirection:"row", width:screenWidth/2, justifyContent:"space-between"}}>
                <View style={{justifyContent:"center",alignItems:"center",marginRight:15}}>
                    <Text style={{color:activeColor24price,fontWeight:"bold",fontSize:20}}>{display}</Text>
                </View>
                <View style={{backgroundColor:activeColor24price,borderRadius:10,width:85,height:34,justifyContent:"center",alignItems:"center"}}>
                    {loading && (<Loading width={15} height={15}/>)}
                    {(!loading && !data_unavailable) && (<Text style={{color:"white",fontWeight:"bold",fontSize:16}}>{asString24price}</Text>)}
                    {(data_unavailable) && (<Text style={{fontSize:12,fontWeight:"bold",color:StyleLib.subTextColor_bis(globalContext.state.env.darkmode!),textAlign:"right"}}>New</Text>)}
                </View>
            </View>
            )
        }else{
            return(
            <View style={{width:screenWidth/2.55}}>
                <Text style={{color:activeColor24price,fontSize:17,fontWeight:"bold",textAlign:"right"}}>{display}</Text>
                {loading && (<View style={{alignSelf:"flex-end",marginRight:4}}><Loading width={15} height={15}/></View>)}
                {(!loading && !data_unavailable) && (<Text style={{fontSize:12,fontWeight:"bold",color:activeColor24price,textAlign:"right"}}>{asString24price}</Text>)}
                {(data_unavailable) && (<Text style={{fontSize:12,fontWeight:"bold",color:StyleLib.subTextColor_bis(globalContext.state.env.darkmode!),textAlign:"right"}}>New</Text>)}
            </View>
            )
        }
    }

    const Item:React.FC<any> = ({coin}) => {
        return(
            <TouchableOpacity onPress={()=>touchCoin(coin)} style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center",height:50,width:"100%"}}>
                <View style={{flexDirection:"row",alignItems:"center"}}>
                    <View style={{marginLeft:6,justifyContent:"center",width:38,height:38,borderRadius:8,backgroundColor:"white",alignItems:"center"}}>
                        <Image
                            source={{uri:coin.image}}
                            style={{width:32,height:32}}
                        />
                    </View>
                    <View style={{marginLeft:12, alignSelf:"center",width:screenWidth/2.5}}>
                        {(coin.name.length<=17 || globalContext.state.env.isTablet)?(
                            <Text style={{color:StyleLib.textColor(globalContext.state.env.darkmode!),fontSize:17,fontWeight:"bold"}}>{coin.name}</Text>
                        ):(
                            <Text style={{color:StyleLib.textColor(globalContext.state.env.darkmode!),fontSize:17,fontWeight:"bold"}}>{coin.symbol.toUpperCase()}</Text>
                        )}
                        <View style={{flexDirection:"row",alignItems:"center"}}>
                            {isInList(mainContext.user.fav,coin.name) && (<Image source={require('../assets/icons/1x/star2.png')} style={{height:10,width:10,marginRight:5,tintColor:"#BCAB34"}}/>)}
                            <Text style={{color:StyleLib.subTextColor_bis(globalContext.state.env.darkmode!),fontSize:14,fontWeight:"bold"}}>{coin.symbol.toUpperCase()} {(keyword.length>0 || globalContext.state.env.isTablet || viewmode===ViewMode.TOPMOVERS) && `- rank #${coin.market_cap_rank}`}</Text>
                        </View>
                    </View>
                </View>
                <View style={{flexDirection:"row", justifyContent:"space-between", alignSelf:"center", marginRight:15}}>
                    <ParseChangeByInterval
                        i = {coin}
                    />
                </View>
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
                                <Text style={{textAlign: "center"}}>{touchedCoin.name} ({touchedCoin.symbol.toUpperCase()}) #{touchedCoin.market_cap_rank}</Text>
                                <Text style={{marginBottom: 15, textAlign: "center"}}>({i18n.t('stablecoin')})</Text>
                                </>
                                ):(
                                <Text style={{marginBottom: 15, textAlign: "center"}}>{touchedCoin.name} ({touchedCoin.symbol.toUpperCase()}) #{i18n.t('rank')+touchedCoin.market_cap_rank}</Text>
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
        <>
        <View style={{backgroundColor:StyleLib.bgColor(globalContext.state.env.darkmode!), height:globalContext.state.env.screenHeight-StyleLib.dynamic_bottom_tab_Height(mainContext.user.adblock)}}>
            <View style={{paddingHorizontal:14,marginVertical:10}}>
                <View style={[{flexDirection:"row",alignItems:"center",justifyContent:"center",alignSelf:"center"},Platform.OS === 'android' && {width:screenWidth-30,height:22}]}>
                    {Platform.OS === 'android' &&
                        <Picker_Android
                            datainterval={datainterval}
                            globalContext={globalContext.state}
                            callBack={_setDataInterval}
                        />
                    }
                    {Platform.OS === 'ios' && 
                        <Picker_iOS
                            datainterval={datainterval}
                            globalContext={globalContext.state}
                            callBack={_setDataInterval}
                        />
                    }
                </View>
                <TouchableOpacity style={{flexDirection:"row",justifyContent:"space-between",paddingTop:5}} onPress={()=>navigation.navigate('Stack_Prices_Global')}>
                    <Trace_RenderGlobalChange propdata={mainContext.changedata} darkmode={globalContext.state.env.darkmode}/>
                </TouchableOpacity>
            </View>
            <View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginBottom:5, width:screenWidth,height:35}}>
                <TextInput
                    style={[styles.input,{borderColor:StyleLib.inputRadiusColor(globalContext.state.env.darkmode!),backgroundColor:StyleLib.containerColor_sexies(globalContext.state.env.darkmode!),color:StyleLib.textColor(globalContext.state.env.darkmode!),height:35}]}
                    value={keyword}
                    onChangeText={handleKeyword}
                />
                <Image source={require("../assets/icons/1x/search.png")} style={{width:15,height:15,tintColor:"#519ABA",position:"absolute", marginLeft:20}}/>
                <TouchableOpacity style={{marginRight:10}} onPress={()=>toggleRenderFavorites()}>
                            {renderFavorites ? (<View style={{width:30,height:30,borderRadius:5,borderWidth:2,borderColor:"#BCAB34",justifyContent:"center",alignItems:"center"}}>
                            <Image
                                source={require("../assets/icons/1x/star2.png")}
                                style={{width:20,height:20,tintColor:"#BCAB34"}}
                            /></View>) : (<View style={{width:30,height:30,borderRadius:5,borderWidth:2,borderColor:"#519ABA",justifyContent:"center",alignItems:"center"}}>
                            <Image
                                source={require("../assets/icons/1x/star.png")}
                                style={{width:20,height:20,tintColor:"#519ABA"}}
                            /></View>)}
                </TouchableOpacity>
            </View>
            <View style={{paddingHorizontal:10,height:30,alignItems:"center",marginBottom:5}}>
                <View style={[styles.listTab,(globalContext.state.env.darkmode?{backgroundColor:"white"}:{backgroundColor:"#E3E3E3"})]}>
                    {listTab.map((i,index) => (
                        <View key={index}>
                            <TouchableOpacity style={[styles.btnTab, viewmode===i&&styles.btnTabActive]} onPress={()=>viewModeHandler(i)}>
                                <Text style={{fontSize:14,fontWeight:"bold"}}>{_parseInterval(i)}</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            </View>
            <View style={{flex:1,width:screenWidth-20,marginBottom:5,alignSelf:"center",backgroundColor:StyleLib.containerColor_sexies(globalContext.state.env.darkmode!),borderRadius:10,bottom:0}}>
                {<FlatList
                    data={renderData}
                    renderItem={({item})=>{
                        return(<Item coin={item}/>)
                    }}
                    onRefresh={()=>mainContext.reload(false)}
                    refreshing={mainContext.fetching}
                    ref={flatListRef}
                    keyExtractor={item => item.id}
                    onEndReached={()=>{
                        console.log("on end reached, limit:", limit);
                        setlimit(limit+20)
                    }}
                    onEndReachedThreshold={0.1}
                    initialNumToRender={globalContext.state.env.isTablet?35:15}
                    extraData={extra}
                />}
            </View>
        </View>
        {modal}
        {Platform.OS === 'ios' &&
            <SwipeablePanel
                {...panelProps}
                isActive={isPanelActive}
                style={{
                    backgroundColor:StyleLib.containerColor_bis(globalContext.state.env.darkmode!),
                    bottom:-100,
                    paddingBottom:Boolean(mainContext.user.adblock || mainContext.adEnv.globalAdBlock) ? 100:160
                }}
                closeOnTouchOutside={true}
                showCloseButton={false}
                onlyLarge={true}
            >
            {tradingContext.state && <Trading />}
            </SwipeablePanel>
        }
        </>
    )
}

export default Prices

const styles = StyleSheet.create({
    listTab:{
        flex:1,
        justifyContent:"space-between",
        flexDirection:"row",
        borderRadius:10,
        width:"100%",
    },
    btnTab:{
        width:(screenWidth-20)/3,
        flexDirection:"row",
        padding:5,
        justifyContent:"center",
        alignItems:"center",
        borderRadius:10,
        height:"100%",
    },
    btnTabActive:{
        backgroundColor:"#bdbeff",
    },
    input: {
        width:screenWidth-57,
        marginLeft:10,
        paddingHorizontal: 10,
        paddingLeft:30,
        borderWidth: 2,
        borderRadius: 10,
        fontSize:15,
    },
    interval_btnTab:{
        borderRadius:3,paddingHorizontal:4,width:50
    },
    interval_text:{
        fontWeight:"bold",fontSize:15,textAlign:"center"
    },
    interval_textActive :{//for darkmode
        color:"#468559"
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
    }
})
