import React, { useContext } from "react"
import { StyleSheet, Text, View } from "react-native"
import { bgColor, dynamic_bottom_tab_Height } from "../../lib/StyleLib"
import { GlobalContext, GlobalContextInterfaceAsReducer, MainContext, MainContextInterface } from "../../ContextManager"

const Chat = () => {
  const globalContext = useContext(GlobalContext) as GlobalContextInterfaceAsReducer
  const mainContext = useContext(MainContext) as MainContextInterface
  return (
    <View
      style={{
        backgroundColor: bgColor(globalContext.state.env.darkmode!),
        height: globalContext.state.env.screenHeight - 45 - dynamic_bottom_tab_Height(Boolean(mainContext.adBlock)),
      }}
    >
      <Text></Text>
    </View>
  )
}

export default Chat

const styles = StyleSheet.create({})
