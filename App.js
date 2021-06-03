import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Camera } from 'expo-camera';
import * as Speech from 'expo-speech';
export default function App() {
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const cam = useRef();

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  const _handleImagePicked = async (pickerResult) => {
    let uploadResponse, uploadResult;

    try {
      setUploading(true);

      if (!pickerResult.cancelled) {
        // console.log(pickerResult.uri);
        await uploadImageAsync(pickerResult.uri);
      }

      // if (!pickerResult.cancelled) {
      //   uploadResponse = await uploadImageAsync(pickerResult.uri);
      //   uploadResult = await uploadResponse.json();
      //   this.setState({
      //     image: uploadResult.location,
      //   });
      // speak(response);
    } catch (e) {
      // console.log({ uploadResponse });
      // console.log({ uploadResult });
      // console.log({ e });
      alert('Upload failed, sorry :(');
    } finally {
      setUploading(false);
    }
  };

  const _takePicture = async () => {
    if (cam.current) {
      const option = {
        quality: 0,
        skipPreprocessing: false,
      };

      let picture = await cam.current.takePictureAsync(option);
      const source = picture.uri;
      if (source) {
        await _handleImagePicked(picture);
        // console.log(source);
      }
    }
  };

  var response;

  function speak(text) {
    const thingToSay = '1';
    Speech.speak(text);
  }

  async function uploadImageAsync(uri) {
    const apiUrl = 'http://192.168.1.103:8000/upload';
    let uriParts = uri.split('.');
    let fileType = uriParts[uriParts.length - 1];

    let formData = new FormData();
    formData.append('photo', {
      uri,
      name: `photo.${fileType}`,
      type: `image/${fileType}`,
    });

    let options = {
      method: 'POST',
      body: formData,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'multipart/form-data',
      },
    };

    async function getData() {
      response = await fetch(apiUrl, options);
      const json = await response.json();
      response = json.txt;
      Speech.speak(response);
    }
    await getData();
    // return fetch(apiUrl, options);
  }

  return (
    <View style={{ flex: 1 }}>
      <Camera
        ratio={'20:9'}
        ref={cam}
        style={{ flex: 1, height: '80%' }}
        type={type}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'transparent',
            flexDirection: 'row',
          }}
        >
          <TouchableOpacity
            style={{
              flex: 1,
              height: '50%',
              alignSelf: 'flex-end',
              alignItems: 'center',
              backgroundColor: 'transparent',
            }}
            onPress={() => _takePicture()}
          >
            <Text
              style={{
                fontSize: 18,
                marginBottom: 10,
                color: 'white',
              }}
            >
              Tap
            </Text>
          </TouchableOpacity>
        </View>
      </Camera>
    </View>
  );
}
