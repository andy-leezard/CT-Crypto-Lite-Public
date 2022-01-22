import React, { useState, useContext } from "react"
import {
  StyleSheet,
  Text,
  View,
  Alert,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from "react-native"
import { db } from "../../firebase"
import I18n from "i18n-js"
import { GlobalContext } from "../StateManager"
import { GlobalContextInterfaceAsReducer } from "../lib/Types"
import {
  containerColor,
  containerRadiusColor,
  textColor,
} from "../lib/StyleLib"

const screenWidth = Dimensions.get("window").width

interface Props {
  route: any
  navigation: any
}

const EditUsername: React.FC<Props> = ({ route, navigation }) => {
  const globalContext =
    useContext<GlobalContextInterfaceAsReducer>(GlobalContext)
  const [msg_username_error, setmsg_username_error] = useState<string>(
    I18n.t("er_format")
  )
  const [redoInfo_username, setRedoInfo_username] = useState<boolean>(false)
  const [newusername, setnewusername] = useState<string>("")

  const confirmNewUsername = () => {
    if (newusername.trimStart() === "") {
      setRedoInfo_username(true)
      setmsg_username_error(I18n.t("er_format"))
      return
    }
    if (newusername.length < 2) {
      setRedoInfo_username(true)
      setmsg_username_error(I18n.t("er_format_2"))
      return
    }
    let _newUsername = newusername.trimStart()
    db.collection("users")
      .doc(globalContext.state.auth.userEmail!)
      .update({
        username: _newUsername,
      })
      .then(() => {
        setRedoInfo_username(false)
        Alert.alert(
          I18n.t("notification"),
          I18n.t("ur_new_name") + " : " + _newUsername,
          [{ text: I18n.t("ok") }]
        )
        navigation.goBack()
      })
      .catch((err) => {
        setRedoInfo_username(true)
        setmsg_username_error(err)
      })
  }

  return (
    <View style={{ flex: 1, paddingTop: 15 }}>
      <View>
        <Text
          style={{
            fontSize: 17,
            fontWeight: "600",
            letterSpacing: 0.5,
            color: textColor(globalContext.state.env.darkmode!),
            marginLeft: 15,
            marginBottom: 10,
          }}
        >
          {I18n.t("new_username")}
        </Text>
        {redoInfo_username && (
          <View
            style={{
              backgroundColor: "rgba(0,0,0,0.5)",
              borderWidth: 1,
              borderColor: "#FDD7D8",
              borderRadius: 10,
              padding: 5,
              width: screenWidth - 40,
              alignSelf: "center",
              marginBottom: 10,
            }}
          >
            <Text style={{ color: "#ffffff", fontSize: 15, fontWeight: "700" }}>
              {msg_username_error}
            </Text>
          </View>
        )}
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: containerColor(
                globalContext.state.env.darkmode!
              ),
              borderColor: containerRadiusColor(
                globalContext.state.env.darkmode!
              ),
              color: textColor(globalContext.state.env.darkmode!),
            },
          ]}
          value={newusername}
          onChangeText={setnewusername}
          autoFocus={true}
          maxLength={20}
        />
        <TouchableOpacity
          style={{
            alignSelf: "center",
            height: 45,
            width: Dimensions.get("window").width - 40,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#73A1FF",
            borderRadius: 10,
          }}
          onPress={() => confirmNewUsername()}
        >
          <Text style={{ fontSize: 17, color: "white", fontWeight: "bold" }}>
            {I18n.t("confirm")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default EditUsername

const styles = StyleSheet.create({
  input: {
    alignSelf: "center",
    height: 35,
    width: screenWidth - 40,
    paddingLeft: 10,
    borderWidth: 1,
    borderRadius: 10,
    fontSize: 15,
    marginBottom: 15,
  },
})
