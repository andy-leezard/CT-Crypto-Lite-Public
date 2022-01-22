import React, { useState, useEffect, useContext } from "react"
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Image,
  TextInput,
  Platform,
  FlatList,
  Modal,
  Pressable,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import { SwipeablePanel } from "rn-swipeable-panel"
import i18n from "i18n-js"

import stablecoins from "../stablecoins.json"
import {
  GlobalContext,
  GlobalContextInterfaceAsReducer,
  MainContext,
  MainContextInterface,
  TradingContext,
  TradingContextInterfaceAsReducer,
} from "../ContextManager"
import { isInList, isStableCoin, toggleRegisterFavorite } from "../lib/FuncLib"
import { StackNavigationProp } from "@react-navigation/stack"
import { PriceRoutes, PriceScreens } from "../screens/Routes"
import * as StyleLib from "../lib/StyleLib"
import { Coin, ViewMode } from "../lib/Types"
import { Enum_coin_actions } from "../lib/Reducers"
import Trading from "./Trading"
import ListItem from "./prices/ListItem"
import PickerAndroid from "./widgets/PickerAndroid"
import PickeriOS from "./widgets/PickeriOS"
import Trace_RenderGlobalChange from "./Trace_RenderGlobalChange"

type ScreenProp = StackNavigationProp<PriceRoutes, PriceScreens>

const listTab: string[] = [ViewMode.PRICES, ViewMode.CAPS, ViewMode.TOPMOVERS]

const screenWidth = Dimensions.get("window").width

const Prices: React.FC = () => {
  const gc = useContext(GlobalContext) as GlobalContextInterfaceAsReducer
  const mainContext = useContext(MainContext) as MainContextInterface
  const tradingContext = useContext(
    TradingContext
  ) as TradingContextInterfaceAsReducer
  const navigation = useNavigation<ScreenProp>()
  const [viewmode, setViewmode] = useState<string>(ViewMode.PRICES)
  const [renderFavorites, setRenderFavorites] = useState<boolean>(false)
  const [keyword, setkeyword] = useState<string>("")
  const [datainterval, setdatainterval] = useState<string>(
    i18n.t("inthepast_d")
  )
  const [limit, setlimit] = useState<number>(gc.state.env.isTablet ? 35 : 15)
  const [renderData, setRenderData] = useState<any>()
  const flatListRef = React.createRef<FlatList>()
  const [extra, setExtra] = useState<boolean>(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [touchedCoin, setTouchedCoin] = useState<Coin | null>(null)

  const handleModalClose = () => {
    Platform.OS === "android" &&
      tradingContext.dispatch({ type: Enum_coin_actions.INIT })
    setModalVisible(false)
  }

  // Start - panel
  const [isPanelActive, setIsPanelActive] = useState(false)

  const openPanel = () => {
    tradingContext.dispatch({
      type: Enum_coin_actions.SET,
      payload: touchedCoin!,
    })
    if (Platform.OS === "ios") {
      setModalVisible(false)
      setIsPanelActive(true)
    }
  }

  const closePanel = () => {
    tradingContext.dispatch({ type: Enum_coin_actions.INIT })
    setIsPanelActive(false)
  }
  // End - panel

  const handleKeyword = (input: string) => {
    setlimit(gc.state.env.isTablet ? 35 : 15)
    setkeyword(input.trimStart())
    ScrollBackToTop()
  }

  const viewModeHandler = (status: string): void => {
    setlimit(gc.state.env.isTablet ? 35 : 15)
    setViewmode(status)
    ScrollBackToTop()
  }

  const toggleRenderFavorites = () => {
    setlimit(gc.state.env.isTablet ? 35 : 15)
    setRenderFavorites(!renderFavorites)
    ScrollBackToTop()
  }

  const ScrollBackToTop = () => {
    flatListRef.current!.scrollToOffset({ animated: true, offset: 0 })
  }

  const touchCoin = (coin: any) => {
    setTouchedCoin(coin)
    setModalVisible(true)
  }

  const _parseInterval = (i: string) => {
    switch (i) {
      case ViewMode.PRICES:
        return i18n.t("prices")
      case ViewMode.TOPMOVERS:
        return i18n.t("top_movers")
      case ViewMode.CAPS:
        return i18n.t("market_cap")
      default:
        return i
    }
  }

  const _setDataInterval = (i: string) => {
    mainContext.extend()
    setdatainterval(i)
  }

  useEffect(() => {
    let finaldata = [...mainContext.coindata]
    if (renderFavorites) {
      finaldata = finaldata.filter((i) =>
        mainContext.user.fav.some((item: any) => item === i.name)
      )
    }
    if (keyword.length > 0) {
      finaldata = finaldata.filter(
        (i) =>
          i.name.toLowerCase().includes(keyword.toLowerCase()) ||
          i.symbol.toLowerCase().includes(keyword.toLowerCase())
      )
    } else if (!renderFavorites && viewmode !== ViewMode.CAPS) {
      finaldata = finaldata.filter(
        (i) => !stablecoins.some((item) => item.name === i.name)
      )
    }
    if (viewmode === ViewMode.TOPMOVERS) {
      finaldata = finaldata.sort(
        (a, b) =>
          Math.abs(b.price_change_percentage_24h!) -
          Math.abs(a.price_change_percentage_24h!)
      )
    }
    setRenderData(finaldata.slice(0, limit))
    setExtra(!extra)
  }, [mainContext, keyword, renderFavorites, viewmode, limit])

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
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            position: "absolute",
          }}
          onPress={() => handleModalClose()}
        />
        {touchedCoin && !tradingContext.state && (
          <View
            style={[
              styles.modalView,
              {
                backgroundColor: StyleLib.modalBgColor(gc.state.env.darkmode!),
              },
            ]}
          >
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
                source={{ uri: touchedCoin.image }}
                style={{ width: 32, height: 32, borderRadius: 6 }}
              />
            </View>
            {isStableCoin(touchedCoin.name) ? (
              <>
                <Text
                  style={{
                    textAlign: "center",
                    color: StyleLib.textColor(gc.state.env.darkmode!),
                  }}
                >
                  {touchedCoin.name} ({touchedCoin.symbol.toUpperCase()}) #
                  {touchedCoin.market_cap_rank}
                </Text>
                <Text
                  style={{
                    marginBottom: 15,
                    textAlign: "center",
                    color: StyleLib.textColor(gc.state.env.darkmode!),
                  }}
                >
                  ({i18n.t("stablecoin")})
                </Text>
              </>
            ) : (
              <Text
                style={{
                  marginBottom: 15,
                  textAlign: "center",
                  color: StyleLib.textColor(gc.state.env.darkmode!),
                }}
              >
                {touchedCoin.name} ({touchedCoin.symbol.toUpperCase()}) #
                {i18n.t("rank") + touchedCoin.market_cap_rank}
              </Text>
            )}
            {!isStableCoin(touchedCoin.name) && (
              <TouchableOpacity
                style={[
                  styles.button,
                  { backgroundColor: "#2196F3", marginBottom: 15 },
                ]}
                onPress={openPanel}
              >
                <Text style={styles.textStyle}>{`${i18n.t("buy")}/${i18n.t(
                  "sell"
                )}`}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#2196F3" }]}
              onPress={() =>
                toggleRegisterFavorite(
                  gc.state.auth.userEmail!,
                  [...mainContext.user.fav],
                  mainContext.user.referrals.length,
                  touchedCoin.name
                )
              }
            >
              <Text style={styles.textStyle}>
                {isInList(mainContext.user.fav, touchedCoin.name)
                  ? i18n.t("unsubscribe")
                  : i18n.t("subscribe")}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        {tradingContext.state && (
          <View
            style={[
              styles.modalView_Trading,
              {
                backgroundColor: StyleLib.modalBgColor(gc.state.env.darkmode!),
              },
            ]}
          >
            <Trading />
          </View>
        )}
      </View>
    </Modal>
  )

  return (
    <>
      <View
        style={{
          backgroundColor: StyleLib.bgColor(gc.state.env.darkmode!),
          flex: 1,
          marginBottom:
            mainContext.tab_bar_height +
            mainContext.bottomInset +
            mainContext.banner_ad_height,
        }}
      >
        <View style={{ paddingHorizontal: 14, marginVertical: 10 }}>
          <View
            style={[
              {
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                alignSelf: "center",
              },
              Platform.OS === "android" && {
                width: screenWidth - 30,
                height: 22,
              },
            ]}
          >
            {Platform.OS === "android" && (
              <PickerAndroid
                datainterval={datainterval}
                globalContext={gc.state}
                callBack={_setDataInterval}
              />
            )}
            {Platform.OS === "ios" && (
              <PickeriOS
                datainterval={datainterval}
                globalContext={gc.state}
                callBack={_setDataInterval}
              />
            )}
          </View>
          <TouchableOpacity
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingTop: 5,
            }}
            onPress={() => navigation.navigate("Stack_Prices_Global")}
          >
            <Trace_RenderGlobalChange
              propdata={mainContext.changedata}
              darkmode={gc.state.env.darkmode}
            />
          </TouchableOpacity>
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 5,
            width: screenWidth,
            height: 35,
          }}
        >
          <TextInput
            style={[
              styles.input,
              {
                borderColor: StyleLib.inputRadiusColor(gc.state.env.darkmode!),
                backgroundColor: StyleLib.containerColor_sexies(
                  gc.state.env.darkmode!
                ),
                color: StyleLib.textColor(gc.state.env.darkmode!),
                height: 35,
              },
            ]}
            value={keyword}
            onChangeText={handleKeyword}
          />
          <Image
            source={require("../assets/icons/1x/search.png")}
            style={{
              width: 15,
              height: 15,
              tintColor: "#519ABA",
              position: "absolute",
              marginLeft: 20,
            }}
          />
          <TouchableOpacity
            style={{ marginRight: 10 }}
            onPress={() => toggleRenderFavorites()}
          >
            {renderFavorites ? (
              <View
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 5,
                  borderWidth: 2,
                  borderColor: "#BCAB34",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Image
                  source={require("../assets/icons/1x/bell_on.png")}
                  style={{ width: 20, height: 20, tintColor: "#BCAB34" }}
                />
              </View>
            ) : (
              <View
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 5,
                  borderWidth: 2,
                  borderColor: "#519ABA",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Image
                  source={require("../assets/icons/1x/bell_off.png")}
                  style={{ width: 20, height: 20, tintColor: "#519ABA" }}
                />
              </View>
            )}
          </TouchableOpacity>
        </View>
        <View
          style={{
            paddingHorizontal: 10,
            height: 30,
            alignItems: "center",
            marginBottom: 5,
          }}
        >
          <View
            style={[
              styles.listTab,
              gc.state.env.darkmode
                ? { backgroundColor: "white" }
                : { backgroundColor: "#E3E3E3" },
            ]}
          >
            {listTab.map((i, index) => (
              <View key={index}>
                <TouchableOpacity
                  style={[styles.btnTab, viewmode === i && styles.btnTabActive]}
                  onPress={() => viewModeHandler(i)}
                >
                  <Text style={{ fontSize: 14, fontWeight: "bold" }}>
                    {_parseInterval(i)}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
        <View
          style={{
            flex: 1,
            width: screenWidth - 20,
            marginBottom: 5,
            alignSelf: "center",
            backgroundColor: StyleLib.containerColor_sexies(
              gc.state.env.darkmode!
            ),
            borderRadius: 10,
            bottom: 0,
          }}
        >
          {
            <FlatList
              data={renderData}
              renderItem={({ item }) => {
                return (
                  <ListItem
                    coin={item}
                    keyword={keyword}
                    datainterval={datainterval}
                    viewmode={viewmode}
                    touchCoin={(coin) => touchCoin(coin)}
                  />
                )
              }}
              onRefresh={() => mainContext.reload(false)}
              refreshing={mainContext.fetching}
              ref={flatListRef}
              keyExtractor={(item) => item.id}
              onEndReached={() => {
                setlimit(limit + 20)
              }}
              onEndReachedThreshold={0.1}
              initialNumToRender={gc.state.env.isTablet ? 35 : 15}
              extraData={extra}
            />
          }
        </View>
      </View>
      {modal}
      {Platform.OS === "ios" && (
        <SwipeablePanel
          fullWidth={true}
          onClose={() => closePanel()}
          isActive={isPanelActive}
          style={{
            backgroundColor: StyleLib.containerColor_bis(
              gc.state.env.darkmode!
            ),
            bottom: -(mainContext.bottomInset * 2),
            paddingBottom: mainContext.banner_ad_height,
          }}
          closeOnTouchOutside={true}
          showCloseButton={false}
          onlyLarge={true}
        >
          {tradingContext.state && <Trading />}
        </SwipeablePanel>
      )}
    </>
  )
}

export default Prices

const styles = StyleSheet.create({
  listTab: {
    flex: 1,
    justifyContent: "space-between",
    flexDirection: "row",
    borderRadius: 10,
    width: "100%",
  },
  btnTab: {
    width: (screenWidth - 20) / 3,
    flexDirection: "row",
    padding: 5,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    height: "100%",
  },
  btnTabActive: {
    backgroundColor: "#809eff",
  },
  input: {
    width: screenWidth - 57,
    marginLeft: 10,
    paddingHorizontal: 10,
    paddingLeft: 30,
    borderWidth: 2,
    borderRadius: 10,
    fontSize: 15,
  },
  interval_btnTab: {
    borderRadius: 3,
    paddingHorizontal: 4,
    width: 50,
  },
  interval_text: {
    fontWeight: "bold",
    fontSize: 15,
    textAlign: "center",
  },
  interval_textActive: {
    //for darkmode
    color: "#468559",
  },

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
    color: "#ffffff",
    fontWeight: "bold",
    textAlign: "center",
  },
})
