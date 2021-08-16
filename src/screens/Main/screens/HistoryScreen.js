import React, { useEffect, useState, useLayoutEffect } from 'react';
import { Text, View, Dimensions, TouchableOpacity, Image, Platform, FlatList } from 'react-native';
import { useColorScheme } from "react-native-appearance";
import { AdMobBanner} from 'expo-ads-admob';
import Env from '../../../env.json';
import { db } from '../../../../firebase';
import { Alert } from 'react-native';
import * as firebase from "firebase";

const screenWidth = Dimensions.get("window").width;
const width = Dimensions.get("window").width-20;
const screenHeight = Dimensions.get("window").height;

const HistoryScreen = ({route, navigation}) => {
    const scheme = useColorScheme();
    const [history, setHistory] = useState([]);
    const { ispro, bannerID, isTablet } = route.params;
    const [editStatus, setEditStatus] = useState(false);
    const [selected, setSelected] = useState([]);

    useEffect(() => {
        const unsubscribe = 
            db.collection('users').doc(route.params.email).collection('history').orderBy("orderNum", "desc").onSnapshot((querySnapshot) => {
                console.log("HistoryScreen - snapshot triggered at",new Date().toLocaleString());
                let arr = (querySnapshot.docs.map(order => ({
                    id: order.id,
                    type: order.data().type,
                    time: order.data().time,
                    target: order.data().target,
                    quantity: order.data().quantity,
                    price: order.data().price,
                    fiat: order.data().fiat,
                    imgsrc: order.data().imgsrc,
                })));
                //console.log(arr);
                setHistory(arr);
            }, (err) => {
                console.log(err);
                setHistory(Array());
            });
        return unsubscribe;
    }, [])

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity style={{marginRight:18}} onPress={()=> (selected.length>0) ? deleteSelected():toggleEditStatus()}>
                    <Text style={{fontSize:20,fontWeight:"bold",color:"#FFFFFF"}}>{editStatus ? actionText():"Edit"}</Text> 
                </TouchableOpacity>
            )
        });
    }, [selected.length,editStatus])

    const bool_isDarkMode = () => {
        return scheme === "dark";
    }
    const containerColor = () => {
        return bool_isDarkMode() ? "#1c1c1c":"#e8e8e8";
    }
    const borderColor = () => {
        return bool_isDarkMode() ? "#a196b5":"#8c829e";
    }
    const buyColor = () => {
        return bool_isDarkMode() ? Env.buyColor_dark:Env.buyColor_light;
    }
    const sellColor = () => {
        return bool_isDarkMode() ? Env.sellColor_dark:Env.sellColor_light;
    }
    const textColor = () => {
        return bool_isDarkMode() ? "#FFFFFF":"#000000";
    }
    const numberWithCommas = (i) => {
        if(i<1000){
            return i;
        }else{
            let j = i.toString();
            let k = j.split(".");
            let intpart = Number(k[0])
            let intAsString = intpart.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
            if(k.length>1){
                let decimalpart = Number(k[1]);
                return intAsString+"."+ decimalpart.toString();
            }else{
                return intAsString;
            }
        }
    }
    const dynamicMargin = () => {
        if(ispro){
            return (Platform.OS === "ios") ? 209:162;
        }else{
            return (Platform.OS === "ios") ? 269:222;
        }
    }
    const dynamicRound = (i,j) => {
        return (Math.round(i * Math.pow(10,j)) / Math.pow(10,j));
    }
    const renderFreeIfZero = (i) => {
        if(i>0){
            return i;
        }else if(i===0){
            return "";
        }else{
            return "for upgrade";
        }
    }
    const toggleEditStatus = () => {
        setEditStatus(!editStatus);
    }

    const addItem = (id) => {
        let arr = [... selected];
        if(selected.includes(id)){
            arr = removeItemFromArray(arr,id);
            setSelected(arr);
        }else{
            arr.push(id);
            setSelected(arr);
        }
        console.log(arr);
    }

    function removeItemFromArray(arr, value) {
        let index = arr.indexOf(value);
        if (index > -1) {arr.splice(index, 1);}
        return arr;
    }
    const adError = (e) => {
        console.log("Error showing banner ad ! : ",e);
    }

    const Item = ({i}) => {
        let _selected =  selected.includes(i.id);
        return(
        <TouchableOpacity onPress={()=>editStatus ? addItem(i.id):alert_delete(i)}>
            <View style={[{flexDirection:"row",height:50,padding:5,margin:2,alignItems:"center",borderRadius:5},(i.type==="Sold" || i.type === "Spent")?{backgroundColor:sellColor()}:{backgroundColor:buyColor()}]}>
                {(editStatus&&_selected) && (<Image source={require('../../../assets/icons/1x/dot.png')} style={{width:29,height:29,marginLeft:2,marginRight:5}}/>)}
                {(editStatus&&!_selected) && (<Image source={require('../../../assets/icons/1x/dot_2.png')} style={{width:29,height:29,marginLeft:2,marginRight:5}}/>)}
                <View style={{width:34,height:34,borderRadius:8,backgroundColor:"white",justifyContent:"center",alignItems:"center",marginLeft:2}}>
                    {(i.target==="VUSD") ? (<Image source={require('../../../assets/icons/1x/usd_custom.png')} style={{width:29,height:29}}/>
                        ):(
                    <Image source={{uri:i.imgsrc}} style={{width:29,height:29}}/>)}
                </View>
                <View style={{marginLeft:10, width:"94.5%",marginRight:5}}>
                    <Text style={{color:"#FFFFFF",fontWeight:"700"}}>{i.type} {i.quantity} {i.target} {(i.fiat>0) ? "for $":""}{(i.fiat>0) ? (numberWithCommas(dynamicRound(i.fiat,2))):(renderFreeIfZero(i.fiat))}</Text>
                    <View style={{flexDirection:"row",justifyContent:"space-between"}}>
                        <Text style={{color:"#FFFFFF"}}>{i.time}</Text>
                        {(!editStatus || isTablet!==1) && <Text style={[{color:"#FFFFFF"},editStatus && {marginRight:39},(isTablet===1 && !editStatus) && {marginRight:25}]}>1{i.target} = ${numberWithCommas(dynamicRound(i.price,2))}</Text>}
                    </View>
                </View>
            </View>
        </TouchableOpacity>
        )
    }

    const alert_delete = (metadata) => {
        Alert.alert(
            "Warning",
            "Are you sure you want to delete this history?",
            [
              {
                text: "Cancel",
                onPress: () => console.log("Cancel Pressed"),
                style: "cancel"
              },
              { text: "Yes", onPress: () => deleteSingle(metadata)}
            ]
          );
      
    }
    const deleteSelected = () => {
        return new Promise((res) => {
            // don't run if there aren't any ids or a path for the collection
            if (!selected || !selected.length) return res([]);
        
            const collectionPath = db
                                    .collection('users')
                                    .doc(route.params.email)
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

    const deleteSingle = (metadata) => {
        db.collection('users').doc(route.params.email)
        .collection('history').doc(metadata.id)
        .delete().then(()=>{console.log("succesfully deleted :",metadata.id);console.log("You had traded",id.target);})
        .catch((err)=>{console.log(err);console.log(metadata);});
    }
    const actionText = () => {
        return (selected.length>0) ? "Delete selected" : "Done";
    }

    return(
        <View style={{flex:1,marginTop:15}}>
            <View style={{width:width, height:screenHeight-dynamicMargin(), alignSelf:"center",borderWidth:2,borderRadius:8,borderColor:borderColor(),backgroundColor:containerColor(),marginBottom:2}}>
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
            <View style={{alignSelf:"center"}}>
            {!ispro && 
                <AdMobBanner
                bannerSize="fullBanner"
                adUnitID={bannerID} // Test ID, Replace with your-admob-unit-id
                servePersonalizedAds // true or false
                onDidFailToReceiveAdWithError={adError}
                />
            }
            </View>
        {/*<View style={{width:screenWidth,height:100,backgroundColor:"red"}}/>*/}
    </View>
    )
}

export default HistoryScreen
