import React, {useRef} from 'react';
import {Platform, SafeAreaView, StatusBar, StyleSheet} from 'react-native';
import {WebView} from 'react-native-webview';
import {
  checkMultiple,
  PERMISSIONS,
  RESULTS,
  openSettings,
} from 'react-native-permissions';
import Geolocation from '@react-native-community/geolocation';

const html = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Permission Sample</title>
    <style>
      div {
        word-break: break-all;
      }
    </style>
  </head>
  <body>
    <div id="status"></div>
    <button id="check_permission">Check Permission</button>
    <button id="request_permission">Request Permission</button>
    <button id="get_location">Get Location</button>
    <button id="open_setting">Open Setting</button>
    <div id="location"></div>
  </body>
  <script>
    document.querySelector("#check_permission").addEventListener("click", () => {
      window.ReactNativeWebView.postMessage("check_permission");
    });
    document.querySelector("#request_permission").addEventListener("click", () => {
      window.ReactNativeWebView.postMessage("request_permission");
    });
    document.querySelector("#get_location").addEventListener("click", () => {
      window.ReactNativeWebView.postMessage("get_location");
    });
    document.querySelector("#open_setting").addEventListener("click", () => {
      window.ReactNativeWebView.postMessage("open_setting");
    });
    document.addEventListener("check_permission", (e) => {
      console.log('check_permission', e)
      document.querySelector("#status").innerHTML = e.detail;
    });
    document.addEventListener("request_permission", (e) => {
      console.log('request_permission', e)
      document.querySelector("#status").innerHTML = e.detail;
    });
    document.addEventListener("get_location", (e) => {
      console.log('get_location', e)
      document.querySelector("#location").innerHTML = e.detail;
    });
  </script>
</html>
`;

Geolocation.setRNConfiguration({
  skipPermissionRequests: true,
  authorizationLevel: 'auto',
  locationProvider: 'auto',
});

const App = () => {
  const webview = useRef(null);

  function checkPermission() {
    if (Platform.OS === 'android') {
      checkMultiple([
        PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
        PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      ])
        .then(statuses => {
          const status1 = statuses[PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION];
          const status2 = statuses[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION];
          console.log('checkMultiple', status1 + ', ' + status2);
          checkPermissionProcess(status1);
        })
        .catch(error => {
          console.log('checkPermission error', error);
          checkPermissionProcess(error);
        });
    } else if (Platform.OS === 'ios') {
      checkMultiple([PERMISSIONS.IOS.LOCATION_WHEN_IN_USE])
        .then(statuses => {
          const status = statuses[PERMISSIONS.IOS.LOCATION_WHEN_IN_USE];
          checkPermissionProcess(status);
        })
        .catch(error => {
          console.log('checkPermission error', error);
          checkPermissionProcess(error);
        });
    }
  }

  function checkPermissionProcess(status) {
    let message = 'error';
    switch (status) {
      case RESULTS.UNAVAILABLE:
        message =
          'This feature is not available (on this device / in this context)';
        break;
      case RESULTS.DENIED:
        message =
          'The permission has not been requested / is denied but requestable';
        break;
      case RESULTS.LIMITED:
        message = 'The permission is limited: some actions are possible';
        break;
      case RESULTS.GRANTED:
        message = 'The permission is granted';
        break;
      case RESULTS.BLOCKED:
        message = 'The permission is denied and not requestable anymore';
        break;
    }
    console.log(message);
    run('check_permission', message);
  }

  function requestPermission() {
    Geolocation.requestAuthorization(
      () => {
        console.log('request_permission success');
        run('request_permission', 'Request Permission success');
      },
      err => {
        console.log('request_permission error', err);
        run('request_permission', `Request Permission ${JSON.stringify(err)}`);
      },
    );
  }

  function getLocation() {
    Geolocation.getCurrentPosition(
      position => {
        console.log('get_location success', position);
        run('get_location', `Get Location ${JSON.stringify(position)}`);
      },
      err => {
        console.log('get_location error', err);
        run('get_location', `Get Location Error ${JSON.stringify(err)}`);
      },
      {
        enableHighAccuracy: true,
      },
    );
  }

  async function openSetting() {
    await openSettings();
  }

  function onMessage(e) {
    const data = e.nativeEvent.data;
    switch (data) {
      case 'check_permission':
        checkPermission();
        break;
      case 'request_permission':
        requestPermission();
        break;
      case 'get_location':
        getLocation();
        break;
      case 'open_setting':
        openSetting();
        break;
    }
  }

  function run(eventName, data) {
    const dispatchCommand = `
document.dispatchEvent(new CustomEvent('${eventName}', { detail: ${JSON.stringify(
      data,
    )} }));
true;
`;
    console.log('run', dispatchCommand);
    webview.current?.injectJavaScript(dispatchCommand);
  }

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar />
      <WebView
        ref={r => (webview.current = r)}
        originWhitelist={['*']}
        source={{html}}
        onMessage={onMessage}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default App;
