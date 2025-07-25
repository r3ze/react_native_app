import { StatusBar } from 'expo-status-bar';
import { Text, View,SafeAreaView,ScrollView,Image } from 'react-native';
import {Link, Redirect, router} from 'expo-router'
import {icons,images} from '../constants'
import CustomButtons from '../components/CustomButtons';
import { useGlobalContext } from '../context/GlobalProvider';


export default function App() {

  const { isLoading, isLoggedIn } = useGlobalContext();

  if (!isLoading && isLoggedIn) return <Redirect href="/submit"/>
  if(!isLoading && !isLoggedIn) return <Redirect href="/sign-in"/>
 
  
  return (  

    <SafeAreaView className = "bg-primary h-full">
      <ScrollView contentContainerStyle={{height:'100%'}}>
      <View className='w-full items-center justify-center h-full px-4 mt-5'>
        
        <Image
         source={icons.fleco}
         className="max-w-[300px] w-full h-[300px]"
         resizeMode='contain'/>
        
       
         
   
    
      </View>
  
       </ScrollView>
     
    </SafeAreaView>
  );
}



