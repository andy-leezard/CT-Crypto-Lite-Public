import React, {
  useState,
  useEffect,
  useContext,
  useLayoutEffect,
  useRef,
  useMemo,
} from "react"
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  Modal,
  Pressable,
  Platform,
  FlatList,
} from "react-native"
import { PieChart } from "react-native-chart-kit"
import { db } from "../../firebase"
import i18n from "i18n-js"
import {
  GlobalContext,
  GlobalContextInterfaceAsReducer,
  MainContext,
  MainContextInterface,
  PortfolioContext,
  TradingContext,
  TradingContextInterfaceAsReducer,
} from "../ContextManager"
import { Coin, Coin_Asso, CT_Wallet, TotalPortfolio } from "../lib/Types"
import {
  autoRound,
  avoidScientificNotation_withSign,
  dynamicRound,
  isNumber,
  isStableCoin,
  numberWithCommas,
  referralsToDiscountRate,
} from "../lib/FuncLib"
import * as StyleLib from "../lib/StyleLib"
import { SwipeablePanel } from "rn-swipeable-panel"
import { Enum_coin_actions } from "../lib/Reducers"
import Trading from "./Trading"
import Env from "../env.json"
import { TextInput } from "react-native-gesture-handler"
import I18n from "i18n-js"
import SearchedFriend from "./social/SearchedFriend"

const screenWidth = Dimensions.get("window").width
const width = screenWidth - 20

interface Props {
  route: any
  navigation: any
}

const chartConfig = {
  backgroundGradientFrom: "#000000",
  backgroundGradientTo: "#000000",
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
}

const Portfolio: React.FC<Props> = ({ route, navigation }) => {
  const gc = useContext(GlobalContext) as GlobalContextInterfaceAsReducer
  const mc = useContext(MainContext) as MainContextInterface
  const tc = useContext(TradingContext) as TradingContextInterfaceAsReducer
  const portfolioContext = useContext(PortfolioContext) as {
    portfolio: TotalPortfolio
  }
  const [viewStatus, setViewStatus] = useState<number>(0)
  const [modalVisible, setModalVisible] = useState(false)
  const [touchedCoin, setTouchedCoin] = useState<Coin | null>(null)

  const [modalVisible_send, setModalVisible_send] = useState(false)
  const [sendPhase, setSendPhase] = useState<number>(0)
  const [beneficiary_keywords, setBeneficiary_keywords] = useState<string>("")
  const [beneficiary, setBeneficiary] = useState<any>(null)
  const [send_vusd_amount, set_send_vusd_Amount] = useState<any>("")
  const [sent, setSent] = useState<boolean>(false)
  const [sending, setSending] = useState<boolean>(false)
  const [searchedFriends, setSearchedFriends] = useState<any[]>([])
  const [discountRate, setDiscountRate] = useState<number>(0)
  const inputRef = useRef<TextInput>(null)

  useLayoutEffect(() => {
    setDiscountRate(
      dynamicRound(
        (1 - referralsToDiscountRate(mc.user.referrals.length)) * 100,
        2
      )
    )
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={{
            width: 30,
            height: 25,
            borderRadius: 5,
            marginRight: 10,
            backgroundColor: "#CBCBCB",
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={() => toggleViewStatus()}
        >
          {viewStatus === 0 && (
            <Image
              source={require("../assets/icons/1x/view.png")}
              style={{ width: 20, height: 20, tintColor: "#40B2AB" }}
            />
          )}
          {viewStatus === 1 && (
            <Image
              source={require("../assets/icons/1x/hide.png")}
              style={{ width: 20, height: 20, tintColor: "#2D7E71" }}
            />
          )}
          {viewStatus === 2 && (
            <Image
              source={require("../assets/icons/1x/hide.png")}
              style={{ width: 20, height: 20, tintColor: "#D65F3E" }}
            />
          )}
        </TouchableOpacity>
      ),
    })
  }, [viewStatus])

  const sending_fee = useMemo(() => {
    if (sendPhase < 1) {
      return 0
    } else {
      return dynamicRound(
        Number(send_vusd_amount) *
          0.01 *
          referralsToDiscountRate(mc.user.referrals.length),
        2
      )
    }
  }, [sendPhase, send_vusd_amount])

  const handleModalClose = () => {
    Platform.OS === "android" && tc.dispatch({ type: Enum_coin_actions.INIT })
    setModalVisible(false)
    setModalVisible_send(false)
    setSendPhase(0)
    setBeneficiary_keywords("")
    setBeneficiary(null)
    set_send_vusd_Amount("")
    setSent(false)
    setSending(false)
    setSearchedFriends([])
  }
  const touchCoin = (coin: Coin_Asso) => {
    setTouchedCoin({
      name: coin.name,
      image: coin.img,
      current_price: coin.crntPrice,
      symbol: coin.id,
      market_cap_rank: coin.rank,
      id: coin.url,
    })
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

  const tryDeleteDelisted = (i: string, s: string) => {
    Alert.alert(
      i18n.t("delisted_crypto"),
      `${i} (${s}) ${i18n.t("delisted_er1")}\n${i18n.t(
        "delisted_er2_pre"
      )} ${s} ${i18n.t("delisted_er2_suf")}\n${i18n.t("delisted_er3")}`,
      [
        { text: i18n.t("confirm"), onPress: () => deleteDelisted(i) },
        { text: i18n.t("cancel"), style: "cancel" },
      ]
    )
  }

  const deleteDelisted = (i: string) => {
    db.collection("users")
      .doc(gc.state.auth.userEmail!)
      .collection("wallet")
      .doc(i)
      .delete()
      .then(() => {
        Alert.alert(
          i18n.t("notification"),
          `${i18n.t("delisted_requested_pre")} ${i} ${i18n.t(
            "delisted_requested_suf"
          )}`,
          [{ text: i18n.t("ok") }]
        )
      })
      .catch((e) => {
        Alert.alert(i18n.t("error"), e, [{ text: i18n.t("ok") }])
      })
  }

  const searchFriends = async (keyword: string) => {
    let usernamesRef = await db
      .collection("usernames")
      .where("keywords", "array-contains", keyword)
      .limit(20)
      .get()
    let docs = usernamesRef.docs.map((doc) => doc.data())
    setSearchedFriends(docs)
  }

  const sendMoney = async (
    beneficiary_email: string,
    beneficiary_username: string,
    amount: number,
    fee: number
  ) => {
    setSending(true)
    const time = new Date().getTime()
    const total_spending = amount + fee
    let newSeed = dynamicRound(mc.user.seed - total_spending, 2)
    let newTotalBuyin = dynamicRound(mc.user.totalbuyin! - total_spending, 2)
    let newTotalBuyin_const = dynamicRound(
      mc.user.totalbuyin_const! - total_spending,
      2
    )
    let th = mc.user.pnldate as number
    try {
      await Promise.all([
        db.collection("transfers").add({
          sender: mc.user.username,
          sender_email: gc.state.auth.userEmail,
          beneficiary: beneficiary_email,
          amount: amount,
          timestamp: time,
        }),
        db
          .collection("users")
          .doc(gc.state.auth.userEmail!)
          .collection("history")
          .add({
            type: "Wired",
            beneficiary: beneficiary_username,
            target: "VUSD",
            targetName: "Virtual USD",
            quantity: amount,
            fiat: -1,
            price: 1,
            imgsrc: Env.fiatCoinIcon,
            orderNum: time,
            paid_fee: fee,
          }),
        db.collection("users").doc(gc.state.auth.userEmail!).update({
          seed: newSeed,
          totalbuyin: newTotalBuyin,
          totalbuyin_constant: newTotalBuyin_const,
        }),
      ])
    } catch (e) {
      Alert.alert(I18n.t("error"), I18n.t("p_upgrade.er_1"), [
        { text: I18n.t("ok") },
      ])
    } finally {
      set_send_vusd_Amount("")
      setSending(false)
      setSent(true)
    }
  }

  useEffect(() => {
    if (beneficiary_keywords.length > 2) {
      searchFriends(beneficiary_keywords.toLowerCase())
    }
  }, [beneficiary_keywords])

  const toggleViewStatus = () => {
    viewStatus < 2 ? setViewStatus(viewStatus + 1) : setViewStatus(0)
  }

  const conditionalRender = (i: any, degree: number, length: number) => {
    return degree >= viewStatus ? i : new String("*").repeat(length)
  }
  const displayChange = (i: Coin_Asso) => {
    return dynamicRound(
      (i.crntPrice / (i.avg_price ?? i.crntPrice) - 1) * 100,
      2
    )
  }

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
        {touchedCoin && !tc.state && (
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
                  {touchedCoin.name} ({touchedCoin.symbol.toUpperCase()})
                </Text>
                <Text style={{ marginBottom: 15, textAlign: "center" }}>
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
                {touchedCoin.name} ({touchedCoin.symbol.toUpperCase()})
              </Text>
            )}
            {/*<Pressable
              style={[styles.button, { backgroundColor: "#2196F3", marginBottom: 15 }]}
              onPress={() => toggleRegisterFavorite(touchedCoin.name)}
            >
              <Text style={styles.textStyle}>
                {isInList(mc.user.fav, touchedCoin.name) ? i18n.t("unsubscribe") : i18n.t("subscribe")}
              </Text>
            </Pressable>*/}
            {!isStableCoin(touchedCoin.name) && (
              <Pressable
                style={[styles.button, { backgroundColor: "#2196F3" }]}
                onPress={openPanel}
              >
                <Text style={styles.textStyle}>
                  {i18n.t("buy")}/{i18n.t("sell")}
                </Text>
              </Pressable>
            )}
          </View>
        )}
        {tc.state && (
          <View
            style={[
              styles.modalView_Trading,
              { backgroundColor: StyleLib.bgColor(gc.state.env.darkmode!) },
            ]}
          >
            <Trading />
          </View>
        )}
      </View>
    </Modal>
  )

  const send_modal = (
    <Modal
      animationType="fade"
      hardwareAccelerated={true}
      transparent={true}
      visible={modalVisible_send}
      onRequestClose={() => {
        if (!sending) {
          handleModalClose()
        }
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
          onPress={() => {
            if (!sending) {
              handleModalClose()
            }
          }}
        />
        <View
          style={[
            styles.modalView,
            { backgroundColor: StyleLib.modalBgColor(gc.state.env.darkmode!) },
          ]}
          onTouchStart={() => {
            if (inputRef?.current?.blur) {
              inputRef!.current!.blur()
            }
          }}
        >
          <View
            style={{
              justifyContent: "center",
              width: 38,
              height: 38,
              borderRadius: 8,
              backgroundColor: "white",
              alignItems: "center",
              marginBottom: 5,
            }}
          >
            <Image
              source={{ uri: Env.fiatCoinIcon }}
              style={{ width: 32, height: 32, borderRadius: 6 }}
            />
          </View>
          {sendPhase ? (
            <>
              <Text
                style={{
                  textAlign: "center",
                  marginBottom: sendPhase === 2 ? 0 : 15,
                  color: StyleLib.textColor(gc.state.env.darkmode!),
                }}
              >
                {`${
                  sendPhase === 1
                    ? I18n.t("transfer_amount")
                    : sendPhase === 2
                    ? I18n.t("beneficiary")
                    : sendPhase === 3 && sending
                    ? `${I18n.t("sending")}...`
                    : sendPhase === 3 && sent
                    ? `${I18n.t("sent_pre")} ${send_vusd_amount} VUSD ${I18n.t(
                        "to_pre"
                      )} ${beneficiary.caseSensitive}${I18n.t(
                        "to_suf_s"
                      )}${I18n.t("sent_suf")}!`
                    : sendPhase === 3
                    ? `${I18n.t(
                        "confirm_transfer_pre"
                      )} ${send_vusd_amount} VUSD ${I18n.t("to_pre")} ${
                        beneficiary.caseSensitive
                      }${I18n.t("to_suf")}${I18n.t("confirm_transfer_suf")}`
                    : ""
                }`}
              </Text>
              {sendPhase === 2 && (
                <Text
                  style={{
                    textAlign: "center",
                    marginBottom: 15,
                    color: StyleLib.textColor(gc.state.env.darkmode!),
                  }}
                >
                  ({I18n.t("search_by")})
                </Text>
              )}
            </>
          ) : (
            <>
              <Text
                style={{
                  textAlign: "center",
                  color: StyleLib.textColor(gc.state.env.darkmode!),
                }}
              >
                VUSD
              </Text>
              <Text
                style={{
                  textAlign: "center",
                  marginBottom: 15,
                  color: StyleLib.textColor(gc.state.env.darkmode!),
                }}
              >
                ( {I18n.t("full_vusd")} )
              </Text>
            </>
          )}
          {sendPhase === 1 && (
            <>
              <TextInput
                keyboardType="number-pad"
                placeholder="amount"
                ref={inputRef}
                style={{
                  paddingHorizontal: 10,
                  height: 40,
                  width: 200,
                  marginBottom: 12,
                  borderRadius: 10,
                  fontSize: 20,
                  color: "#FFFFFF",
                  textAlign: "center",
                  backgroundColor: gc.state.env.darkmode
                    ? "#333333"
                    : "rgba(0,0,0,0.25)",
                }}
                value={send_vusd_amount}
                onChangeText={(e) => {
                  if (isNumber(e) || e === "") {
                    set_send_vusd_Amount(e)
                  }
                }}
                maxLength={8}
              />
              <Text
                style={{
                  fontWeight: "bold",
                  color: StyleLib.textColor(gc.state.env.darkmode!),
                }}
              >
                {I18n.t("transfer_fee")} : {sending_fee}$ (
                {dynamicRound(
                  1 * referralsToDiscountRate(mc.user.referrals.length),
                  2
                )}
                %)
              </Text>
              <Text
                style={{
                  fontWeight: "300",
                  color: StyleLib.textColor(gc.state.env.darkmode!),
                  marginBottom: 5,
                }}
              >
                - {discountRate}% {I18n.t("from_referrals")}
              </Text>
              <Text
                style={{
                  fontWeight: "bold",
                  color: StyleLib.textColor(gc.state.env.darkmode!),
                  marginBottom: 10,
                }}
              >
                {I18n.t("my_fund")} : {mc.user.seed}$
              </Text>
            </>
          )}
          {sendPhase === 2 && (
            <>
              <TextInput
                keyboardType="default"
                placeholder="beneficiary"
                ref={inputRef}
                style={{
                  paddingHorizontal: 10,
                  height: 40,
                  width: 200,
                  marginBottom: 10,
                  borderRadius: 10,
                  fontSize: 20,
                  color: "#FFFFFF",
                  textAlign: "center",
                  backgroundColor: gc.state.env.darkmode
                    ? "#333333"
                    : "rgba(0,0,0,0.25)",
                }}
                value={beneficiary_keywords}
                onChangeText={setBeneficiary_keywords}
                maxLength={32}
              />
              <View
                style={{
                  width: Math.min(screenWidth * 0.75, 300),
                  height: 200,
                  overflow: "scroll",
                  backgroundColor: StyleLib.containerColor_bis(
                    gc.state.env.darkmode!
                  ),
                  borderRadius: 10,
                  padding: 5,
                  marginBottom: 15,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {searchedFriends.length > 0 ? (
                  <FlatList
                    style={{ borderRadius: 5 }}
                    data={searchedFriends}
                    renderItem={({ item }) => (
                      <SearchedFriend
                        i={item}
                        width={Math.min(screenWidth * 0.75, 300) - 15}
                        touchCallback={(i: any) => {
                          if (i.email !== gc.state.auth.userEmail!) {
                            setBeneficiary(i)
                            setSendPhase((prev) => prev + 1)
                          } else {
                            Alert.alert(I18n.t("error"), I18n.t("send_er"), [
                              { text: I18n.t("ok") },
                            ])
                          }
                        }}
                      />
                    )}
                    keyExtractor={(item) => item.caseSensitive}
                    onEndReachedThreshold={0.5}
                    initialNumToRender={10}
                  />
                ) : (
                  <Text
                    style={{
                      fontWeight: "bold",
                      color: StyleLib.textColor(gc.state.env.darkmode!),
                    }}
                  >
                    {I18n.t("no_result")}
                  </Text>
                )}
              </View>
            </>
          )}
          {sendPhase === 3 && beneficiary?.imgsrc && (
            <Image
              style={{
                height: 50,
                width: 50,
                borderRadius: 10,
                marginBottom: 5,
              }}
              source={
                beneficiary?.imgsrc
                  ? { uri: beneficiary.imgsrc }
                  : require("../assets/icons/1x/defaultUserProfile_action.png")
              }
            />
          )}
          {sendPhase === 0 && mc.rewarded_ad_available && (
            <TouchableOpacity
              style={{
                width: 200,
                height: 40,
                borderRadius: 10,
                backgroundColor: "#2196F3",
                marginVertical: 10,
                padding: 5,
                justifyContent: "center",
                alignItems: "center",
              }}
              onPress={() => mc.show_ad()}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: "#FFFFFF",
                }}
              >
                {I18n.t("random_reward_pre").toLowerCase() +
                  " " +
                  I18n.t("random_reward_suf").toLowerCase()}
              </Text>
            </TouchableOpacity>
          )}
          {sendPhase === 0 && !mc.rewarded_ad_available && (
            <TouchableOpacity
              style={{
                width: 200,
                height: 40,
                borderRadius: 10,
                backgroundColor: "#a3a3a3",
                marginVertical: 10,
                padding: 5,
                justifyContent: "center",
                alignItems: "center",
              }}
              onPress={() => mc.show_rewarded_ad_error_message()}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: "#FFFFFF",
                }}
              >
                {I18n.t("reward_er1").toLowerCase()}
              </Text>
            </TouchableOpacity>
          )}
          {!Boolean(sendPhase === 1 && !send_vusd_amount) && sendPhase !== 2 && (
            <Pressable
              disabled={sending}
              style={[
                styles.button,
                { backgroundColor: sending ? "#333333" : "#2196F3" },
              ]}
              onPress={() => {
                if (sendPhase === 1) {
                  if (Number(send_vusd_amount) + sending_fee > mc.user.seed) {
                    Alert.alert(I18n.t("error"), I18n.t("p_upgrade.er_2"), [
                      { text: I18n.t("ok") },
                    ])
                  } else {
                    setSendPhase((prev) => prev + 1)
                  }
                } else if (sendPhase < 3) {
                  setSendPhase((prev) => prev + 1)
                } else if (sendPhase === 3) {
                  if (!sent && !sending) {
                    sendMoney(
                      beneficiary.email,
                      beneficiary.caseSensitive,
                      Number(send_vusd_amount),
                      sending_fee
                    )
                  } else {
                    setSent(false)
                    setSendPhase(1)
                    setBeneficiary(null)
                  }
                }
              }}
            >
              <Text style={styles.textStyle}>{`${
                sendPhase === 0
                  ? I18n.t("send_vusd")
                  : sendPhase === 1
                  ? I18n.t("confirm")
                  : sendPhase === 3 && sending
                  ? I18n.t("s_processing")
                  : sendPhase === 3 && sent
                  ? I18n.t("continue_s")
                  : sendPhase === 3
                  ? I18n.t("confirm")
                  : ""
              }`}</Text>
            </Pressable>
          )}
          <Pressable
            disabled={sending}
            style={[
              styles.button,
              { backgroundColor: "#2196F3", marginTop: 10 },
            ]}
            onPress={() => {
              if (sendPhase <= 0 || Boolean(sendPhase >= 3 && sent)) {
                handleModalClose()
              } else {
                setSendPhase((prev) => prev - 1)
              }
            }}
          >
            <Text style={styles.textStyle}>
              {sendPhase < 3 ? I18n.t("cancel") : I18n.t("done")}
            </Text>
          </Pressable>
        </View>
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
            mc.tab_bar_height + mc.bottomInset + mc.banner_ad_height,
        }}
      >
        <View
          style={{
            width: width,
            borderRadius: 10,
            borderWidth: 3,
            borderColor: StyleLib.containerRadiusColor_bis(
              gc.state.env.darkmode!
            ),
            backgroundColor: StyleLib.containerColor_bis(
              gc.state.env.darkmode!
            ),
            padding: 10,
            marginBottom: 10,
            marginTop: 10,
            alignSelf: "center",
          }}
        >
          <TouchableOpacity
            style={{ alignSelf: "center" }}
            onPress={() => toggleViewStatus()}
          >
            <Text
              style={{
                position: "absolute",
                alignSelf: "flex-start",
                color: StyleLib.textColor(gc.state.env.darkmode!),
                fontSize: 16,
                marginBottom: 10,
                fontWeight: "bold",
                marginLeft: 10,
              }}
            >
              {i18n.t("tot_value")} : $
              {conditionalRender(
                portfolioContext.portfolio.totalAppreciation,
                0,
                6
              )}{" "}
              ({i18n.t("fiat")}:
              {conditionalRender(
                dynamicRound(
                  (mc.user.seed /
                    portfolioContext.portfolio.totalAppreciation) *
                    100,
                  2
                ),
                1,
                2
              )}
              %)
            </Text>
            {portfolioContext.portfolio.piedata != undefined && (
              <View style={{ marginTop: 8 }}>
                <PieChart
                  width={width - 20}
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
        <View
          style={{
            flex: 1,
            width: width,
            marginBottom: 5,
            alignSelf: "center",
            backgroundColor: StyleLib.containerColor_bis(
              gc.state.env.darkmode!
            ),
            borderRadius: 10,
          }}
        >
          <ScrollView>
            <View style={{ alignItems: "center" }}>
              <TouchableOpacity
                onPress={() => navigation.navigate("Stack_History")}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    borderWidth: 2,
                    borderRadius: 10,
                    borderColor: StyleLib.containerRadiusColor_bis(
                      gc.state.env.darkmode!
                    ),
                    backgroundColor: StyleLib.containerColor_bis(
                      gc.state.env.darkmode!
                    ),
                    width: width - 20,
                    minHeight: 50,
                    padding: 5,
                    marginTop: 10,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      width: width / 2 - 15,
                      alignItems: "center",
                    }}
                  >
                    <Image
                      source={require("../assets/icons/1x/Analytic.png")}
                      style={{
                        width: 32,
                        height: 32,
                        tintColor: "#40AAF2",
                        marginLeft: 3,
                      }}
                    />
                    <View style={{ flexDirection: "column" }}>
                      <Text
                        style={{
                          fontSize: 15,
                          fontWeight: "bold",
                          color: StyleLib.textColor(gc.state.env.darkmode!),
                          marginLeft: 11,
                        }}
                      >
                        {`${i18n.t("my_pnl")} & ${i18n.t("history")}`}
                      </Text>
                      <Text
                        style={{
                          fontSize: 15,
                          fontWeight: "bold",
                          color: StyleLib.subTextColor_ter(
                            gc.state.env.darkmode!
                          ),
                          marginLeft: 11,
                        }}
                      >
                        {i18n.t("all_time")}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={{ flexDirection: "column", width: width / 2 - 15 }}
                  >
                    {portfolioContext.portfolio.pnl_const >= 0 ? (
                      <Text
                        style={[
                          styles.changetext,
                          viewStatus > 1
                            ? gc.state.env.darkmode
                              ? styles.changetext_neutral_dark
                              : styles.changetext_neutral_light
                            : {
                                color: StyleLib.buyColor(
                                  gc.state.env.darkmode!
                                ),
                              },
                        ]}
                      >
                        {viewStatus < 2 && "+"}
                        {conditionalRender(
                          portfolioContext.portfolio.pnl_const,
                          1,
                          2
                        )}
                        %
                      </Text>
                    ) : (
                      <Text
                        style={[
                          styles.changetext,
                          viewStatus > 1
                            ? gc.state.env.darkmode
                              ? styles.changetext_neutral_dark
                              : styles.changetext_neutral_light
                            : {
                                color: StyleLib.sellColor(
                                  gc.state.env.darkmode!
                                ),
                              },
                        ]}
                      >
                        {conditionalRender(
                          portfolioContext.portfolio.pnl_const,
                          1,
                          2
                        )}
                        %
                      </Text>
                    )}
                    {portfolioContext.portfolio.pnl_const >= 0 ? (
                      <Text
                        style={
                          gc.state.env.darkmode
                            ? styles.changetext_neutral_dark
                            : styles.changetext_neutral_light
                        }
                      >
                        {viewStatus < 1 && "+"} $
                        {conditionalRender(
                          numberWithCommas(
                            dynamicRound(
                              portfolioContext.portfolio.totalAppreciation -
                                mc.user.totalbuyin_const,
                              2
                            )
                          ),
                          0,
                          6
                        )}
                      </Text>
                    ) : (
                      <Text
                        style={
                          gc.state.env.darkmode
                            ? styles.changetext_neutral_dark
                            : styles.changetext_neutral_light
                        }
                      >
                        {viewStatus < 1 && "-"} $
                        {conditionalRender(
                          numberWithCommas(
                            Math.abs(
                              dynamicRound(
                                portfolioContext.portfolio.totalAppreciation -
                                  mc.user.totalbuyin_const,
                                2
                              )
                            )
                          ),
                          0,
                          6
                        )}
                      </Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
              {/*<TouchableOpacity onPress={triggerUpdatePNL}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    borderWidth: 2,
                    borderRadius: 10,
                    borderColor: StyleLib.containerRadiusColor_bis(gc.state.env.darkmode!),
                    backgroundColor: StyleLib.containerColor_bis(gc.state.env.darkmode!),
                    width: width - 20,
                    minHeight: 50,
                    padding: 5,
                    marginTop: 10,
                  }}
                >
                  <View style={{ flexDirection: "row", width: width / 2 - 15, alignItems: "center" }}>
                    <Image
                      source={require("../assets/icons/1x/Analytic.png")}
                      style={{ width: 32, height: 32, tintColor: "#40AAF2", marginLeft: 3 }}
                    />
                    <View style={{ flexDirection: "column" }}>
                      <Text
                        style={{
                          fontSize: 15,
                          fontWeight: "bold",
                          color: StyleLib.textColor(gc.state.env.darkmode!),
                          marginLeft: 11,
                        }}
                      >
                        {i18n.t("my_dy_pnl")}
                      </Text>
                      <Text
                        style={{
                          fontSize: 15,
                          fontWeight: "bold",
                          color: StyleLib.subTextColor_ter(gc.state.env.darkmode!),
                          marginLeft: 11,
                        }}
                      >
                        {i18n.t("since_pre")}{" "}
                        {typeof mc.user.pnldate == "number"
                          ? new Date(mc.user.pnldate).toLocaleDateString(i18n.currentLocale())
                          : mc.user.pnldate}{" "}
                        {i18n.t("since_suf")}
                      </Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: "column", width: width / 2 - 15 }}>
                    {portfolioContext.portfolio.pnl >= 0 ? (
                      <Text
                        style={[
                          styles.changetext,
                          viewStatus > 1
                            ? gc.state.env.darkmode
                              ? styles.changetext_neutral_dark
                              : styles.changetext_neutral_light
                            : { color: StyleLib.buyColor(gc.state.env.darkmode!) },
                        ]}
                      >
                        {viewStatus < 2 && "+"}
                        {conditionalRender(portfolioContext.portfolio.pnl, 1, 2)}%
                      </Text>
                    ) : (
                      <Text
                        style={[
                          styles.changetext,
                          viewStatus > 1
                            ? gc.state.env.darkmode
                              ? styles.changetext_neutral_dark
                              : styles.changetext_neutral_light
                            : { color: StyleLib.sellColor(gc.state.env.darkmode!) },
                        ]}
                      >
                        {conditionalRender(portfolioContext.portfolio.pnl, 1, 2)}%
                      </Text>
                    )}
                    {portfolioContext.portfolio.pnl >= 0 ? (
                      <Text
                        style={gc.state.env.darkmode ? styles.changetext_neutral_dark : styles.changetext_neutral_light}
                      >
                        {viewStatus < 1 && "+"} $
                        {conditionalRender(
                          numberWithCommas(
                            dynamicRound(portfolioContext.portfolio.totalAppreciation - mc.user.totalbuyin, 2)
                          ),
                          0,
                          6
                        )}
                      </Text>
                    ) : (
                      <Text
                        style={gc.state.env.darkmode ? styles.changetext_neutral_dark : styles.changetext_neutral_light}
                      >
                        {viewStatus < 1 && "-"} $
                        {conditionalRender(
                          numberWithCommas(
                            Math.abs(dynamicRound(portfolioContext.portfolio.totalAppreciation - mc.user.totalbuyin, 2))
                          ),
                          0,
                          6
                        )}
                      </Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>*/}
              <TouchableOpacity onPress={() => setModalVisible_send(true)}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    borderWidth: 2,
                    borderRadius: 10,
                    borderColor: StyleLib.containerRadiusColor_bis(
                      gc.state.env.darkmode!
                    ),
                    backgroundColor: StyleLib.containerColor_bis(
                      gc.state.env.darkmode!
                    ),
                    width: width - 20,
                    minHeight: 50,
                    padding: 5,
                    marginTop: 10,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      width: width / 2 - 15,
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
                    <Image
                      source={require("../assets/icons/1x/usd_custom.png")}
                      style={{ width: 32, height: 32, marginLeft: 3 }}
                    />
                    <View
                      style={{
                        flexDirection: "column",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: "bold",
                          color: StyleLib.textColor(gc.state.env.darkmode!),
                          marginLeft: 11,
                        }}
                      >
                        {i18n.t("my_wallet_pre")} VUSD {i18n.t("my_wallet_suf")}
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "bold",
                          color: StyleLib.subTextColor_ter(
                            gc.state.env.darkmode!
                          ),
                          marginLeft: 11,
                        }}
                      >
                        {" "}
                        {i18n.t("full_vusd")}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={{ flexDirection: "column", width: width / 2 - 15 }}
                  >
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: "bold",
                        color: StyleLib.textColor(gc.state.env.darkmode!),
                        marginRight: 5,
                        textAlign: "right",
                      }}
                    >
                      $
                      {conditionalRender(
                        numberWithCommas(dynamicRound(mc.user.seed, 2)),
                        0,
                        6
                      )}
                    </Text>
                    <Text
                      style={[
                        gc.state.env.darkmode
                          ? styles.changetext_neutral_dark
                          : styles.changetext_neutral_light,
                        {
                          fontSize: 15,
                          fontWeight: "bold",
                          marginRight: 5,
                          textAlign: "right",
                        },
                      ]}
                    >
                      {conditionalRender(mc.user.seed, 0, 6)} VUSD
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
              {portfolioContext.portfolio.associatedData.map(
                (i: Coin_Asso, index: number) => {
                  if (i.id != "VUSD") {
                    const change_percentage = displayChange(i)
                    return (
                      <TouchableOpacity
                        key={index}
                        onPress={() => touchCoin(i)}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            borderWidth: 2,
                            borderRadius: 10,
                            borderColor: StyleLib.containerRadiusColor_bis(
                              gc.state.env.darkmode!
                            ),
                            backgroundColor: StyleLib.containerColor_bis(
                              gc.state.env.darkmode!
                            ),
                            width: width - 20,
                            minHeight: 50,
                            padding: 5,
                            marginTop: 10,
                          }}
                        >
                          <View
                            style={{
                              flexDirection: "row",
                              width: width / 2 - 15,
                              alignItems: "center",
                            }}
                          >
                            <View
                              style={{
                                width: 38,
                                height: 38,
                                borderRadius: 8,
                                backgroundColor: "white",
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                            >
                              <Image
                                source={{ uri: i.img }}
                                style={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: 6,
                                }}
                              />
                            </View>
                            <View
                              style={{
                                flexDirection: "column",
                                justifyContent: "space-between",
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 18,
                                  fontWeight: "bold",
                                  color: StyleLib.textColor(
                                    gc.state.env.darkmode!
                                  ),
                                  marginLeft: 11,
                                }}
                              >
                                {i18n.t("my_wallet_pre")} {i.id}{" "}
                                {i18n.t("my_wallet_suf")}
                              </Text>
                              {viewStatus < 2 ? (
                                <Text
                                  style={[
                                    {
                                      fontSize: 13,
                                      fontWeight: "bold",
                                      marginLeft: 11,
                                    },
                                    change_percentage >= 0
                                      ? {
                                          color: StyleLib.buyColor(
                                            gc.state.env.darkmode!
                                          ),
                                        }
                                      : {
                                          color: StyleLib.sellColor(
                                            gc.state.env.darkmode!
                                          ),
                                        },
                                  ]}
                                >
                                  {" "}
                                  {change_percentage > 0 &&
                                    viewStatus === 0 &&
                                    "+"}
                                  {conditionalRender(
                                    avoidScientificNotation_withSign(
                                      i.crntPrice * i.quantity -
                                        i.avg_price * i.quantity
                                    ),
                                    0,
                                    4
                                  )}
                                  $ (
                                  {change_percentage > 0 &&
                                    viewStatus <= 1 &&
                                    "+"}
                                  {conditionalRender(
                                    numberWithCommas(change_percentage),
                                    1,
                                    2
                                  )}
                                  %)
                                </Text>
                              ) : (
                                <Text
                                  style={{
                                    fontSize: 13,
                                    fontWeight: "bold",
                                    marginLeft: 11,
                                    color: StyleLib.subTextColor_ter(
                                      gc.state.env.darkmode!
                                    ),
                                  }}
                                >
                                  current price :{" "}
                                  {avoidScientificNotation_withSign(
                                    i.crntPrice
                                  )}
                                  $
                                </Text>
                              )}
                            </View>
                          </View>
                          <View
                            style={{
                              flexDirection: "column",
                              width: width / 2 - 15,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 15,
                                fontWeight: "bold",
                                color: StyleLib.textColor(
                                  gc.state.env.darkmode!
                                ),
                                marginRight: 5,
                                textAlign: "right",
                              }}
                            >
                              $
                              {conditionalRender(
                                numberWithCommas(
                                  dynamicRound(i.quantity * i.crntPrice, 2)
                                ),
                                0,
                                6
                              )}
                            </Text>
                            <Text
                              style={[
                                gc.state.env.darkmode
                                  ? styles.changetext_neutral_dark
                                  : styles.changetext_neutral_light,
                                {
                                  fontSize: 15,
                                  fontWeight: "bold",
                                  marginRight: 5,
                                  textAlign: "right",
                                },
                              ]}
                            >
                              {conditionalRender(
                                numberWithCommas(autoRound(i.quantity)),
                                0,
                                6
                              )}{" "}
                              {i.id}
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    )
                  }
                }
              )}
              {portfolioContext.portfolio.delisted.map(
                (i: CT_Wallet, index: number) => {
                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() => tryDeleteDelisted(i.name!, i.symbol)}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          borderWidth: 2,
                          borderRadius: 10,
                          borderColor: StyleLib.containerRadiusColor_bis(
                            gc.state.env.darkmode!
                          ),
                          backgroundColor: StyleLib.containerColor_bis(
                            gc.state.env.darkmode!
                          ),
                          width: width - 20,
                          minHeight: 50,
                          padding: 5,
                          marginTop: 10,
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            width: width / 2 - 15,
                            alignItems: "center",
                          }}
                        >
                          <View
                            style={{
                              width: 38,
                              height: 38,
                              borderRadius: 8,
                              backgroundColor: "white",
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            <Image
                              source={{ uri: i.img }}
                              style={{ width: 32, height: 32, borderRadius: 6 }}
                            />
                          </View>
                          <View
                            style={{
                              flexDirection: "column",
                              justifyContent: "space-between",
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 15,
                                fontWeight: "bold",
                                color: StyleLib.textColor(
                                  gc.state.env.darkmode!
                                ),
                                marginLeft: 11,
                              }}
                            >
                              {i18n.t("my_wallet_pre")} {i.symbol.toUpperCase()}{" "}
                              {i18n.t("my_wallet_suf")}
                            </Text>
                            <Text
                              style={{
                                fontSize: 14,
                                fontWeight: "bold",
                                marginLeft: 11,
                                color: StyleLib.sellColor(
                                  gc.state.env.darkmode!
                                ),
                              }}
                            >
                              -
                              {conditionalRender(
                                avoidScientificNotation_withSign(i.appre),
                                0,
                                4
                              )}
                              $ ({i18n.t("delisted")})
                            </Text>
                          </View>
                        </View>
                        <View
                          style={{
                            flexDirection: "column",
                            width: width / 2 - 15,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 15,
                              fontWeight: "bold",
                              color: StyleLib.textColor(gc.state.env.darkmode!),
                              marginRight: 5,
                              textAlign: "right",
                            }}
                          >
                            $ 0
                          </Text>
                          <Text
                            style={[
                              gc.state.env.darkmode
                                ? styles.changetext_neutral_dark
                                : styles.changetext_neutral_light,
                              {
                                fontSize: 15,
                                fontWeight: "bold",
                                marginRight: 5,
                                textAlign: "right",
                              },
                            ]}
                          >
                            {conditionalRender(
                              numberWithCommas(autoRound(i.quantity)),
                              0,
                              6
                            )}{" "}
                            {i.symbol.toUpperCase()}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  )
                }
              )}
              <View style={{ height: 10 }} />
            </View>
          </ScrollView>
        </View>
      </View>
      {modal}
      {send_modal}
      {Platform.OS === "ios" && (
        <SwipeablePanel
          fullWidth={true}
          onClose={() => closePanel()}
          isActive={isPanelActive}
          style={{
            backgroundColor: StyleLib.containerColor_bis(
              gc.state.env.darkmode!
            ),
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

export default Portfolio

const styles = StyleSheet.create({
  changetext: {
    fontSize: 15,
    fontWeight: "bold",
    marginRight: 5,
    textAlign: "right",
  },
  changetext_neutral_dark: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#CCCCCC",
    marginRight: 5,
    textAlign: "right",
  },
  changetext_neutral_light: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#4A4A4A",
    marginRight: 5,
    textAlign: "right",
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
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
})
