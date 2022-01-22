import React, { useState, useContext } from "react"
import { Text, View, ScrollView, Image, Alert, Modal, StyleSheet, Pressable, TextInput } from "react-native"
import AdMobRewardedFC from "../../AdMobRewardedFC"
import I18n from "i18n-js"
import {
  GlobalContext,
  GlobalContextInterfaceAsReducer,
  MainContext,
  MainContextInterface,
} from "../../../ContextManager"
import {
  bgColor,
  containerColor,
  rewarded_ad_btn_dynamicColor,
  rewarded_ad_btn_dynamicTextColor,
  textColor,
} from "../../../lib/StyleLib"
import { TouchableOpacity } from "react-native-gesture-handler"
import Env from "../../../env.json"
import axios from "axios"
import { bottom_tab_nav_Height } from "../../../lib/Constants"

interface Props {
  route: any
  navigation: any
}

const MyRewards: React.FC<Props> = ({ route, navigation }) => {
  const gc = useContext(GlobalContext) as GlobalContextInterfaceAsReducer
  const mc = useContext(MainContext) as MainContextInterface
  const [processing, setProcessing] = useState<boolean>(false)
  const [error_msg, setError_msg] = useState<string>("")

  const [rewardCode, setRewardCode] = useState<string>("")
  const [code_modalVisible, setCode_ModalVisible] = useState(false)

  const code_handleModalClose = () => {
    if (!processing) {
      setCode_ModalVisible(false)
      setError_msg("")
      setRewardCode("")
    }
  }

  const useRewardCodeButtonColor = () => {
    return gc.state.env.darkmode ? "#eb7d6c" : "#ff734d"
  }

  const iconBgColor = () => {
    return gc.state.env.darkmode ? "#FFFFFF" : "#C9DFFF"
  }

  const placeHolderTextColor = () => {
    return gc.state.env.darkmode ? "#CCCCCC" : "#FFFFFF"
  }

  const handleSetRewardCode = (input: string) => {
    if ((input[input.length - 1] ?? "") === " ") {
      return
    } else {
      setRewardCode(input)
    }
  }

  const useRewardCode = async () => {
    if (rewardCode.length === 0) {
      setError_msg(I18n.t("enter_code"))
      return
    } else {
      setProcessing(true)
      const body = {
        userEmail: gc.state.auth.userEmail,
        code: rewardCode,
      }
      try {
        const response = await axios.post(Env.cfapi_useCode, body)
        if (response.status === 200) {
          if (response.data === "ref/success") {
            setError_msg("")
            Alert.alert(I18n.t("notification"), I18n.t("reward_code_success") + rewardCode, [
              { text: I18n.t("done"), onPress: () => code_handleModalClose() },
              { text: I18n.t("continue"), onPress: () => setRewardCode("") },
            ])
          } else if (response.data === "ref/404") {
            setError_msg(`${I18n.t("ref_er3")} : [${rewardCode}]`)
          } else {
            setError_msg(response.data)
          }
        } else {
          setError_msg(response.data)
        }
      } catch (error: any) {
        setError_msg(error.message)
      } finally {
        setProcessing(false)
      }
    }
  }

  const modal_rewardCode = (
    <Modal
      animationType="fade"
      hardwareAccelerated={true}
      transparent={true}
      visible={code_modalVisible}
      onRequestClose={() => {
        code_handleModalClose()
      }}
    >
      <View style={[styles.centeredView]}>
        <Pressable
          style={{ width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", position: "absolute" }}
          onPress={() => code_handleModalClose()}
        />
        <View style={[styles.modalView, { backgroundColor: bgColor(gc.state.env.darkmode!) }]}>
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
            <Image source={require("../../../assets/icons/1x/redeem-points.png")} style={{ width: 20, height: 20 }} />
          </View>
          {!processing && error_msg.length === 0 && (
            <Text
              style={{
                color: textColor(gc.state.env.darkmode!),
                fontSize: 15,
                fontWeight: "500",
                marginBottom: 12,
              }}
            >
              {I18n.t("enter_code")}
            </Text>
          )}
          {error_msg.length > 0 && !processing && (
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
              <Text style={{ color: "#ffffff", fontSize: 15, fontWeight: "700" }}>{error_msg}</Text>
            </View>
          )}
          {!processing && (
            <TextInput
              style={{
                backgroundColor: gc.state.env.darkmode ? "#333333" : "rgba(0,0,0,0.25)",
                paddingHorizontal: 10,
                height: 40,
                width: 300,
                marginBottom: 12,
                borderRadius: 10,
                fontSize: 20,
                color: "#FFFFFF",
              }}
              autoFocus={true}
              placeholder="reward code"
              placeholderTextColor={placeHolderTextColor()}
              value={rewardCode}
              onChangeText={handleSetRewardCode}
              maxLength={32}
            />
          )}
          <Pressable
            disabled={processing}
            style={[
              styles.button,
              { backgroundColor: processing ? "#5c5c5c" : "#2196F3", marginBottom: processing ? 0 : 15 },
            ]}
            onPress={() => useRewardCode()}
          >
            <Text style={styles.textStyle}>{processing ? I18n.t("processing") : I18n.t("confirm")}</Text>
          </Pressable>
          {!processing && (
            <Pressable
              disabled={processing}
              style={[styles.button, { backgroundColor: "#2196F3" }]}
              onPress={() => code_handleModalClose()}
            >
              <Text style={styles.textStyle}>{I18n.t("cancel")}</Text>
            </Pressable>
          )}
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
            marginBottom: bottom_tab_nav_Height + mc.bottomInset + mc.banner_ad_height,
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
            }}
          >
            <Text
              style={{
                color: textColor(gc.state.env.darkmode!),
                fontSize: 17,
                fontWeight: "700",
                marginBottom: 5,
                marginLeft: 5,
              }}
            >
              {I18n.t("my_rewards")}
            </Text>
            <Text
              style={{
                color: textColor(gc.state.env.darkmode!),
                fontSize: 15,
                fontWeight: "500",
                marginLeft: 15,
              }}
            >
              - {I18n.t("p_my_rewards._1_4")} {mc.user.reward_acc ?? -2} $
            </Text>
            <Text
              style={{
                color: textColor(gc.state.env.darkmode!),
                fontSize: 15,
                fontWeight: "500",
                marginLeft: 15,
                marginBottom: 10,
              }}
            >
              - {I18n.t("my_fund")}: {mc.user.seed} $
            </Text>
            <Text
              style={{
                color: textColor(gc.state.env.darkmode!),
                fontSize: 17,
                fontWeight: "700",
                marginVertical: 5,
                marginLeft: 5,
              }}
            >
              {I18n.t("p_my_rewards._1")}
            </Text>
            <Text
              style={{
                color: textColor(gc.state.env.darkmode!),
                fontSize: 15,
                fontWeight: "500",
                marginLeft: 10,
              }}
            >
              {I18n.t("p_my_rewards._1_1")}
            </Text>
            <Text
              style={{
                color: textColor(gc.state.env.darkmode!),
                fontSize: 15,
                fontWeight: "500",
                marginLeft: 15,
              }}
            >
              - {I18n.t("p_my_rewards._1_2")} {mc.adEnv.rewards._1} $
            </Text>
            <Text
              style={{
                color: textColor(gc.state.env.darkmode!),
                fontSize: 15,
                fontWeight: "500",
                marginLeft: 15,
              }}
            >
              - {I18n.t("p_my_rewards._1_3")} {mc.adEnv.rewards._70} $
            </Text>
            {mc.rewarded_ad_available ? (
              <TouchableOpacity
                onPress={() => mc.show_ad()}
                style={{
                  width: gc.state.env.screenWidth - 60,
                  marginVertical: 10,
                  padding: 5,
                  borderRadius: 10,
                  height: 60,
                  backgroundColor: rewarded_ad_btn_dynamicColor(true),
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Image
                  source={require("../../../assets/icons/1x/gift3.png")}
                  style={{ width: 20, height: 20, alignSelf: "center", marginBottom: 5 }}
                />
                <Text style={{ fontSize: 17, fontWeight: "700", color: rewarded_ad_btn_dynamicTextColor(true) }}>
                  {I18n.t("random_reward_pre") + " " + I18n.t("random_reward_suf")}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => mc.show_rewarded_ad_error_message()}
                style={{
                  width: gc.state.env.screenWidth - 60,
                  marginVertical: 10,
                  padding: 5,
                  borderRadius: 10,
                  height: 45,
                  backgroundColor: rewarded_ad_btn_dynamicColor(false),
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: 17, fontWeight: "700", color: rewarded_ad_btn_dynamicTextColor(false) }}>
                  {I18n.t("reward_er1")}
                </Text>
              </TouchableOpacity>
            )}
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
              {I18n.t("reward_code")}
            </Text>
            <TouchableOpacity
              style={{
                width: gc.state.env.screenWidth - 60,
                marginVertical: 10,
                padding: 5,
                borderRadius: 10,
                backgroundColor: useRewardCodeButtonColor(),
                justifyContent: "center",
                alignItems: "center",
              }}
              onPress={() => setCode_ModalVisible(true)}
            >
              <Image
                source={require("../../../assets/icons/1x/redeem-points.png")}
                style={{ width: 20, height: 20, alignSelf: "center", marginBottom: 5 }}
              />
              <Text style={{ color: "white", fontSize: 17, fontWeight: "700", marginBottom: 5 }}>
                {I18n.t("redeem_code")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      {modal_rewardCode}
    </>
  )
}

export default MyRewards

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
