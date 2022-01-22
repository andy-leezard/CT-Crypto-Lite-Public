import React from "react"
import { StyleSheet, View, Image, Text } from "react-native"
import { CT_Wallet } from "../../lib/Types"

interface Props {
  data: CT_Wallet[]
  newbie?: boolean
  isHoarder?: boolean
  bullishIndex?: number
  size: {
    width: number
    height: number
    marginBottom?: number
  }
}

const PersonalBiggestCoins = (props: Props) => {
  const RenderImage: React.FC<{ img: JSX.Element }> = ({ img }) => {
    return (
      <View
        style={[
          styles.container,
          {
            width: props.size.width,
            height: props.size.height,
          },
        ]}
      >
        {img}
      </View>
    )
  }
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        marginBottom: props.size.marginBottom ?? 0,
      }}
    >
      {Boolean(props.bullishIndex && props.bullishIndex > 0) && (
        <RenderImage
          img={
            <Image
              source={require("../../assets/icons/1x/bullish.png")}
              style={{
                width: props.size.width - 2,
                height: props.size.height - 2,
                borderRadius: 5,
              }}
            />
          }
        />
      )}
      {Boolean(props.bullishIndex && props.bullishIndex < 0) && (
        <RenderImage
          img={
            <Image
              source={require("../../assets/icons/1x/bearish.png")}
              style={{
                width: props.size.width - 4,
                height: props.size.height - 4,
                borderRadius: 5,
              }}
            />
          }
        />
      )}
      {Boolean(props.newbie) && (
        <RenderImage
          img={
            <Image
              source={require("../../assets/icons/1x/newbie.png")}
              style={{
                width: props.size.width - 4,
                height: props.size.height - 4,
                borderRadius: 5,
              }}
            />
          }
        />
      )}
      {Boolean(props.isHoarder) && (
        <RenderImage
          img={
            <Image
              source={require("../../assets/icons/1x/bills.png")}
              style={{
                width: props.size.width - 4,
                height: props.size.height - 4,
                borderRadius: 5,
              }}
            />
          }
        />
      )}
      {props.data &&
        props.data.map((e) => {
          return (
            <React.Fragment key={e.id}>
              {e.img && (
                <RenderImage
                  img={
                    <Image
                      source={{ uri: e.img }}
                      style={{
                        width: props.size.width - 2,
                        height: props.size.height - 2,
                        borderRadius: 5,
                      }}
                    />
                  }
                />
              )}
            </React.Fragment>
          )
        })}
    </View>
  )
}

export default PersonalBiggestCoins

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 2,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 5,
  },
})
