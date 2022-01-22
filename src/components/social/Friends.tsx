import I18n from "i18n-js"
import React, { useContext, useState, useEffect } from "react"
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Modal,
  Alert,
  Pressable,
  ScrollView,
  FlatList,
} from "react-native"
import { bgColor, dynamic_bottom_tab_Height } from "../../lib/StyleLib"
import { ModalTarget_Friends } from "../../lib/Types"
import {
  GlobalContext,
  GlobalContextInterfaceAsReducer,
  MainContext,
  MainContextInterface,
} from "../../ContextManager"
import * as StyleLib from "../../lib/StyleLib"
import { db } from "../../../firebase"
import { joinDiscord, pickImage, uploadProfileImage } from "../../lib/FuncLib"
import Profile from "../settings/Profile"
import SearchedFriend from "./SearchedFriend"

const screenWidth = Dimensions.get("window").width

const Friends = () => {
  const gc = useContext(GlobalContext) as GlobalContextInterfaceAsReducer
  const mainContext = useContext(MainContext) as MainContextInterface
  const [keyword, setKeyword] = useState("")
  const [modalVisible, setModalVisible] = useState(false)
  const [preset, setPreset] = useState<any>(null)
  const [selectedPreset, setSelectedPreset] = useState<any>(null)
  const [errorMsg_modal, setErrorMsg_modal] = useState<string>("")
  const [processing_modal, setProcessing_modal] = useState<boolean>(false)
  const [modal_done, setModal_done] = useState<boolean>(false)
  const [modalTarget, setModalTarget] = useState<ModalTarget_Friends | null>(
    null
  )
  const [input_modal, setInput_modal] = useState<string>("")
  const [searchedFriends, setSearchedFriends] = useState<any>([])
  const [searchLimit, setSearchlimit] = useState(20)
  const [localImg, setLoalImg] = useState<any>("")

  useEffect(() => {
    if (
      modalTarget === ModalTarget_Friends.ADDFRIENDS &&
      input_modal.length > 2
    ) {
      searchFriends(input_modal.toLowerCase())
    }
  }, [modalTarget, input_modal, searchLimit])

  const searchFriends = async (keyword: string) => {
    let usernamesRef = await db
      .collection("usernames")
      .where("keywords", "array-contains", keyword)
      .limit(searchLimit)
      .get()
    let docs = usernamesRef.docs.map((doc) => doc.data())
    setSearchedFriends(docs)
  }

  const copyButtonColor = () => {
    return gc.state.env.darkmode ? "#b389e0" : "#7C81BB"
  }

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
    setInput_modal("")
    setSearchedFriends([])
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
    setModalTarget(ModalTarget_Friends.USERNAME)
    setErrorMsg_modal(I18n.t("new_username"))
    setModalVisible(true)
  }
  const openModal_profile = () => {
    setModalTarget(ModalTarget_Friends.PROFILE)
    setErrorMsg_modal(I18n.t("profile_pic"))
    setModalVisible(true)
  }
  const openModal_status = () => {
    setModalTarget(ModalTarget_Friends.STATUS)
    setErrorMsg_modal(I18n.t("social.new_status_msg"))
    setModalVisible(true)
  }
  const openModal_friends = () => {
    setModalTarget(ModalTarget_Friends.ADDFRIENDS)
    setErrorMsg_modal("Search users")
    setModalVisible(true)
  }
  const removeProfileImage = async () => {
    try {
      await db
        .collection("users")
        .doc(gc.state.auth.userEmail!)
        .update({ image_uri: "" })
      handleModalClose()
    } catch (e) {
      console.log(e)
    }
  }
  const _pickImage = async (openCamera: boolean) => {
    const res_uri = await pickImage(openCamera)
    if (res_uri === "cancelled") {
      return
    } else if (res_uri === "error_permission") {
      Alert.alert(I18n.t('"error"'), I18n.t("social.er_photo_permission"), [
        { text: I18n.t("confirm") },
      ])
    } else if (res_uri === "error") {
      Alert.alert(I18n.t('"error"'), "uncaught error", [
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
      await db.collection("users").doc(gc.state.auth.userEmail!).update({
        username: _newUsername,
      })
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

  const zero_friend = (
    <>
      <Image source={require("../../assets/icons/1x/group3.png")} />
      <Text
        style={{
          color: StyleLib.brandColor(gc.state.env.darkmode!),
          marginTop: 20,
          fontWeight: "bold",
          fontSize: 20,
          marginBottom: 20,
        }}
      >
        Find and add new friends !
      </Text>
      <TouchableOpacity
        style={{
          width: 300,
          alignItems: "center",
          marginVertical: 10,
          padding: 10,
          borderRadius: 10,
          backgroundColor: copyButtonColor(),
          justifyContent: "center",
        }}
        onPress={joinDiscord}
      >
        <Image
          source={require("../../assets/icons/1x/discord.png")}
          style={{ width: 35, height: 35 }}
        />
        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 17,
            fontWeight: "700",
            marginBottom: 5,
          }}
        >
          Find friends on Discord Channel
        </Text>
      </TouchableOpacity>
    </>
  )

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
            { backgroundColor: StyleLib.modalBgColor(gc.state.env.darkmode!) },
          ]}
        >
          {modalTarget === ModalTarget_Friends.PROFILE ? (
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
                      : require("../../assets/icons/1x/defaultUserProfile_action.png")
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
          ) : modalTarget === ModalTarget_Friends.ADDFRIENDS ? (
            <View
              style={{
                marginLeft: 6,
                justifyContent: "center",
                width: 38,
                height: 38,
                borderRadius: 8,
                backgroundColor: StyleLib.iconBgColor(gc.state.env.darkmode!),
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Image
                source={require("../../assets/icons/1x/addFriend.png")}
                style={{ width: 20, height: 20 }}
              />
            </View>
          ) : (
            <View
              style={{
                marginLeft: 6,
                justifyContent: "center",
                width: 38,
                height: 38,
                borderRadius: 8,
                backgroundColor: StyleLib.iconBgColor(gc.state.env.darkmode!),
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Image
                source={require("../../assets/icons/1x/pencil.png")}
                style={{ width: 20, height: 20 }}
              />
            </View>
          )}
          <Text
            style={{
              color: StyleLib.textColor(gc.state.env.darkmode!),
              fontSize: 15,
              fontWeight: "500",
              marginBottom: 12,
            }}
          >
            {preset ? "preset collection" : errorMsg_modal}
          </Text>
          {modalTarget === ModalTarget_Friends.ADDFRIENDS && (
            <>
              <View>
                <TextInput
                  style={{
                    paddingHorizontal: 10,
                    height: 40,
                    width: Math.min(screenWidth * 0.75, 300),
                    marginBottom: 12,
                    borderRadius: 10,
                    fontSize: 20,
                    color: "#FFFFFF",
                    backgroundColor: gc.state.env.darkmode
                      ? "#333333"
                      : "rgba(0,0,0,0.25)",
                  }}
                  placeholder={"Nickname or email"}
                  placeholderTextColor={StyleLib.subTextColor(
                    gc.state.env.darkmode!
                  )}
                  value={input_modal}
                  onChangeText={setInput_modal}
                  maxLength={16}
                />
                <Image
                  source={require("../../assets/icons/1x/search.png")}
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
          {!processing_modal &&
            !modal_done &&
            modalTarget !== ModalTarget_Friends.PROFILE &&
            modalTarget !== ModalTarget_Friends.ADDFRIENDS && (
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
                keyboardType="default"
                placeholderTextColor={StyleLib.placeHolderTextColor(
                  gc.state.env.darkmode!
                )}
                value={input_modal}
                onChangeText={setInput_modal}
                maxLength={20}
              />
            )}
          {!modal_done &&
            modalTarget !== ModalTarget_Friends.PROFILE &&
            modalTarget !== ModalTarget_Friends.ADDFRIENDS && (
              <TouchableOpacity
                disabled={processing_modal || !input_modal}
                style={[
                  styles.button,
                  {
                    backgroundColor:
                      processing_modal || !input_modal ? "#5c5c5c" : "#2196F3",
                    marginBottom: 15,
                  },
                ]}
                onPress={() =>
                  modalTarget === ModalTarget_Friends.USERNAME
                    ? setNewUsername()
                    : modalTarget === ModalTarget_Friends.STATUS
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
            modalTarget === ModalTarget_Friends.PROFILE &&
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
            modalTarget === ModalTarget_Friends.PROFILE &&
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
          height:
            gc.state.env.screenHeight -
            45 -
            dynamic_bottom_tab_Height(Boolean(mainContext.adBlock)),
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 10,
            width: screenWidth,
          }}
        >
          <TextInput
            style={[
              styles.searchbar_input,
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
            onChangeText={setKeyword}
          />
          <Image
            source={require("../../assets/icons/1x/search.png")}
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
            onPress={openModal_friends}
          >
            <View
              style={{
                width: 35,
                height: 35,
                borderRadius: 8,
                borderColor: "#BCAB34",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: StyleLib.containerColor_sexies(
                  gc.state.env.darkmode!
                ),
              }}
            >
              <Image
                source={require("../../assets/icons/1x/addFriend.png")}
                style={{
                  width: 20,
                  height: 20,
                  tintColor: StyleLib.focusedColor(gc.state.env.darkmode!),
                }}
              />
            </View>
          </TouchableOpacity>
        </View>
        <Profile
          openModal_profile={openModal_profile}
          openModal_status={openModal_status}
          openModal_username={openModal_username}
          minimum_information
        />
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
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View style={{ alignItems: "center" }}>{zero_friend}</View>
        </View>
      </View>
      {modal}
    </>
  )
}

export default Friends

const styles = StyleSheet.create({
  searchbar_input: {
    width: screenWidth - 65,
    marginLeft: 10,
    paddingHorizontal: 10,
    paddingLeft: 30,
    borderWidth: 2,
    borderRadius: 10,
    fontSize: 15,
  },
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
    minWidth: "100%",
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
