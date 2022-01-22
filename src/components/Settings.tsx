import React, { useState, useContext } from "react"
import {
  View,
  Text,
  Image,
  ScrollView,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  TextInput,
} from "react-native"
import { db } from "../../firebase"
import I18n from "i18n-js"
import {
  GlobalContext,
  GlobalContextInterfaceAsReducer,
  MainContext,
  MainContextInterface,
} from "../ContextManager"
import { ModalTarget_Settings } from "../lib/Types"
import {
  bgColor,
  iconBgColor,
  modalBgColor,
  placeHolderTextColor,
  textColor,
} from "../lib/StyleLib"
import {
  extractKeywordsFromEmail,
  isNumber,
  pickImage,
  uploadProfileImage,
} from "../lib/FuncLib"
import Profile from "./settings/Profile"
import Account from "./settings/Account"
import Security from "./settings/Security"
import SNC from "./settings/SNC"

interface Props {
  navigation: any
}

const Settings: React.FC<Props> = ({ navigation }) => {
  const gc = useContext(GlobalContext) as GlobalContextInterfaceAsReducer
  const mainContext = useContext(MainContext) as MainContextInterface
  const [processing_modal, setProcessing_modal] = useState<boolean>(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [errorMsg_modal, setErrorMsg_modal] = useState<string>("")
  const [input_modal, setInput_modal] = useState<string>("")
  const [modalTarget, setModalTarget] = useState<ModalTarget_Settings | null>(
    null
  )
  const [modal_done, setModal_done] = useState<boolean>(false)
  const [preset, setPreset] = useState<any>(null)
  const [selectedPreset, setSelectedPreset] = useState<any>(null)
  const [localImg, setLoalImg] = useState<any>("")

  const handleModalClose = () => {
    if (preset !== null) {
      setPreset(null)
      setSelectedPreset(null)
      return
    }
    setErrorMsg_modal("")
    setModalVisible(false)
    setModal_done(false)
    setProcessing_modal(false)
  }

  const savePreset = async () => {
    if (selectedPreset) {
      await db
        .collection("users")
        .doc(gc.state.auth.userEmail!)
        .update({ image_uri: selectedPreset })
    }
    setPreset(null)
    setSelectedPreset(null)
    setErrorMsg_modal("")
    setModalVisible(false)
    setModal_done(false)
    setProcessing_modal(false)
  }

  const openModal_username = () => {
    setModalTarget(ModalTarget_Settings.USERNAME)
    setErrorMsg_modal(I18n.t("new_username"))
    setModalVisible(true)
  }
  const openModal_profile = () => {
    setModalTarget(ModalTarget_Settings.PROFILE)
    setErrorMsg_modal(I18n.t("profile_pic"))
    setModalVisible(true)
  }
  const openModal_status = () => {
    setModalTarget(ModalTarget_Settings.STATUS)
    setErrorMsg_modal(I18n.t("social.new_status_msg"))
    setModalVisible(true)
  }

  const openModal_pin = () => {
    setModalTarget(ModalTarget_Settings.PIN)
    setErrorMsg_modal(I18n.t("new_pin"))
    setModalVisible(true)
  }
  const removeProfileImage = async () => {
    try {
      await db
        .collection("users")
        .doc(gc.state.auth.userEmail!)
        .update({ image_uri: "" })
      handleModalClose()
    } catch (e) {}
  }
  const _pickImage = async (openCamera: boolean) => {
    const res_uri = await pickImage(openCamera)
    if (res_uri === "cancelled") {
      return
    } else if (res_uri === "error_permission") {
      Alert.alert(I18n.t("error"), I18n.t("social.er_photo_permission"), [
        { text: I18n.t("confirm") },
      ])
    } else if (res_uri === "error") {
      Alert.alert(I18n.t("error"), "uncaught error", [
        { text: I18n.t("confirm") },
      ])
    } else {
      setLoalImg(res_uri)
      uploadProfileImage(res_uri, gc.state.auth.userEmail!)
    }
  }
  const setNewUsername = async () => {
    if (input_modal.trim() === "") {
      setErrorMsg_modal(I18n.t("er_format"))
      return
    }
    if (input_modal.length < 2) {
      setErrorMsg_modal(I18n.t("er_format_2"))
      return
    }
    try {
      setProcessing_modal(true)
      let _newUsername = input_modal.trim()
      if (
        _newUsername.toLocaleLowerCase() ===
        mainContext.user.username.toLowerCase()
      ) {
        await db.collection("users").doc(gc.state.auth.userEmail!).update({
          username: _newUsername,
        })
        await db
          .collection("usernames")
          .doc(mainContext.user.username.toLowerCase())
          .update({ caseSensitive: _newUsername })
      } else {
        let migration = await db
          .collection("usernames")
          .doc(mainContext.user.username.toLowerCase())
          .get()
        await migration.ref.delete()
        let keywords = [
          gc.state.auth.userEmail!.toLowerCase(),
          gc.state.auth.userEmail!.toLowerCase().split("@")[0],
          ...extractKeywordsFromEmail(
            [
              gc.state.auth.userEmail!.toLowerCase().split("@")[0],
              _newUsername.toLowerCase(),
            ],
            [".", "-", "_"]
          ),
        ]
        keywords = [...new Set(keywords)]
        await db.collection("usernames").doc(_newUsername.toLowerCase()).set({
          email: gc.state.auth.userEmail!,
          caseSensitive: _newUsername,
          keywords: keywords,
        })
        await db.collection("users").doc(gc.state.auth.userEmail!).update({
          username: _newUsername,
        })
      }
      setErrorMsg_modal(I18n.t("ur_new_name") + " : " + _newUsername)
      setInput_modal("")
    } catch (e) {
      setErrorMsg_modal((e as Error).message)
    } finally {
      setProcessing_modal(false)
      setModal_done(true)
    }
  }
  const setNewStatusMessage = async () => {
    try {
      setProcessing_modal(true)
      await db.collection("users").doc(gc.state.auth.userEmail!).update({
        status_msg: input_modal,
      })
      setInput_modal("")
    } catch (e) {
      setErrorMsg_modal((e as Error).message)
    } finally {
      handleModalClose()
    }
  }
  const loadPreset = async () => {
    const qs = await db
      .collection("globalEnv")
      .doc("files")
      .collection("profile_images")
      .orderBy("order", "asc")
      .get()
    const mapped = qs.docs.map((doc) => doc.data())
    setPreset(mapped)
  }
  const setNewPIN = async () => {
    if (!isNumber(input_modal) && input_modal.length >= 1) {
      setErrorMsg_modal(I18n.t("er_onlyNum"))
      return
    }
    if (input_modal.length < 1) {
      setErrorMsg_modal(I18n.t("er_format"))
      return
    }
    try {
      setProcessing_modal(true)
      await db.collection("users").doc(gc.state.auth.userEmail!).update({
        pin: input_modal,
      })
      setErrorMsg_modal(I18n.t("notif_newPIN") + " :" + input_modal)
      setInput_modal("")
    } catch (e) {
      setErrorMsg_modal((e as Error).message)
    } finally {
      setProcessing_modal(false)
      setModal_done(true)
    }
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
            { backgroundColor: modalBgColor(gc.state.env.darkmode!) },
          ]}
        >
          {modalTarget === ModalTarget_Settings.PROFILE ? (
            <>
              {selectedPreset ? (
                <Image
                  source={{ uri: selectedPreset }}
                  style={{
                    width: 128,
                    height: 128,
                    borderRadius: 48,
                    marginBottom: 12,
                  }}
                />
              ) : (
                <Image
                  source={
                    localImg
                      ? { uri: localImg }
                      : mainContext.user.custom_profile_image
                      ? { uri: mainContext.user.custom_profile_image }
                      : require("../assets/icons/1x/defaultUserProfile_action.png")
                  }
                  style={{
                    width: 128,
                    height: 128,
                    borderRadius: 48,
                    marginBottom: 12,
                  }}
                />
              )}
            </>
          ) : (
            <View
              style={{
                marginLeft: 6,
                justifyContent: "center",
                width: 38,
                height: 38,
                borderRadius: 8,
                backgroundColor: iconBgColor(gc.state.env.darkmode!),
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Image
                source={require("../assets/icons/1x/pencil.png")}
                style={{ width: 20, height: 20 }}
              />
            </View>
          )}
          <Text
            style={{
              color: textColor(gc.state.env.darkmode!),
              fontSize: 15,
              fontWeight: "500",
              marginBottom: 12,
            }}
          >
            {preset ? "preset collection" : errorMsg_modal}
          </Text>
          {!processing_modal &&
            !modal_done &&
            modalTarget !== ModalTarget_Settings.PROFILE && (
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
                placeholder=""
                keyboardType={
                  modalTarget === ModalTarget_Settings.PIN
                    ? "numeric"
                    : "default"
                }
                placeholderTextColor={placeHolderTextColor(
                  gc.state.env.darkmode!
                )}
                value={input_modal}
                onChangeText={setInput_modal}
                maxLength={modalTarget === ModalTarget_Settings.PIN ? 8 : 20}
              />
            )}
          {!modal_done && modalTarget !== ModalTarget_Settings.PROFILE && (
            <TouchableOpacity
              disabled={processing_modal}
              style={[
                styles.button,
                {
                  backgroundColor: processing_modal ? "#5c5c5c" : "#2196F3",
                  marginBottom: 15,
                },
              ]}
              onPress={() =>
                modalTarget === ModalTarget_Settings.USERNAME
                  ? setNewUsername()
                  : modalTarget === ModalTarget_Settings.PIN
                  ? setNewPIN()
                  : modalTarget === ModalTarget_Settings.STATUS
                  ? setNewStatusMessage()
                  : console.log("uncaught error")
              }
            >
              <Text style={styles.textStyle}>
                {processing_modal ? I18n.t("processing") : I18n.t("confirm")}
              </Text>
            </TouchableOpacity>
          )}
          {!processing_modal &&
            modalTarget === ModalTarget_Settings.PROFILE &&
            !preset && (
              <>
                {mainContext.user.custom_profile_image ? (
                  <TouchableOpacity
                    disabled={processing_modal}
                    style={[
                      styles.button,
                      { backgroundColor: "#fc4c6f", marginBottom: 15 },
                    ]}
                    onPress={() => removeProfileImage()}
                  >
                    <Text style={styles.textStyle}>
                      {I18n.t("remove_photo")}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <></>
                )}
                <TouchableOpacity
                  disabled={processing_modal}
                  style={[
                    styles.button,
                    { backgroundColor: "#2196F3", marginBottom: 15 },
                  ]}
                  onPress={() => loadPreset()}
                >
                  <Text style={styles.textStyle}>{I18n.t("from_preset")}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  disabled={processing_modal}
                  style={[
                    styles.button,
                    { backgroundColor: "#2196F3", marginBottom: 15 },
                  ]}
                  onPress={() => _pickImage(false)}
                >
                  <Text style={styles.textStyle}>{I18n.t("from_gallery")}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  disabled={processing_modal}
                  style={[
                    styles.button,
                    { backgroundColor: "#2196F3", marginBottom: 15 },
                  ]}
                  onPress={() => _pickImage(true)}
                >
                  <Text style={styles.textStyle}>{I18n.t("take_photo")}</Text>
                </TouchableOpacity>
              </>
            )}
          {!processing_modal &&
            modalTarget === ModalTarget_Settings.PROFILE &&
            preset && (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "#CCCCCC",
                  width: "68%",
                  marginBottom: 12,
                  borderRadius: 12,
                }}
              >
                <ScrollView horizontal>
                  {preset.map((i: any, idx: number) => (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => setSelectedPreset(i.uri)}
                    >
                      <Image
                        source={{ uri: i.uri }}
                        style={{
                          width: 64,
                          height: 64,
                          borderRadius: 24,
                          margin: 10,
                        }}
                      />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          {selectedPreset && (
            <TouchableOpacity
              disabled={processing_modal}
              style={[
                styles.button,
                { backgroundColor: "#2196F3", marginBottom: 15 },
              ]}
              onPress={() => savePreset()}
            >
              <Text style={styles.textStyle}>{I18n.t("done")}</Text>
            </TouchableOpacity>
          )}
          {!processing_modal && (
            <TouchableOpacity
              disabled={processing_modal}
              style={[
                styles.button,
                { backgroundColor: "#2196F3", marginBottom: 15 },
              ]}
              onPress={() => handleModalClose()}
            >
              <Text style={styles.textStyle}>
                {modal_done ? I18n.t("done") : I18n.t("cancel")}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  )

  return (
    <>
      <View
        style={{
          backgroundColor: bgColor(gc.state.env.darkmode!),
          flex: 1,
          marginBottom:
            mainContext.tab_bar_height +
            mainContext.bottomInset +
            mainContext.banner_ad_height,
        }}
      >
        <View style={{ flex: 1 }}>
          <ScrollView>
            <Profile
              openModal_profile={openModal_profile}
              openModal_status={openModal_status}
              openModal_username={openModal_username}
              override_imguri={localImg}
            />
            <Account
              openModal_username={openModal_username}
              navigate_to={(address) => navigation.navigate(address)}
            />
            <Security openModal_pin={openModal_pin} />
            <SNC navigate_to={(address) => navigation.navigate(address)} />
          </ScrollView>
        </View>
      </View>
      {modal}
    </>
  )
}

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
  boxShadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  boxShadow_seamless: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.5,
    shadowRadius: 1.2,
  },
})

export default Settings
