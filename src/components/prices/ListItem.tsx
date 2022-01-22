import React, { useContext } from "react"
import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native"
import { isInList } from "../../lib/FuncLib"
import {
  GlobalContext,
  GlobalContextInterfaceAsReducer,
  MainContext,
  MainContextInterface,
} from "../../ContextManager"
import { ViewMode } from "../../lib/Types"
import { subTextColor_bis, textColor } from "../../lib/StyleLib"
import PriceChange from "./PriceChange"

interface Props {
  coin: any
  keyword: string
  viewmode: string
  datainterval: any
  touchCoin: (coin: any) => void
}

const ListItem: React.FC<Props> = ({
  coin,
  keyword,
  viewmode,
  datainterval,
  touchCoin,
}) => {
  const gc = useContext(GlobalContext) as GlobalContextInterfaceAsReducer
  const mc = useContext(MainContext) as MainContextInterface
  return (
    <TouchableOpacity
      onPress={() => touchCoin(coin)}
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        height: 50,
        width: "100%",
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View
          style={{
            marginLeft: 6,
            justifyContent: "center",
            width: 38,
            height: 38,
            borderRadius: 8,
            backgroundColor: "white",
            alignItems: "center",
          }}
        >
          <Image
            source={{ uri: coin.image }}
            style={{ width: 32, height: 32, borderRadius: 6 }}
          />
        </View>
        <View
          style={{
            marginLeft: 12,
            alignSelf: "center",
            width: gc.state.env.screenWidth / 2.5,
          }}
        >
          {coin.name.length <= 17 || gc.state.env.isTablet ? (
            <Text
              style={{
                color: textColor(gc.state.env.darkmode!),
                fontSize: 17,
                fontWeight: "bold",
              }}
            >
              {coin.name}
            </Text>
          ) : (
            <Text
              style={{
                color: textColor(gc.state.env.darkmode!),
                fontSize: 17,
                fontWeight: "bold",
              }}
            >
              {coin.symbol.toUpperCase()}
            </Text>
          )}
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {isInList(mc!.user.fav, coin.name) && (
              <Image
                source={require("../../assets/icons/1x/bell_on.png")}
                style={{
                  height: 10,
                  width: 10,
                  marginRight: 5,
                  tintColor: "#BCAB34",
                }}
              />
            )}
            <Text
              style={{
                color: subTextColor_bis(gc.state.env.darkmode!),
                fontSize: 14,
                fontWeight: "bold",
              }}
            >
              {coin.symbol.toUpperCase()}{" "}
              {(keyword.length > 0 ||
                gc.state.env.isTablet ||
                viewmode === ViewMode.TOPMOVERS) &&
                `- rank #${coin.market_cap_rank}`}
            </Text>
          </View>
        </View>
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignSelf: "center",
          marginRight: 15,
        }}
      >
        <PriceChange i={coin} viewmode={viewmode} datainterval={datainterval} />
      </View>
    </TouchableOpacity>
  )
}

export default ListItem

const styles = StyleSheet.create({})
