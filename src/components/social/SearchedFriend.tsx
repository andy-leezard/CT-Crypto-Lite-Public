import React, { useEffect, useState } from "react"
import { StyleSheet, Text, TouchableOpacity, View, Image } from "react-native"
import { db } from "../../../firebase"
import { DocumentSnapshot } from "@firebase/firestore-types"

const SearchedFriend: React.FC<{
  i: any
  width?: number
  touchCallback?: (i: any) => void
}> = ({ i, width, touchCallback }) => {
  const [userdata, setUserdata] = useState<any>()
  useEffect(() => {
    let isMounted = true
    fetchData().then((userdata) => {
      if (isMounted) {
        setUserdata(userdata)
      }
    })
    return () => {
      isMounted = false
    }
  }, [])

  const fetchData = async () => {
    let userdataRef = await db.collection("users").doc(i.email).get()
    return userdataRef.data() as DocumentSnapshot
  }

  return (
    <>
      {userdata && (
        <TouchableOpacity
          style={{
            width: width ?? "100%",
            borderRadius: 10,
            backgroundColor: "#FFFFFF",
            flexDirection: "row",
            paddingVertical: 5,
            marginVertical: 3,
          }}
          onPress={() => {
            if (touchCallback) {
              touchCallback({ ...i, imgsrc: userdata.image_uri })
            }
          }}
        >
          <Image
            style={{ height: 50, width: 50, borderRadius: 10, marginLeft: 5 }}
            source={
              userdata.image_uri
                ? { uri: userdata.image_uri }
                : require("../../assets/icons/1x/defaultUserProfile_action.png")
            }
          />
          <View
            style={{
              justifyContent: "space-around",
              alignItems: "center",
              flex: 1,
            }}
          >
            <Text style={{ fontWeight: "bold" }}>{i.caseSensitive}</Text>
            <Text style={{ fontWeight: "bold" }}>
              {userdata.status_msg
                ? `" ${userdata.status_msg} "`
                : `" Hi, I'm ${i.caseSensitive} "`}
            </Text>
          </View>
        </TouchableOpacity>
      )}
    </>
  )
}

export default SearchedFriend

const styles = StyleSheet.create({})
