import React, {useEffect, useState} from 'react';
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import _ from 'lodash';
import { useColorScheme } from "react-native-appearance";
import { createStackNavigator } from "@react-navigation/stack";
import HistoryScreen from './HistoryScreen';
import Portfolio from '../../../components/Portfolio';
import Loading from '../../../components/Loading';
import TradingScreen_NormalView from './TradingScreen_NormalView';
import Env from '../../../env.json';

const Stack = createStackNavigator();
const globalScreenOptions_dark ={
    headerTitleStyle: {color:"#FFFFFF"},
    headerTintColor: "#FFFFFF"
}
const globalScreenOptions_light ={
    headerTitleStyle: {color:"#000000"},
    headerTintColor: "#000000"
}
const sliceColor = ['#3684CB','#3FB2AB','#6CD293', '#C7F5D6', '#CBD5E0', '#FFFFFF'];

const PortfolioScreen = ({userEmail, username, coindata, postData, totalbuyin, totalbuyin_const, pnldate, bannerID, seed, ispro, upgraded, isTablet}) => {
    const scheme = useColorScheme();
    const [portfolio, setPortfolio] = useState([]);

    useEffect(() => {
        const pieSeries = [];const completeData = [];const chartkeys = [];let desc = [];const delistedData = [];let delisted_desc = [];
        let thesum = 0;
        postData.forEach((i) => {
            let onceonly = coindata.filter(j => i.id === j.name);
            if(onceonly.length>0){
                let subsum = i.quantity * onceonly[0].current_price;
                let symb = onceonly[0].symbol;
                thesum += subsum;//times--;
                if(onceonly[0].name!=="vusd"){
                    let _spark = onceonly[0].sparkline_in_7d.price;
                    let rank = onceonly[0].market_cap_rank;
                    completeData.push({...i,appreciation: subsum,symbol: symb.toUpperCase(),img:onceonly[0].image,crntPrice:onceonly[0].current_price,name:onceonly[0].name,spark:_spark,rank:rank});
                }else{
                    completeData.push({...i,appreciation: subsum,symbol: symb.toUpperCase(),img:onceonly[0].image,crntPrice:onceonly[0].current_price,name:onceonly[0].name});
                }
            }else{
                console.log("warning - coin [",i.id,"] has been delisted !");
                delistedData.push({...i,appreciation:0,symbol:i.symbol,img:Env.delistedIcon,crntPrice:0,name:i.id,rank:9999});
            }
        })
        delisted_desc = delistedData.sort((a, b) => b.quantity - a.quantity);
        desc = completeData.sort((a, b) => b.appreciation - a.appreciation);
        let t = 5; let etcsum = 0; //let k = desc.length;
        for (let j = 0; j < desc.length; j++) {
            //k--;
            if(t>0){
                t--;pieSeries.push({name:completeData[j].symbol.toUpperCase(),
                                    appreciation:completeData[j].appreciation,
                                    color:sliceColor[4+(t*-1)],
                                    legendFontColor: textColor(),
                                    legendFontSize: 15});
                chartkeys.push({id:completeData[j].symbol,index:j});
            }else{
                etcsum += completeData[j].appreciation;
            }
        }
        if(etcsum>0){
          pieSeries.push({name:"Other",appreciation:etcsum,color:sliceColor[5],legendFontColor: textColor(),legendFontSize: 15});
          chartkeys.push({id:"Other",index:5});
        }
        const asso = [];
        desc.forEach((i) => {
            let _spark = i.spark ?? Array();
            let _rank = i.rank ?? 0;
            asso.push({id:i.symbol,index:t,img:i.img,quantity:i.quantity,crntPrice:i.crntPrice,name:i.name,spark:_spark,rank:_rank});
        })
        let total = dynamicRound(thesum,2);
        let normalpnl = returnPNL(total,totalbuyin);
        let constpnl = returnPNL(total,totalbuyin_const);
        let obj = {"piedata":pieSeries,"chartkey":chartkeys,"associatedData":asso,"totalbuyin":totalbuyin,"totalbuyin_const":totalbuyin_const,
        "totalAppreciation":total,"pnl":normalpnl,"pnl_const":constpnl,"pnldate":pnldate,"seed":seed,"delisted":delisted_desc};
        //console.log(obj.piedata);
        console.log("updated portfolio");
        setPortfolio(obj);
    }, [postData, pnldate, seed])

    const bool_isDarkMode = () => {
        return scheme === "dark";
    }
    const textColor = () => {
        return bool_isDarkMode() ? "#FFFFFF":"#000000";
    }

    if(portfolio.length===0){
        return(
            <SafeAreaView style={{flex:1,justifyContent:"center",alignItems:"center"}}>
                <Text style={{color:textColor()}}>fetching...</Text>
                <Loading width={40} height={40}/>
            </SafeAreaView>
        )
    }

    function returnPNL(totaloutput,totalinput){
        if(totalinput<=0){
            console.log("Error-dividing by zero - returning error")
            return 0;
        }
        let ratio = (totaloutput/totalinput) - 1 ;
        ratio = Math.round(ratio * 10000) / 100;
        return ratio;
    }

    function dynamicRound(i,j){
        return (Math.round(i * Math.pow(10,j)) / Math.pow(10,j));
    }

    return (
        <Stack.Navigator initialRouteName="Stack_Portfolio" screenOptions={bool_isDarkMode() ? globalScreenOptions_dark : globalScreenOptions_light}>
            <Stack.Screen name='Stack_Portfolio' options={{title:`${username}'s portfolio`}} //component={Stack_Portfolio}
                children={()=><Portfolio userEmail={userEmail} coindata={coindata} portfolio={portfolio} ispro={ispro} bannerID={bannerID} upgraded={upgraded} isTablet={isTablet}/>}/>
            <Stack.Screen name='Stack_Portfolio_Trading' options={{title:"Trading"}} component={TradingScreen_NormalView}/>
            <Stack.Screen name='Stack_History' options={{title:"History"}} component={HistoryScreen}/>
        </Stack.Navigator>
    )
}

export default PortfolioScreen
