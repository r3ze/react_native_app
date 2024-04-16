import { View, Text, Image } from 'react-native'
import {Tabs, Redirect} from 'expo-router'

import  {icons} from '../../constants'
const TabIcon = ({icon, color, name, focused}) =>{
    return (
        <View className="items-center justify-center gap-2">
            <Image  
                source={icon}
                resizeMode='contain'
                tintColor={color}
                className="w-6 h-6"
            />
            <Text className={`${focused ? 'font-psemibold':
            'font-pregular'} text-xs`}>{name}</Text>
        </View>
    )
}
const TabsLayout = () => {
 return(
    <>
    <Tabs screenOptions={{
        tabBarShowLabel:false,
        tabBarStyle:{
            borderTopWidth: 1,
            height:84
        }
    }}>
        
    <Tabs.Screen
    name = "home"
    options={{
        title:'Home',
        headerShown:false,
        tabBarIcon: ({color, focused}) =>(
        <TabIcon
        icon={icons.home}
        color={color}
        name="Home"
        focused={focused}
        />
        )
    }}
/>
<Tabs.Screen
    name = "tasks"
    options={{
        title:'Tasks',
        headerShown:false,
        tabBarIcon: ({color, focused}) =>(
        <TabIcon
        icon={icons.tasks}
        color={color}
        name="Tasks"
        focused={focused}
        />
        )
    }}
/>
<Tabs.Screen
    name = "profile"
    options={{
        title:'Profile',
        headerShown:false,
        tabBarIcon: ({color, focused}) =>(
        <TabIcon
        icon={icons.profile}
        color={color}
        name="Profile"
        focused={focused}
        />
        )
    }}
/>
    </Tabs>
    
    </>
 )
}

export default TabsLayout