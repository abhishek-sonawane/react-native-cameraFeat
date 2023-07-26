import React, {useEffect, useRef, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Camera, useCameraDevices} from 'react-native-vision-camera';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import {PermissionsAndroid, Platform} from 'react-native';
import RNFS from 'react-native-fs';
import {hasAndroidPermission} from './MediaPermission';
// import PushNotification from 'react-native-push-notification'

const App = () => {
  const [recording, setRecording] = useState(false);
  const [timer,setTimer] = useState(0)
  useEffect(() => {
    const getper = async () => {
      const d = await Camera.requestCameraPermission();
      // PushNotification.requestPermissions();
      console.log(d);
    };
    getper();
  }, []);
  const devices = useCameraDevices();
  const device = devices.back;
  const camera = useRef(null);
  let timeInterval ;

  const takePicture = async () => {
    const data = await camera.current.takePhoto();
    console.log(data.path);
    // const mediaPerm = await hasAndroidPermission()
    if (await hasAndroidPermission()) {
      CameraRoll.save(data.path);
    }
    return;
  };

  const takeRecording = async () => {
    setRecording(true)
    setTimer(0)
    timeInterval = setInterval(()=>{
      setTimer(prev=>prev+1)
    },1000)
    await camera.current.startRecording({
      onRecordingFinished: async video => {
        console.log(video);
        clearInterval(timeInterval)
        setTimer(0)
        if (await hasAndroidPermission()) {
          CameraRoll.save(video.path);
        }
        return;
      },
      onRecordingError: err => console.log(err),
    });
  };

  const outHandler = async () => {
    if(recording){
      setRecording(false)
    await camera.current.stopRecording();
    }return
  };

  if (device == null)
    return (
      // <Camera  />
      <View>
        <Text>hello </Text>
      </View>
    );
  return (
    <View style={{flex: 1}}>
      <Camera
        ref={camera}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
        video={true}
      />
      {recording ? <Text style={timerStyle.cont} > {timer} seconds</Text> : <Text style={timerStyle.cont}> not recording </Text>}
      <TouchableOpacity
        onPress={() => takePicture()}
        onLongPress={() => takeRecording()}
        onPressOut={() => outHandler()}
        delayLongPress={200}
        style={ {
          width: 60,
          height: 60,
          borderRadius: 100,
          position: 'absolute',
          backgroundColor: 'red',
          bottom: 50,
          alignSelf: 'center',
         transform:[{scale: recording?1.5:1}]
         
        }}></TouchableOpacity>
    </View>
  );
};
const timerStyle = StyleSheet.create({
  cont:{
    position:'absolute',
    top:'80%',
    left:'50%',
    transform:[{translateX:-80}],
    fontSize:20
  }
})
export default App;
