import React, { useContext } from "react"
import {
  GlobalContext,
  GlobalContextInterfaceAsReducer,
} from "../../ContextManager"
import {
  bgColor,
  brandColor,
  containerColor_quater,
  textColor,
} from "../../lib/StyleLib"
import { StyleSheet, Text, View, Dimensions, ScrollView } from "react-native"
import { Button, Image } from "react-native-elements"
import TNC from "../../components/TNC"
import i18n from "i18n-js"

interface Props {
  navigation: any
}

const ApprovalScreen: React.FC<Props> = ({ navigation }) => {
  const gc = useContext(GlobalContext) as GlobalContextInterfaceAsReducer

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: bgColor(gc.state.env.darkmode!) },
      ]}
    >
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          marginTop: 70,
        }}
      >
        <View>
          <Image
            source={require("../../assets/icon_rounded.png")}
            style={{ width: 40, height: 40, marginBottom: 5 }}
          />
        </View>
        <Text
          style={{
            color: brandColor(gc.state.env.darkmode!),
            fontSize: 24,
            fontWeight: "bold",
            marginBottom: 10,
          }}
        >
          {i18n.t("tnc")}
        </Text>
      </View>
      <View
        style={{
          height: Dimensions.get("window").height / 2.2,
          width: Dimensions.get("window").width - 40,
          alignSelf: "center",
          marginBottom: 20,
          padding: 10,
          marginHorizontal: 20,
          borderRadius: 10,
          backgroundColor: containerColor_quater(gc.state.env.darkmode!),
        }}
      >
        <ScrollView>
          <TNC textColor={textColor(gc.state.env.darkmode!)} />
        </ScrollView>
      </View>
      <View style={styles.btn}>
        <Button
          buttonStyle={{ backgroundColor: "#5d9cd4", borderRadius: 5 }}
          titleStyle={{ color: "#ffffff", fontSize: 16, fontWeight: "bold" }}
          title={i18n.t("anr")}
          onPress={() => navigation.navigate("Register")}
        />
      </View>
      <View style={styles.btn}>
        <Button
          buttonStyle={{ backgroundColor: "#69648f", borderRadius: 5 }}
          titleStyle={{ color: "#ffffff", fontSize: 16, fontWeight: "bold" }}
          title={i18n.t("cancel")}
          onPress={() => navigation.goBack()}
        />
      </View>
    </View>
  )
}

export default ApprovalScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  input: {
    paddingHorizontal: 10,
    height: 40,
    width: 300,
    margin: 12,
    borderRadius: 5,
    fontSize: 20,
  },
  btn: {
    marginBottom: 10,
    marginTop: 5,
    width: 200,
    height: 50,
  },
})
