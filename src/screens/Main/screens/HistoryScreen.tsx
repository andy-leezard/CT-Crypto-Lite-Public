import React, { useEffect, useState, useLayoutEffect, useContext } from 'react';
import { Text, View, Dimensions, TouchableOpacity, Image, Platform, FlatList } from 'react-native';
import { db } from '../../../../firebase';
import { Alert } from 'react-native';
import firebase from "firebase/app";
import "firebase/firestore";

import i18n from 'i18n-js';
import axios from 'axios';

import { GlobalContext, MainContext } from '../../../StateManager';
import { BannerAD } from '../../../lib/ComponentLib';
import { GlobalContextInterfaceAsReducer, MainContextInterface } from '../../../lib/Types';
import * as StyleLib from '../../../lib/StyleLib';
import { dynamicRound, numberWithCommas } from '../../../lib/FuncLib';
import { removeFromArray } from '../../../lib/JSFuncLib';

const screenWidth = Dimensions.get("window").width;
const width = screenWidth-20;
const screenHeight = Dimensions.get("window").height;

interface Props {
    route: any
    navigation: any
}

const HistoryScreen:React.FC<Props> = ({route, navigation}) => {
    const globalContext = useContext<GlobalContextInterfaceAsReducer>(GlobalContext);
    const mainContext = useContext<MainContextInterface>(MainContext);
    const [history, setHistory] = useState<any[]>([]);
    const [editStatus, setEditStatus] = useState<boolean>(false);
    const [selected, setSelected] = useState<any>([]);
    const locale = i18n.currentLocale();

    const dynamicMargin = () => {
        if(mainContext.adblock){
            return (Platform.OS === "ios") ? 209:162; // previously 209:162 - 23
        }else{
            return (Platform.OS === "ios") ? 269:222; // previously 269:222 - 23
        }
    }
    const renderFreeIfZero = (i:any):any => {
        return (i>0) ? i : "";
    }
    const toggleEditStatus = () => {
        setEditStatus(!editStatus);
    }

    const addItem = (id:any):void => {
        let arr = [... selected];
        if(selected.includes(id)){
            arr = removeFromArray(arr,id);
            setSelected(arr);
        }else{
            arr.push(id);
            setSelected(arr);
        }
    }

    const _parseType = (t:string):string => {
        switch(t){
            case('Earned'):
                return i18n.t('earned')
            case('Sold'):
                return i18n.t('sold')
            case('Bought'):
                return i18n.t('bought')
            case('Spent'):
                return i18n.t('spent')
            case('Received'):
                return i18n.t('received')
            default:
                return t
        }
    }

    useEffect(() => {
        const unsubscribe = 
            db.collection('users').doc(globalContext.state.auth.userEmail!).collection('history').orderBy("orderNum", "desc").onSnapshot((querySnapshot) => {
                console.log("HistoryScreen - snapshot triggered at",new Date().toLocaleString());
                const arr = (querySnapshot.docs.map(order => ({
                    id: order.id,
                    type: order.data().type,
                    orderNum: order.data().orderNum,
                    target: order.data().target,
                    quantity: order.data().quantity,
                    price: order.data().price,
                    fiat: order.data().fiat,
                    imgsrc: order.data().imgsrc,
                })));
                setHistory(arr);
            }, (err) => {
                console.log(err);
                setHistory([]);
            });
        return unsubscribe;
    }, [])

    useEffect(() => {
        const function_address = 'https://us-central1-cointracer-2fd86.cloudfunctions.net/optimizeHistory';
        axios.post(function_address, { userEmail: globalContext.state.auth.userEmail }).then(()=>{console.log("axios post - invoked history optimizer")}).catch((e)=>{console.log("Error occurred while optimizing history:",e);});
    }, [])

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity style={{marginRight:18}} onPress={()=> (selected.length>0) ? deleteSelected():toggleEditStatus()}>
                    <Text style={{fontSize:20,fontWeight:"bold",color:StyleLib.textColor(globalContext.state.env.darkmode!)}}>{editStatus ? actionText():i18n.t('edit')}</Text> 
                </TouchableOpacity>
            )
        });
    }, [selected.length,editStatus])

    const Item:React.FC<any> = ({i}) => {
        const _selected =  selected.includes(i.id);
        const time = new Date(i.orderNum);
        return(
        <TouchableOpacity onPress={()=>editStatus ? addItem(i.id):alert_delete(i)} style={[{flexDirection:"row",minHeight:50,padding:5,margin:2,alignItems:"center",borderRadius:5},(i.type==="Sold" || i.type === "Spent")?{backgroundColor:StyleLib.sellColor(globalContext.state.env.darkmode!)}:{backgroundColor:StyleLib.buyColor(globalContext.state.env.darkmode!)}]}>
            {(editStatus&&_selected) && (<Image source={require('../../../assets/icons/1x/dot.png')} style={{width:29,height:29,marginLeft:2,marginRight:5}}/>)}
            {(editStatus&&!_selected) && (<Image source={require('../../../assets/icons/1x/dot_2.png')} style={{width:29,height:29,marginLeft:2,marginRight:5}}/>)}
            <View style={{width:34,height:34,borderRadius:8,backgroundColor:"white",justifyContent:"center",alignItems:"center",marginLeft:2}}>
                {(i.target==="VUSD") ? (<Image source={require('../../../assets/icons/1x/usd_custom.png')} style={{width:29,height:29}}/>
                    ):(
                <Image source={{uri:i.imgsrc}} style={{width:29,height:29}}/>)}
            </View>
            <View style={{marginLeft:10, width:"94.5%",marginRight:5}}>
                <Text style={{color:"#FFFFFF",fontWeight:"700"}}>{_parseType(i.type)} {i.quantity} {i.target} {(i.fiat>0) ? "for $":""}{(i.fiat>0) ? (numberWithCommas(dynamicRound(i.fiat,2))):(renderFreeIfZero(i.fiat))}</Text>
                <View style={{flexDirection:"row",justifyContent:"space-between"}}>
                    <Text style={{color:"#FFFFFF"}}>{`${time.toLocaleDateString(locale)} ${time.toLocaleTimeString(locale)}`}</Text>
                    {((!editStatus || globalContext.state.env.isTablet)&&i.target!=="VUSD") && <Text style={[{color:"#FFFFFF"},editStatus && {marginRight:39},(!globalContext.state.env.isTablet && !editStatus) && {marginRight:25}]}>1{i.target} = ${numberWithCommas(dynamicRound(i.price,2))}</Text>}
                </View>
            </View>
        </TouchableOpacity>
        )
    }

    const alert_delete = (metadata:any) => {
        Alert.alert(
            i18n.t('warning'),
            i18n.t('delete_history_msg'),
            [
              {
                text: i18n.t('s_cancel'),
                style: "cancel"
              },
              { text: i18n.t('yes'), onPress: () => deleteSingle(metadata)}
            ]
          );
      
    }
    const deleteSelected = () => {
        return new Promise((res) => {
            // don't run if there aren't any ids or a path for the collection
            if (!selected || !selected.length) return res([]);
        
            const collectionPath = db
                                    .collection('users')
                                    .doc(globalContext.state.auth.userEmail!)
                                    .collection('history');
            let batches = [];
        
            while (selected.length) {
              // firestore limits batches to 10
              const batch = selected.splice(0, 10);
        
              // add the batch request to to a queue
              batches.push(
                new Promise(response => {
                  collectionPath
                    .where(
                      firebase.firestore.FieldPath.documentId(),
                      'in',
                      [...batch]
                    )
                    .get()
                    .then((querySnapshot)=>{
                        var batch = db.batch();
                        querySnapshot.forEach(function(doc) {
                            // For each doc, add a delete operation to the batch
                            batch.delete(doc.ref);
                            console.log(doc.id," has been deleted !");
                        });
                        batch.commit();
                        response("batch completed");
                    })
                })
              )
            }
            // after all of the data is fetched, return it
            Promise.all(batches).then(() => {
                res("Successfully deleted all");
                console.log("Promised all !!");
                setEditStatus(false);
                setSelected([]);
            })
        })
    }

    const deleteSingle = (metadata:any):void => {
        db.collection('users').doc(globalContext.state.auth.userEmail!)
        .collection('history').doc(metadata.id)
        .delete().then(()=>{console.log("succesfully deleted :",metadata.id);})
        .catch((err)=>{console.log(err);console.log(metadata);});
    }
    const actionText = ():string => {
        return (selected.length>0) ? i18n.t('del_selected') : i18n.t('done');
    }

    return(
        <View style={{marginTop:15,height:globalContext.state.env.screenHeight-StyleLib.dynamic_bottom_tab_Height(mainContext.adblock)-15}}>
            <View style={{flex:1, width:width, alignSelf:"center",borderWidth:2,borderRadius:8,borderColor:StyleLib.containerRadiusColor_bis(globalContext.state.env.darkmode!),backgroundColor:StyleLib.containerColor_bis(globalContext.state.env.darkmode!),marginBottom:2}}>
                <FlatList
                    style={[{borderRadius: 6},(Platform.OS !== 'ios') && {paddingHorizontal:4,paddingVertical:4}]}
                    data={history}
                    renderItem={({item})=>{
                        return(<Item i={item}/>)
                    }}
                    keyExtractor={item => item.id}
                    onEndReachedThreshold={0.5}
                    initialNumToRender={10}
                />
            </View>
        </View>
    )
}

export default HistoryScreen
