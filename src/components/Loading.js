import React, { Component } from 'react'
import { Animated, View, Image } from 'react-native'

export default class Loading extends Component {
    constructor(props){
        super(props)
        this.RotateValue = new Animated.Value(0);
    }

    componentDidMount(){
        this.StartImageRotationFunction()
    }

    StartImageRotationFunction(){
        this.RotateValue.setValue(0);
        Animated.timing(this.RotateValue, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true
        }).start(()=> this.StartImageRotationFunction())
    }
    render() {
        const RotateData = this.RotateValue.interpolate({
            inputRange: [0,1],
            outputRange: ['0deg','360deg']
        })
        return (
            <View>
                <Animated.Image
                    style={{width:this.props.width,height:this.props.height,transform:[{rotate:RotateData}]}}
                    source={require('../assets/icons/1x/loading.png')}
                    tintColor="#1DC08B"
                />
            </View>
        )
    }
}