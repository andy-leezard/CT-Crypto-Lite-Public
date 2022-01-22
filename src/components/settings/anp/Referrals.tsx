import React, { useEffect, useState, useContext, useRef } from "react"
import {
  Text,
  View,
  ScrollView,
  Image,
  Alert,
  Modal,
  StyleSheet,
  Pressable,
  TextInput,
  FlatList,
} from "react-native"
import { db } from "../../../../firebase"
import I18n from "i18n-js"
import {
  GlobalContext,
  GlobalContextInterfaceAsReducer,
  MainContext,
  MainContextInterface,
} from "../../../ContextManager"
import { DocumentSnapshot } from "@firebase/firestore-types"
import {
  bgColor,
  containerColor,
  containerColor_bis,
  subTextColor,
  textColor,
} from "../../../lib/StyleLib"
import { TouchableOpacity } from "react-native-gesture-handler"
import * as Clipboard from "expo-clipboard"
import Env from "../../../env.json"
import axios from "axios"
import {
  dynamicRound,
  isNumber,
  referralDiscountCoefficient,
  referralsToDiscountRate,
  referralsToTier,
  subscriptionsPerTier,
  tierToDiscountRate,
  tierToReferrals,
} from "../../../lib/FuncLib"
import { bottom_tab_nav_Height } from "../../../lib/Constants"

interface Props {
  route: any
  navigation: any
}

type Referral = {
  id: string
  memo: string
  time: number
}

const Referrals: React.FC<Props> = ({ route, navigation }) => {
  const gc = useContext(GlobalContext) as GlobalContextInterfaceAsReducer
  const mc = useContext(MainContext) as MainContextInterface
  const [modalVisible, setModalVisible] = useState(false)
  const [list_modalVisible, setList_ModalVisible] = useState(false)
  const [tier_modalVisible, setTier_ModalVisible] = useState(false)
  const [referral, setReferral] = useState<string>("")
  const [processing, setProcessing] = useState<boolean>(false)
  const [error_referral, setError_ref] = useState<string>("")
  const [my_referrals, setMy_referrals] = useState<Referral[]>([])
  const [tier_scope, setTier_scope] = useState(0)
  const [referral_scope, setReferral_scope] = useState("0")
  const inputRef = useRef<TextInput>(null)

  const [keyword, setKeyword] = useState<string>("")

  const [currentItem, setCurrentItem] = useState<Referral | null>(null)
  const [note, setNote] = useState<string>("")

  const [render_referrals, setRenderReferrals] = useState<Referral[]>([])

  const locale = I18n.currentLocale()

  const handleModalClose = () => {
    if (!processing) {
      setModalVisible(false)
      setError_ref("")
      setReferral("")
    }
  }

  const list_handleModalClose = () => {
    if (currentItem !== null) {
      setNote("")
      setCurrentItem(null)
    } else if (!processing) {
      setList_ModalVisible(false)
      setKeyword("")
    }
  }

  const addNote = (i: Referral) => {
    setCurrentItem(i)
  }

  const confirmNote = async () => {
    if (note.length === 0) {
      Alert.alert(I18n.t("notification"), I18n.t("enter_text"), [
        { text: I18n.t("ok") },
      ])
      return
    } else {
      try {
        db.collection("users")
          .doc(gc.state.auth.userEmail!)
          .collection("referrals")
          .doc(currentItem!.id)
          .update({
            memo: note,
          })
          .then(() => {
            Alert.alert(
              I18n.t("notification"),
              I18n.t("noted_added") + currentItem!.id,
              [{ text: I18n.t("done") }]
            )
            setCurrentItem(null)
            setNote("")
          })
      } catch (e: any) {
        Alert.alert(I18n.t("error"), e.message, [{ text: I18n.t("retry") }])
      }
    }
  }

  const copyToClipboard = () => {
    Clipboard.setString(mc.user.referral_code ?? "")
    Alert.alert(
      I18n.t("notification"),
      I18n.t("ref_clipboard") + (mc.user.referral_code ?? ""),
      [{ text: I18n.t("ok") }]
    )
  }

  const copyButtonColor = () => {
    return gc.state.env.darkmode ? "#2490BD" : "#009cdb"
  }

  const useReferralButtonColor = () => {
    return gc.state.env.darkmode ? "#24BD8A" : "#00bf7f"
  }

  const viewReferralButtonColor = () => {
    return gc.state.env.darkmode ? "#56BA60" : "#00c213"
  }

  const iconBgColor = () => {
    return gc.state.env.darkmode ? "#FFFFFF" : "#C9DFFF"
  }

  const itemBgColor = () => {
    return gc.state.env.darkmode ? "#CCCCCC" : "#C9DFFF"
  }

  const placeHolderTextColor = () => {
    return gc.state.env.darkmode ? "#CCCCCC" : "#FFFFFF"
  }

  const handleSetReferral = (input: string) => {
    if ((input[input.length - 1] ?? "") === " ") {
      return
    } else {
      setReferral(input)
    }
  }

  const useReferral = async () => {
    if (mc.user.referral) {
      setError_ref(I18n.t("ref_er6"))
      return
    }
    if (referral === mc.user.referral_code) {
      setError_ref(I18n.t("ref_er4"))
      return
    } else {
      setProcessing(true)
      try {
        let inferred_mail_address: string | null = null
        const referral_is_legit = await db
          .collection("referrals")
          .doc(referral.toLowerCase())
          .get()
          .then((doc: DocumentSnapshot) => {
            if (doc.exists) {
              inferred_mail_address = doc.data()!.target
              return true
            } else {
              return false
            }
          })
        if (referral_is_legit && inferred_mail_address !== null) {
          const body = {
            userEmail: gc.state.auth.userEmail,
            referralEmail: inferred_mail_address,
            userReferralCode: mc.user.referral_code,
            referralCode: referral,
          }
          const response = await axios.post(Env.cfapi_useReferral, body)
          if (response.status === 200) {
            if (response.data === "ref/success") {
              setError_ref("")
              Alert.alert(
                I18n.t("notification"),
                I18n.t("ref_success") + referral,
                [
                  { text: I18n.t("done"), onPress: () => handleModalClose() },
                  { text: I18n.t("continue"), onPress: () => setReferral("") },
                ]
              )
            } else if (response.data === "ref/duplicate") {
              setError_ref(
                `${I18n.t("error")} : ${I18n.t(
                  "ref_er5_pre"
                )} [${referral}] ${I18n.t("ref_er5_suf")}`
              )
            } else if (response.data === "ref/404") {
              setError_ref(`${I18n.t("ref_er3")} : [${referral}]`)
            } else {
              setError_ref(response.data)
            }
          } else {
            setError_ref(response.data)
          }
        } else {
          setError_ref(I18n.t("ref_er3"))
        }
      } catch (error: any) {
        setError_ref(error.message)
      } finally {
        setProcessing(false)
      }
    }
  }

  useEffect(() => {
    const ref = db
      .collection("users")
      .doc(gc.state.auth.userEmail!)
      .collection("referrals")
      .orderBy("time", "desc")
    const unsubscribe = ref.onSnapshot(
      (qs) => {
        const list: Referral[] = qs.docs.map((order) => ({
          id: order.id,
          time: order.data().time,
          memo: order.data().memo,
        }))
        setMy_referrals(list)
      },
      (err) => {
        setMy_referrals([])
      }
    )
    setTier_scope(referralsToTier(mc.user.referrals?.length ?? 0))
    return () => {
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (my_referrals.length > 0) {
      let renderData = [...my_referrals]
      if (keyword.length > 0) {
        renderData = renderData.filter(
          (i) =>
            i.id.toLowerCase().includes(keyword.toLowerCase()) ||
            i.memo.toLowerCase().includes(keyword.toLowerCase())
        )
      }
      setRenderReferrals(renderData)
    }
  }, [keyword, my_referrals])

  useEffect(() => {
    const limit = tier_scope >= 4 ? Infinity : tierToReferrals(tier_scope + 1)
    if (
      Number(referral_scope) >= limit ||
      Number(referral_scope) < tierToReferrals(tier_scope)
    ) {
      setReferral_scope(tierToReferrals(tier_scope).toString())
    }
  }, [tier_scope])

  const Item: React.FC<{ i: Referral }> = ({ i }) => {
    const time = new Date(i.time)
    return (
      <TouchableOpacity
        style={{
          width: 190,
          justifyContent: "center",
          alignItems: "center",
          borderRadius: 10,
          backgroundColor: itemBgColor(),
          paddingVertical: 5,
          marginVertical: 3,
        }}
        onPress={() => addNote(i)}
      >
        <Text style={{ fontWeight: "bold" }}>{i.id}</Text>
        <Text style={{ fontWeight: "bold" }}>
          {time.toLocaleDateString(locale)}
        </Text>
        <Text>
          {i.memo !== "" || currentItem !== null ? i.memo : I18n.t("add_note")}
        </Text>
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
        <View
          style={[
            styles.modalView,
            { backgroundColor: bgColor(gc.state.env.darkmode!) },
          ]}
        >
          <View
            style={{
              marginLeft: 6,
              justifyContent: "center",
              width: 38,
              height: 38,
              borderRadius: 8,
              backgroundColor: iconBgColor(),
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <Image
              source={require("../../../assets/icons/1x/referral.png")}
              style={{ width: 20, height: 20 }}
            />
          </View>
          {Boolean(!processing && error_referral.length === 0) ? (
            <Text
              style={{
                color: textColor(gc.state.env.darkmode!),
                fontSize: 15,
                fontWeight: "500",
                marginBottom: 12,
              }}
            >
              {I18n.t("ref_reg")}
            </Text>
          ) : (
            <></>
          )}
          {Boolean(error_referral.length > 0 && !processing) ? (
            <View
              style={{
                backgroundColor: "rgba(0,0,0,0.5)",
                borderWidth: 1,
                borderColor: "#FDD7D8",
                borderRadius: 5,
                padding: 5,
                marginBottom: 12,
                maxWidth: 210,
              }}
            >
              <Text
                style={{ color: "#ffffff", fontSize: 15, fontWeight: "700" }}
              >
                {error_referral}
              </Text>
            </View>
          ) : (
            <></>
          )}
          {!processing ? (
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: gc.state.env.darkmode
                    ? "#333333"
                    : "rgba(0,0,0,0.25)",
                },
              ]}
              autoFocus={true}
              placeholder="referral code"
              placeholderTextColor={placeHolderTextColor()}
              value={referral}
              onChangeText={handleSetReferral}
              maxLength={16}
            />
          ) : (
            <></>
          )}
          <Pressable
            disabled={processing || !referral}
            style={[
              styles.button,
              {
                backgroundColor:
                  processing || !referral ? "#5c5c5c" : "#2196F3",
                marginBottom: processing ? 0 : 15,
              },
            ]}
            onPress={() => useReferral()}
          >
            <Text style={styles.textStyle}>
              {processing ? I18n.t("processing") : I18n.t("confirm")}
            </Text>
          </Pressable>
          {!processing ? (
            <Pressable
              disabled={processing}
              style={[styles.button, { backgroundColor: "#2196F3" }]}
              onPress={() => handleModalClose()}
            >
              <Text style={styles.textStyle}>{I18n.t("cancel")}</Text>
            </Pressable>
          ) : (
            <></>
          )}
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
        list_handleModalClose()
      }}
    >
      <View style={styles.centeredView}>
        <Pressable
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            position: "absolute",
          }}
          onPress={() => list_handleModalClose()}
        />
        <View
          style={[
            styles.modalView,
            { backgroundColor: bgColor(gc.state.env.darkmode!) },
          ]}
        >
          <View
            style={{
              marginLeft: 6,
              justifyContent: "center",
              width: 38,
              height: 38,
              borderRadius: 8,
              backgroundColor: iconBgColor(),
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <Image
              source={require("../../../assets/icons/1x/connections.png")}
              style={{ width: 20, height: 20 }}
            />
          </View>
          {currentItem ? (
            <>
              <Text
                style={{
                  color: textColor(gc.state.env.darkmode!),
                  fontSize: 15,
                  fontWeight: "500",
                  marginBottom: 12,
                }}
              >
                {I18n.t("add_note")}
              </Text>
              <Item
                i={{ id: currentItem.id, memo: note, time: currentItem.time }}
              />
              <View>
                <TextInput
                  style={{
                    paddingHorizontal: 10,
                    minHeight: 40,
                    width: 250,
                    marginVertical: 12,
                    borderRadius: 10,
                    fontSize: 20,
                    color: "#FFFFFF",
                    backgroundColor: gc.state.env.darkmode
                      ? "#333333"
                      : "rgba(0,0,0,0.25)",
                  }}
                  value={note}
                  onChangeText={setNote}
                  maxLength={32}
                />
                <Image
                  source={require("../../../assets/icons/1x/pencil.png")}
                  style={{
                    width: 20,
                    height: 20,
                    tintColor: "#519ABA",
                    position: "absolute",
                    right: 10,
                    top: 20,
                  }}
                />
              </View>
              <Pressable
                style={[
                  styles.button,
                  { backgroundColor: "#2196F3", marginBottom: 12 },
                ]}
                onPress={() => confirmNote()}
              >
                <Text style={styles.textStyle}>{I18n.t("confirm")}</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text
                style={{
                  color: textColor(gc.state.env.darkmode!),
                  fontSize: 15,
                  fontWeight: "500",
                  marginBottom: 12,
                }}
              >
                {I18n.t("my_refs")}
              </Text>
              <View>
                <TextInput
                  style={{
                    paddingHorizontal: 10,
                    height: 40,
                    width: 200,
                    marginBottom: 12,
                    borderRadius: 10,
                    fontSize: 20,
                    color: "#FFFFFF",
                    backgroundColor: gc.state.env.darkmode
                      ? "#333333"
                      : "rgba(0,0,0,0.25)",
                  }}
                  value={keyword}
                  onChangeText={setKeyword}
                  maxLength={16}
                />
                <Image
                  source={require("../../../assets/icons/1x/search.png")}
                  style={{
                    width: 20,
                    height: 20,
                    tintColor: "#519ABA",
                    position: "absolute",
                    right: 10,
                    top: 10,
                  }}
                />
              </View>
              <View
                style={{
                  width: 200,
                  height: 200,
                  overflow: "scroll",
                  backgroundColor: containerColor_bis(gc.state.env.darkmode!),
                  borderRadius: 10,
                  padding: 5,
                  marginBottom: 12,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {render_referrals.length > 0 ? (
                  <FlatList
                    style={{ borderRadius: 5 }}
                    data={render_referrals}
                    renderItem={({ item }) => <Item i={item} />}
                    keyExtractor={(item) => item.id}
                    onEndReachedThreshold={0.5}
                    initialNumToRender={10}
                  />
                ) : (
                  <Text
                    style={{
                      fontWeight: "bold",
                      color: textColor(gc.state.env.darkmode!),
                    }}
                  >
                    {I18n.t("no_result")}
                  </Text>
                )}
              </View>
            </>
          )}
          <Pressable
            style={[styles.button, { backgroundColor: "#2196F3" }]}
            onPress={() => list_handleModalClose()}
          >
            <Text style={styles.textStyle}>{I18n.t("cancel")}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  )

  const modal_tiers_information = (
    <Modal
      animationType="fade"
      hardwareAccelerated={true}
      transparent={true}
      visible={tier_modalVisible}
      onRequestClose={() => {
        setTier_ModalVisible(false)
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
          onPress={() => setTier_ModalVisible(false)}
        />
        <View
          style={[
            styles.modalView,
            { backgroundColor: bgColor(gc.state.env.darkmode!) },
          ]}
          onTouchStart={() => {
            inputRef!.current!.blur()
          }}
        >
          <View
            style={{
              justifyContent: "center",
              width: 38,
              height: 38,
              borderRadius: 8,
              backgroundColor: iconBgColor(),
              alignItems: "center",
              marginBottom: 5,
            }}
          >
            <Image
              source={require("../../../assets/icons/1x/vip.png")}
              style={{ width: 20, height: 20 }}
            />
          </View>
          <Text
            style={{
              color: textColor(gc.state.env.darkmode!),
              fontSize: 15,
              fontWeight: "700",
              textAlign: "center",
              marginBottom: 12,
            }}
          >
            Advantages by tier
          </Text>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <TouchableOpacity
              style={{
                justifyContent: "center",
                width: 35,
                height: 35,
                borderRadius: 5,
                marginRight: 5,
                backgroundColor: containerColor(gc.state.env.darkmode!),
                alignItems: "center",
              }}
              onPress={() =>
                setTier_scope((prev) => {
                  if (prev <= 0) {
                    return 4
                  } else {
                    return prev - 1
                  }
                })
              }
            >
              <Image
                source={require("../../../assets/icons/1x/arrow_darkmode_flipped.png")}
                style={{ width: 20, height: 20 }}
              />
            </TouchableOpacity>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                width: 100,
                height: 35,
                borderRadius: 5,
                backgroundColor: containerColor(gc.state.env.darkmode!),
              }}
            >
              <Text
                style={{
                  color: textColor(gc.state.env.darkmode!),
                  fontSize: 15,
                  fontWeight: "500",
                  textAlign: "center",
                }}
              >
                {`Tier ${tier_scope}`}
                {tier_scope >= 4 ? "(max)" : ""}
              </Text>
            </View>
            <TouchableOpacity
              style={{
                justifyContent: "center",
                width: 35,
                height: 35,
                borderRadius: 5,
                marginLeft: 5,
                backgroundColor: containerColor(gc.state.env.darkmode!),
                alignItems: "center",
              }}
              onPress={() => {
                setTier_scope((prev) => {
                  if (prev >= 4) {
                    return 0
                  } else {
                    return prev + 1
                  }
                })
              }}
            >
              <Image
                source={require("../../../assets/icons/1x/arrow_darkmode.png")}
                style={{ width: 20, height: 20 }}
              />
            </TouchableOpacity>
          </View>
          <Text
            style={{
              color: subTextColor(gc.state.env.darkmode!),
              fontSize: 15,
              fontWeight: "500",
              textAlign: "center",
            }}
          >
            {"Required referrals : "}
            {tierToReferrals(tier_scope)}
          </Text>
          <Text
            style={{
              color: subTextColor(gc.state.env.darkmode!),
              fontSize: 15,
              fontWeight: "500",
              textAlign: "center",
            }}
          >
            {"Max coin subscriptions : "}
            {subscriptionsPerTier(tier_scope)}
          </Text>
          <Text
            style={{
              color: subTextColor(gc.state.env.darkmode!),
              fontSize: 15,
              fontWeight: "500",
              textAlign: "center",
              marginBottom: 12,
            }}
          >
            {"Additional fee reduction : "}
            {dynamicRound((1 - tierToDiscountRate(tier_scope)) * 100, 4)}
            {"%"}
          </Text>
          <Text
            style={{
              color: textColor(gc.state.env.darkmode!),
              fontSize: 15,
              fontWeight: "700",
              textAlign: "center",
              marginBottom: 12,
            }}
          >
            Advantages by referrals
          </Text>
          <TextInput
            keyboardType="number-pad"
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
            value={referral_scope}
            onChangeText={(e) => {
              if (isNumber(e) || e === "") {
                setReferral_scope(e)
              }
            }}
            maxLength={7}
          />
          <Text
            style={{
              color: subTextColor(gc.state.env.darkmode!),
              fontSize: 15,
              fontWeight: "500",
              textAlign: "center",
              marginBottom: 5,
            }}
          >
            {"Base fee reduction : "}
            {dynamicRound(
              (1 - referralDiscountCoefficient(Number(referral_scope))) * 100,
              4
            )}
            {"%"}
          </Text>
          <Text
            style={{
              color: textColor(gc.state.env.darkmode!),
              fontSize: 15,
              fontWeight: "700",
              textAlign: "center",
              marginBottom: 20,
            }}
          >
            {"Total combined fee reduction : "}
            {dynamicRound(
              (1 -
                referralDiscountCoefficient(Number(referral_scope)) *
                  tierToDiscountRate(tier_scope)) *
                100,
              2
            )}
            {"%"}
          </Text>
          <Pressable
            style={[
              styles.button,
              {
                backgroundColor: "#2196F3",
                marginBottom: 15,
              },
            ]}
            onPress={() => setTier_ModalVisible(false)}
          >
            <Text style={styles.textStyle}>{I18n.t("close")}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  )

  return (
    <>
      <ScrollView style={{ backgroundColor: bgColor(gc.state.env.darkmode!) }}>
        <View
          style={{
            alignItems: "center",
            flex: 1,
            marginBottom:
              bottom_tab_nav_Height + mc.bottomInset + mc.banner_ad_height,
          }}
        >
          <View
            style={{
              width: gc.state.env.screenWidth - 40,
              height: "auto",
              padding: 10,
              borderRadius: 10,
              backgroundColor: containerColor(gc.state.env.darkmode!),
              marginVertical: 5,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: textColor(gc.state.env.darkmode!),
                fontSize: 17,
                fontWeight: "700",
                marginBottom: 5,
              }}
            >
              {"Tier"}
            </Text>
            <Text
              style={{
                color: textColor(gc.state.env.darkmode!),
                fontSize: 13,
                fontWeight: "500",
                marginBottom: 10,
              }}
            >
              {
                "The account tier is determined by the number of the referrals who registered the user. Increase your tier to benefit from lower trading fees, AdBlock subscription fees, more coin price subscriptions and various other advantages!"
              }
            </Text>
            <Text
              style={{
                color: textColor(gc.state.env.darkmode!),
                fontSize: 17,
                fontWeight: "700",
              }}
            >
              {"My current tier"} :{" "}
              {referralsToTier(mc.user.referrals?.length ?? 0)}
            </Text>
            <Text
              style={{
                color: subTextColor(gc.state.env.darkmode!),
                fontSize: 14,
                fontWeight: "500",
                marginBottom: 10,
              }}
            >
              {"My referrals"} : {mc.user.referrals?.length ?? 0}
            </Text>
            <Text
              style={{
                color: textColor(gc.state.env.darkmode!),
                fontSize: 17,
                fontWeight: "700",
              }}
            >
              {"My current discount rate"} :{" "}
              {dynamicRound(
                (1 -
                  tierToDiscountRate(
                    referralsToTier(mc.user.referrals?.length ?? 0)
                  ) *
                    referralsToDiscountRate(mc.user.referrals?.length ?? 0)) *
                  100,
                4
              )}{" "}
              %
            </Text>
            <Text
              style={{
                color: subTextColor(gc.state.env.darkmode!),
                fontSize: 14,
                fontWeight: "500",
              }}
            >
              {"from referrals"} :{" "}
              {dynamicRound(
                (1 - referralsToDiscountRate(mc.user.referrals?.length ?? 0)) *
                  100,
                4
              )}{" "}
              %
            </Text>
            <Text
              style={{
                color: subTextColor(gc.state.env.darkmode!),
                fontSize: 14,
                fontWeight: "500",
              }}
            >
              {"from tier"} :{" "}
              {dynamicRound(
                (1 -
                  tierToDiscountRate(
                    referralsToTier(mc.user.referrals?.length ?? 0)
                  )) *
                  100,
                4
              )}{" "}
              %
            </Text>
            <TouchableOpacity
              style={{
                width: gc.state.env.screenWidth - 60,
                marginVertical: 10,
                padding: 5,
                borderRadius: 10,
                backgroundColor: useReferralButtonColor(),
                justifyContent: "center",
                alignItems: "center",
              }}
              onPress={() => setTier_ModalVisible(true)}
            >
              <Image
                source={require("../../../assets/icons/1x/vip.png")}
                style={{
                  width: 20,
                  height: 20,
                  alignSelf: "center",
                  marginBottom: 5,
                  tintColor: bgColor(gc.state.env.darkmode!),
                }}
              />
              <Text
                style={{
                  color: "white",
                  fontSize: 17,
                  fontWeight: "700",
                  marginBottom: 5,
                }}
              >
                {"Learn more"}
              </Text>
            </TouchableOpacity>
          </View>
          <View
            style={{
              width: gc.state.env.screenWidth - 40,
              height: "auto",
              padding: 5,
              borderRadius: 10,
              backgroundColor: containerColor(gc.state.env.darkmode!),
              marginVertical: 5,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: textColor(gc.state.env.darkmode!),
                fontSize: 17,
                fontWeight: "700",
                marginVertical: 5,
              }}
            >
              {I18n.t("refs")}
            </Text>
            <Text
              style={{
                color: textColor(gc.state.env.darkmode!),
                fontSize: 13,
                fontWeight: "500",
                marginBottom: 10,
              }}
            >
              {I18n.t("refs_msg")}
            </Text>
            <Text
              style={{
                color: textColor(gc.state.env.darkmode!),
                fontSize: 17,
                fontWeight: "700",
              }}
            >
              {I18n.t("my_refcode")} : {mc.user.referral_code}
            </Text>
            {mc.user.referral ? (
              <Text
                style={{
                  color: subTextColor(gc.state.env.darkmode!),
                  fontSize: 15,
                  fontWeight: "500",
                }}
              >
                {I18n.t("registered_referral")} : {mc.user.referral}
              </Text>
            ) : (
              <></>
            )}
            <TouchableOpacity
              style={{
                width: gc.state.env.screenWidth - 60,
                marginTop: 10,
                marginBottom: 5,
                padding: 5,
                borderRadius: 10,
                backgroundColor: copyButtonColor(),
                justifyContent: "center",
                alignItems: "center",
              }}
              onPress={() => copyToClipboard()}
            >
              <Image
                source={require("../../../assets/icons/1x/share.png")}
                style={{
                  width: 20,
                  height: 20,
                  alignSelf: "center",
                  marginBottom: 5,
                  tintColor: bgColor(gc.state.env.darkmode!),
                }}
              />
              <Text
                style={{
                  color: "white",
                  fontSize: 17,
                  fontWeight: "700",
                  marginBottom: 5,
                }}
              >
                {I18n.t("ref_share")}
              </Text>
            </TouchableOpacity>
            {!mc.user.referral ? (
              <TouchableOpacity
                style={{
                  width: gc.state.env.screenWidth - 60,
                  marginVertical: 5,
                  padding: 5,
                  borderRadius: 10,
                  backgroundColor: useReferralButtonColor(),
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onPress={() => setModalVisible(true)}
              >
                <Image
                  source={require("../../../assets/icons/1x/referral.png")}
                  style={{
                    width: 20,
                    height: 20,
                    alignSelf: "center",
                    marginBottom: 5,
                    tintColor: bgColor(gc.state.env.darkmode!),
                  }}
                />
                <Text
                  style={{
                    color: "white",
                    fontSize: 17,
                    fontWeight: "700",
                    marginBottom: 5,
                  }}
                >
                  {I18n.t("ref_use")}
                </Text>
              </TouchableOpacity>
            ) : (
              <></>
            )}
            <TouchableOpacity
              style={{
                width: gc.state.env.screenWidth - 60,
                marginVertical: 5,
                padding: 5,
                borderRadius: 10,
                backgroundColor: viewReferralButtonColor(),
                justifyContent: "center",
                alignItems: "center",
              }}
              onPress={() => setList_ModalVisible(true)}
            >
              <Image
                source={require("../../../assets/icons/1x/connections.png")}
                style={{
                  width: 20,
                  height: 20,
                  alignSelf: "center",
                  marginBottom: 5,
                  tintColor: bgColor(gc.state.env.darkmode!),
                }}
              />
              <Text
                style={{
                  color: "white",
                  fontSize: 17,
                  fontWeight: "700",
                  marginBottom: 5,
                }}
              >
                {I18n.t("ref_view")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      {modal_list}
      {modal}
      {modal_tiers_information}
    </>
  )
}

export default Referrals

const styles = StyleSheet.create({
  input: {
    paddingHorizontal: 10,
    height: 40,
    width: 200,
    marginBottom: 12,
    borderRadius: 10,
    fontSize: 20,
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
    marginTop: 20,
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
})
