import React from 'react'
import { Image } from 'react-native'

// JS-only component : module is a function component with no dependancy
const Favorite_icon = ({w,h}) => {
    return (
        <Image
            source={require("../assets/icons/1x/star2.png")}
            style={{width:w,height:h,tintColor:"#BCAB34",position: 'absolute',marginLeft:4}}
        />
    )
}

export default Favorite_icon
