import React, { useEffect, useState, useContext } from "react"
import { Text, View, Image, ScrollView, TouchableOpacity, Platform, StyleSheet, Pressable, Modal } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { PieChart } from "react-native-chart-kit"
import Loading from "./Loading"
import i18n from "i18n-js"
import {
  GlobalContext,
  GlobalContextInterfaceAsReducer,
  MainContext,
  MainContextInterface,
  TradingContext,
  TradingContextInterfaceAsReducer,
} from "../ContextManager"
import { Coin, PieData } from "../lib/Types"
import { displayVolume, fastRound, isStableCoin, percentageAsDelta } from "../lib/FuncLib"
import { cal_global_details } from "../lib/FuncLib"
import * as StyleLib from "../lib/StyleLib"
import { Enum_coin_actions } from "../lib/Reducers"
import Trading from "./Trading"
import { SwipeablePanel } from "rn-swipeable-panel"

interface Props {
  route: any
  navigation: any
}

const GlobalDetails: React.FC<Props> = ({ route, navigation }) => {
  const gc = useContext(GlobalContext) as GlobalContextInterfaceAsReducer
  const mc = useContext(MainContext) as MainContextInterface
  const tc = useContext(TradingContext) as TradingContextInterfaceAsReducer
  const [pieData, setPiedata] = useState<PieData[]>([])
  const [allData, setAlldata] = useState<Coin[]>([])
  const [modalVisible, setModalVisible] = useState(false)
  const [touchedCoin, setTouchedCoin] = useState<Coin | null>(null)

  const handleModalClose = () => {
    Platform.OS === "android" && tc.dispatch({ type: Enum_coin_actions.INIT })
    setModalVisible(false)
  }
  const touchCoin = (coin: Coin) => {
    setTouchedCoin(coin)
    setModalVisible(true)
  }

  // Start - panel
  const [isPanelActive, setIsPanelActive] = useState(false)

  const openPanel = () => {
    tc.dispatch({ type: Enum_coin_actions.SET, payload: touchedCoin! })
    if (Platform.OS === "ios") {
      setModalVisible(false)
      setIsPanelActive(true)
    }
  }

  const closePanel = () => {
    tc.dispatch({ type: Enum_coin_actions.INIT })
    setIsPanelActive(false)
  }
  // End - panel

  const modal = (
    <Modal
      animationType="fade"
      hardwareAccelerated={true}
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        handleModalClose()
      }}
    >
      <View style={[styles.centeredView]}>
        <Pressable
          style={{ width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", position: "absolute" }}
          onPress={() => handleModalClose()}
        />
        {touchedCoin && !tc.state && (
          <View style={[styles.modalView, { backgroundColor: StyleLib.modalBgColor(gc.state.env.darkmode!) }]}>
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
              <Image source={{ uri: touchedCoin.image }} style={{ width: 32, height: 32 }} />
            </View>
            {isStableCoin(touchedCoin.name) ? (
              <>
                <Text style={{ textAlign: "center", color: StyleLib.textColor(gc.state.env.darkmode!) }}>
                  {touchedCoin.name} ({touchedCoin.symbol.toUpperCase()})
                </Text>
                <Text
                  style={{ marginBottom: 15, textAlign: "center", color: StyleLib.textColor(gc.state.env.darkmode!) }}
                >
                  ({i18n.t("stablecoin")})
                </Text>
              </>
            ) : (
              <>
                <Text
                  style={{ marginBottom: 15, textAlign: "center", color: StyleLib.textColor(gc.state.env.darkmode!) }}
                >
                  {touchedCoin.name} ({touchedCoin.symbol.toUpperCase()})
                </Text>
                <TouchableOpacity style={[styles.button, { backgroundColor: "#2196F3" }]} onPress={openPanel}>
                  <Text style={styles.textStyle}>
                    {i18n.t("buy")}/{i18n.t("sell")}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
        {tc.state && (
          <View style={[styles.modalView_Trading, { backgroundColor: StyleLib.modalBgColor(gc.state.env.darkmode!) }]}>
            <Trading />
          </View>
        )}
      </View>
    </Modal>
  )

  useEffect(() => {
    const data_array = cal_global_details(gc.state.env.darkmode!, mc.changedata.data.market_cap_percentage, mc.coindata)
    setAlldata(data_array.desc)
    setPiedata(data_array.pie)
  }, [mc])

  if (allData.length <= 0 || pieData.length <= 0) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: StyleLib.textColor(gc.state.env.darkmode!), marginBottom: 10 }}>
          {i18n.t("processing")}...
        </Text>
        <Loading width={40} height={40} />
      </SafeAreaView>
    )
  }

  return (
    <>
      <View
        style={{
          backgroundColor: StyleLib.bgColor(gc.state.env.darkmode!),
          flex: 1,
          marginBottom: mc.tab_bar_height + mc.bottomInset + mc.banner_ad_height,
        }}
      >
        <View
          style={{
            width: gc.state.env.screenWidth - 20,
            borderRadius: 10,
            borderWidth: 3,
            borderColor: StyleLib.containerRadiusColor_bis(gc.state.env.darkmode!),
            padding: 10,
            marginVertical: 10,
            alignSelf: "center",
          }}
        >
          <View style={{ alignSelf: "center" }}>
            <Text
              style={{
                color: StyleLib.textColor(gc.state.env.darkmode!),
                fontSize: 16,
                marginBottom: 10,
                fontWeight: "bold",
                marginLeft: 10,
              }}
            >
              {i18n.t("m_cap_by_per")}
            </Text>
            <PieChart
              width={gc.state.env.screenWidth - 20}
              height={200}
              data={pieData}
              accessor="dominance"
              backgroundColor="transparent"
              paddingLeft="15"
              chartConfig={{
                decimalPlaces: 6,
                backgroundGradientFrom: "#000000",
                backgroundGradientTo: "#000000",
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
            />
          </View>
        </View>
        <View
          style={{
            flex: 1,
            width: gc.state.env.screenWidth - 20,
            marginBottom: 5,
            alignSelf: "center",
            backgroundColor: StyleLib.containerColor_bis(gc.state.env.darkmode!),
            borderRadius: 10,
          }}
        >
          <ScrollView>
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              {allData.map((i: Coin, index: number) => {
                return (
                  <TouchableOpacity key={index} onPress={() => touchCoin(i)}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        borderWidth: 2,
                        borderRadius: 10,
                        borderColor: StyleLib.containerRadiusColor_bis(gc.state.env.darkmode!),
                        backgroundColor: StyleLib.containerColor_bis(gc.state.env.darkmode!),
                        width: gc.state.env.screenWidth - 40,
                        height: 50,
                        padding: 5,
                        marginTop: 10,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          width: gc.state.env.screenWidth / 2 - 50,
                          alignItems: "center",
                        }}
                      >
                        <View
                          style={{
                            position: "absolute",
                            width: 38,
                            height: 38,
                            borderRadius: 8,
                            backgroundColor: "white",
                          }}
                        />
                        <Image source={{ uri: i.image }} style={{ width: 32, height: 32, marginLeft: 3 }} />
                        <View style={{ justifyContent: "space-between" }}>
                          <Text
                            style={{
                              fontSize: 16,
                              fontWeight: "bold",
                              color: StyleLib.textColor(gc.state.env.darkmode!),
                              marginLeft: 9,
                            }}
                          >
                            {i.name}
                          </Text>
                          <Text
                            style={{
                              fontSize: 13,
                              fontWeight: "bold",
                              color: StyleLib.subTextColor_bis(gc.state.env.darkmode!),
                              marginLeft: 9,
                            }}
                          >
                            {i.symbol.toUpperCase()}
                          </Text>
                        </View>
                      </View>
                      <View style={{ justifyContent: "center", alignItems: "center", marginRight: 15, width: 100 }}>
                        <Text
                          style={{
                            color: StyleLib.dynamicColor(gc.state.env.darkmode!, i.market_cap_change_percentage_24h!),
                            fontWeight: "bold",
                            fontSize: 18,
                          }}
                        >
                          {displayVolume(i.market_cap!)}
                        </Text>
                      </View>
                      <View
                        style={{
                          backgroundColor: StyleLib.dynamicColor(
                            gc.state.env.darkmode!,
                            i.market_cap_change_percentage_24h!
                          ),
                          borderRadius: 10,
                          width: 75,
                          height: 34,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Text style={{ color: "white", fontWeight: "bold", fontSize: 14 }}>
                          {percentageAsDelta(fastRound(i.market_cap_change_percentage_24h!))}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                )
              })}
            </View>
            <View style={{ height: 10 }} />
          </ScrollView>
        </View>
      </View>
      {modal}
      {Platform.OS === "ios" && (
        <SwipeablePanel
          fullWidth={true}
          onClose={() => closePanel()}
          isActive={isPanelActive}
          style={{
            backgroundColor: StyleLib.containerColor_bis(gc.state.env.darkmode!),
            bottom: -(mc.bottomInset * 2),
            paddingBottom: mc.banner_ad_height,
          }}
          closeOnTouchOutside={true}
          showCloseButton={false}
          onlyLarge={true}
        >
          {tc.state && <Trading />}
        </SwipeablePanel>
      )}
    </>
  )
}

export default GlobalDetails

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    margin: 20,
    borderRadius: 15,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalView_Trading: {
    maxWidth: "95%",
    maxHeight: "85%",
    borderRadius: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    overflow: "hidden",
  },
  button: {
    minWidth: 200,
    borderRadius: 10,
    padding: 10,
    elevation: 2,
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
})
