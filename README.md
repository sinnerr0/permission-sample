# RN Webview에서 위치 정보 권한 및 데이터 요청

## 필요 요구사항 기능

- 권한 확인
- 권한 요청
- 현재 위치 요청
- 수동 설정을 위한 설정 열기

# 위치 정보 권한 요청 및 사용

- Expo(React Native를 기반으로 구축된 일련의 도구 및 서비스) 기반
  - [https://docs.expo.dev/versions/v47.0.0/sdk/location/](https://docs.expo.dev/versions/v47.0.0/sdk/location/)를 사용
- React Native CLI 기반
  - 권한 요청으로 https://github.com/zoontek/react-native-permissions를 사용하고 있는 중
  - https://github.com/michalchudziak/react-native-geolocation에서 권한 요청 및 사용을 함께 포함하고 있어 해당 패키지로 전부 처리
  - 웹뷰 클라이언트와의 인터페이스 정의 및 구현 필요

# RN ↔ WebView 인터페이스 정의

## RN → WebView

- RN send

  - injectJavaScript를 사용하여 webview 이벤트 dispatch

  ```jsx
  document.dispatchEvent(new CustomEvent('eventName', {detail: {...data}}));
  ```

- Webview receive

  ```jsx
  document.addEventListener('eventName', handlerFunction);
  ```

## WebView → RN

- WebView send
  - RN WebView client interface(`ReactNativeWebView`) postMessage 함수로 전달
  - `window.ReactNativeWebView.postMessage(JSON.stringify('StringOrJson'))`
- RN receive

  - WebView onMessage 핸들러 통해 받음

  ```jsx
  async function onMessage(event) {
    let data = JSON.parse(event.nativeEvent.data);
    ...
  }
  ```

# 위치 권한 요청 및 사용 과정

1. 위치 권한이 있는지 WebView에서 RN에 확인 요청
2. 권한 확인 결과 WebView에 전달
3. 없다면 안내 팝업 노출(Android, iOS 모두 권고사항 및 디자인 가이드이고 필수는 아님)

   a. 지도 앱<카카오맵, 네이버맵>의 경우엔 안내 없이 앱 실행하면 바로 권한 요청

   b. 지도 앱이 아닌 배민도 안내 없이 바로 권한 요청

   c. 네이버 앱의 경우엔 최초 앱 설치 시 안내 팝업 노출함

4. 안내 팝업에서 거부하지 않는다면 WebView에서 RN에 위치 권한 요청

   a. 거부 시 기본적인 기능 제공

   b. 거부 후 앱 재진입 시 다시 위치 권한 요청

5. RN에서 위치 권한 확인 및 그 결과를 WebView에 전달

   a. 거부 시 기본적인 기능 제공

   b. 권한이 없을 시 관련 권한 사용하려 하면 알림 표시

6. WebView에서 현재 위치 RN에 요청
7. 현재 위치 RN에서 WebView로 전달
