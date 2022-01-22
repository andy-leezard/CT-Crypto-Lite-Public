import React, { useEffect, useState, useContext, useMemo } from "react"
import { Text, View, TouchableOpacity, Dimensions, Alert } from "react-native"
import { db } from "../../firebase"
import Env from "../env.json"
import I18n from "i18n-js"
import {
  GlobalContext,
  GlobalContextInterfaceAsReducer,
  MainContext,
  MainContextInterface,
} from "../ContextManager"
import { DocumentSnapshot } from "@firebase/firestore-types"
import {
  dynamicRound,
  referralDiscountCoefficient,
  referralsToDiscountRate,
} from "../lib/FuncLib"
import { containerColor, textColor } from "../lib/StyleLib"

interface Props {
  route: any
  navigation: any
}

const AdRemover: React.FC<Props> = ({ route, navigation }) => {
  const gc = useContext(GlobalContext) as GlobalContextInterfaceAsReducer
  const mc = useContext(MainContext) as MainContextInterface
  const [clicked, setClicked] = useState<boolean>(false)
  const [baseCost, setBaseCost] = useState<number>(80)
  const [discountRate, setDiscountRate] = useState<number>(0)

  const ref = db.collection("users").doc(gc.state.auth.userEmail!)
  useEffect(() => {
    setDiscountRate(
      dynamicRound(
        (1 - referralDiscountCoefficient(mc.user.referrals.length)) * 100,
        2
      )
    )
    if (mc.user.adblock) {
      navigation.goBack()
    } else {
      db.collection("globalEnv")
        .doc("ad_controller")
        .get()
        .then((doc: DocumentSnapshot) => {
          if (doc.exists) {
            const data = doc.data()!
            setBaseCost(data.adblock_subscription_cost)
          } else {
            navigation.goBack()
          }
        })
        .catch(() => {
          navigation.goBack()
        })
    }
  }, [])

  const final_cost = useMemo(() => {
    return dynamicRound(
      baseCost * referralsToDiscountRate(mc.user.referrals.length),
      0
    )
  }, [baseCost])

  const _update = () => {
    return new Promise((resolve, reject) => {
      let newSeed = dynamicRound(mc.user.seed - final_cost, 2)
      let newTotalBuyin = dynamicRound(mc.user.totalbuyin! - final_cost, 2)
      let newTotalBuyin_const = dynamicRound(
        mc.user.totalbuyin_const! - final_cost,
        2
      )
      ref
        .update({
          adblock: true,
          adblock_activated_at: new Date().getTime(),
          seed: newSeed,
          totalbuyin: newTotalBuyin,
          totalbuyin_constant: newTotalBuyin_const,
        })
        .then(resolve)
        .catch(reject)
    })
  }
  const _create_history = () => {
    return new Promise((resolve, reject) => {
      const time = new Date()
      ref
        .collection("history")
        .add({
          type: "adblock",
          target: "VUSD",
          targetName: "Virtual USD",
          quantity: final_cost,
          fiat: -1,
          price: 1,
          imgsrc: Env.fiatCoinIcon,
          orderNum: time.getTime(),
          time: time.toLocaleString(),
        })
        .then(resolve)
        .catch(reject)
    })
  }

  const upgrade = async () => {
    if (mc.user.adblock) {
      navigation.goBack()
      return
    }
    if (mc.user.seed < final_cost) {
      Alert.alert(I18n.t("notification"), I18n.t("p_upgrade.er_2"), [
        { text: I18n.t("ok") },
      ])
      return
    } else {
      setClicked(true)
      await Promise.all([_update(), _create_history()])
      Alert.alert(I18n.t("upgraded"), I18n.t("success_vip"), [
        { text: I18n.t("ok") },
      ])
      navigation.goBack()
    }
  }

  return (
    <View style={{ flex: 1, alignItems: "center", marginTop: 15 }}>
      <View>
        <View
          style={{
            width: Dimensions.get("window").width - 40,
            height: "auto",
            padding: 5,
            borderRadius: 10,
            backgroundColor: containerColor(gc.state.env.darkmode!),
            marginVertical: 5,
          }}
        >
          <Text
            style={{
              color: textColor(gc.state.env.darkmode!),
              fontSize: 17,
              fontWeight: "700",
            }}
          >
            {I18n.t("p_upgrade.advantages")}
          </Text>
          <Text
            style={{
              color: textColor(gc.state.env.darkmode!),
              fontSize: 15,
              fontWeight: "500",
              marginLeft: 5,
            }}
          >
            - {I18n.t("p_upgrade._1")}
          </Text>
          <Text
            style={{
              color: textColor(gc.state.env.darkmode!),
              fontSize: 17,
              fontWeight: "700",
              marginTop: 5,
            }}
          >
            {I18n.t("p_upgrade.uc")}
          </Text>
          <Text
            style={{
              color: textColor(gc.state.env.darkmode!),
              fontSize: 15,
              fontWeight: "600",
              marginLeft: 5,
            }}
          >
            - {final_cost} VUSD (-{discountRate}% from referrals).
          </Text>
          <Text
            style={{
              color: textColor(gc.state.env.darkmode!),
              fontSize: 17,
              fontWeight: "700",
              marginTop: 5,
            }}
          >
            {I18n.t("p_upgrade.reminder")}
          </Text>
          <Text
            style={{
              color: textColor(gc.state.env.darkmode!),
              fontSize: 15,
              fontWeight: "500",
              marginLeft: 5,
            }}
          >
            - {I18n.t("p_upgrade._3")}
          </Text>
          <Text
            style={{
              color: textColor(gc.state.env.darkmode!),
              fontSize: 15,
              fontWeight: "500",
              marginLeft: 5,
            }}
          >
            - {I18n.t("p_upgrade._4")}
          </Text>
        </View>
        <TouchableOpacity
          disabled={clicked}
          style={{
            alignSelf: "center",
            height: 45,
            width: Dimensions.get("window").width - 40,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#81d466",
            borderRadius: 10,
          }}
          onPress={() => upgrade()}
        >
          <Text style={{ fontSize: 17, color: "white", fontWeight: "bold" }}>
            {I18n.t("p_upgrade.activate_adblock")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default AdRemover
