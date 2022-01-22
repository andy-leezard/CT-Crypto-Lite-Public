import React, { useMemo } from 'react'
import { Text } from 'react-native'
import { Picker } from "@react-native-picker/picker"
import I18n from 'i18n-js'
import { textColor } from '../../lib/StyleLib'
import { GlobalContextInterface } from '../../ContextManager'

interface Props {
    datainterval:string
    globalContext:GlobalContextInterface
    callBack:(i:string)=>void
}

const Picker_Android:React.FC<Props> = ({ datainterval, globalContext, callBack }) => {
    const _options = useMemo(()=>{
        return [
            {value: I18n.t('inthepast_h'),label: I18n.t('inthepast_h')},
            {value: I18n.t('inthepast_d'),label: I18n.t('inthepast_d')},
            {value: I18n.t('inthepast_w'),label: I18n.t('inthepast_w')},
            {value: I18n.t('inthepast_2w'),label: I18n.t('inthepast_2w')},
            {value: I18n.t('inthepast_m'),label: I18n.t('inthepast_m')},
            {value: I18n.t('inthepast_200'),label: I18n.t('inthepast_200')},
            {value: I18n.t('inthepast_y'),label: I18n.t('inthepast_y')},
        ];
    }, [globalContext])
    return (
        <>
            <Text style={{color:textColor(globalContext.env.darkmode!),fontWeight:"600",fontSize:16,textAlign:"left",marginLeft:10}}>
                {I18n.t('inthepast')}
            </Text>
            <Picker
                onValueChange={callBack}
                selectedValue={datainterval}
                style={{width:globalContext.env.screenWidth-85,height:22,marginLeft:-3,color:textColor(globalContext.env.darkmode!)}}
                mode='dropdown'
            >
                {_options.map((i)=>{
                    return (<Picker.Item key={i.label} label={i.label} value={i.value} />)
                })}
            </Picker>
        </>
    )
}

export default Picker_Android
