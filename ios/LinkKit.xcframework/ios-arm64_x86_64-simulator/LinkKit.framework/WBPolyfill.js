/*jslint
        browser
*/
/*global
        atob, Event, nslog, uk, window
*/
//  Copyright 2016-2017 Paul Theriault and David Park. All rights reserved.
//
//  Licensed under the Apache License, Version 2.0 (the "License");
//  you may not use this file except in compliance with the License.
//  You may obtain a copy of the License at
//
//  http://www.apache.org/licenses/LICENSE-2.0
//
//  Unless required by applicable law or agreed to in writing, software
//  distributed under the License is distributed on an "AS IS" BASIS,
//  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  See the License for the specific language governing permissions and
//  limitations under the License.
// adapted from chrome app polyfill https://github.com/WebBluetoothCG/chrome-app-polyfill

!function(){"use strict";const n=enode.wb,c=enode.wbutils;if(nslog("Initialize web bluetooth runtime"),navigator.bluetooth)nslog("navigator.bluetooth already exists, skipping polyfill");else{let s,e=(nslog("Create BluetoothGATTDescriptor"),nslog("Create bluetooth"),{});function a(e,t){c.defineROProperties(this,{type:e,target:t,srcElement:t})}e.requestDevice=async function(e){if(!e)throw new TypeError("requestDeviceOptions not provided");var t=e.acceptAllDevices;let i=e.filters,o;if(t){if(i&&0<i.length)throw new TypeError("acceptAllDevices was true but filters was not empty");o=s.sendMessage("requestDevice",{data:{acceptAllDevices:!0}})}else{if(!i||0===i.length)throw new TypeError("No filters provided and acceptAllDevices not set");try{i=Array.prototype.map.call(i,c.canonicaliseFilter)}catch(e){return Promise.reject(e)}e={};e.filters=i,o=s.sendMessage("requestDevice",{data:e})}try{return new n.BluetoothDevice(await o)}catch(e){if("User cancelled"===e)throw new DOMException("User cancelled","NotFoundError");throw e}},e.getAvailability=async function(){return s.sendMessage("getAvailability")},a.prototype={prototype:Event.prototype,constructor:a},n.BluetoothEvent=a,s={messageCount:0,callbacks:{},cancelTransaction:function(e){var t=this.callbacks[e];t?(delete this.callbacks[e],t(!1,"Premature cancellation.")):nslog(`No transaction ${e} outstanding to fail.`)},getTransactionID:function(){let e=this.messageCount;for(;e+=1,void 0!==s.callbacks[e];);return this.messageCount=e,this.messageCount},sendMessage:function(n,e){if(void 0===n)throw new Error("CallRemote should never be called without a type!");var t=(e=e||{}).data||{};let c=e.callbackID||this.getTransactionID();return e={type:n,data:t,callbackID:c},nslog(n+" "+c),window.webkit.messageHandlers.bluetooth.postMessage(e),this.messageCount+=1,new Promise(function(i,o){s.callbacks[c]=function(e,t){(e?(nslog(`${n} ${c} success`),i):(nslog(`${n} ${c} failure `+JSON.stringify(t)),o))(t),delete s.callbacks[c]}})},receiveMessageResponse:function(e,t,i){void 0!==i&&s.callbacks[i]?s.callbacks[i](e,t):nslog("Response for unknown callbackID "+i)},devicesBeingNotified:{},registerDeviceForNotifications:function(t){var e=t.id,i=(void 0===s.devicesBeingNotified[e]&&(s.devicesBeingNotified[e]=[]),s.devicesBeingNotified[e]);i.forEach(function(e){if(e===t)throw new Error("Device already registered for notifications")}),nslog(`Register device ${e} for notifications`),i.push(t)},unregisterDeviceForNotifications:function(t){var i=t.id;if(void 0!==s.devicesBeingNotified[i]){var o=s.devicesBeingNotified[i];let e;for(e=0;e<o.length;e+=1)if(o[e]===t)return void o.splice(e,1)}},receiveDeviceDisconnectEvent:function(e){nslog(e+" disconnected");var t=s.devicesBeingNotified[e];void 0!==t&&t.forEach(function(e){e.handleSpontaneousDisconnectEvent(),s.unregisterDeviceForNotifications(e)}),s.characteristicsBeingNotified[e]=void 0},characteristicsBeingNotified:{},registerCharacteristicForNotifications:function(e){var t=e.service.device.id,i=e.uuid,t=(nslog(`Registering char UUID ${i} on device `+t),void 0===s.characteristicsBeingNotified[t]&&(s.characteristicsBeingNotified[t]={}),s.characteristicsBeingNotified[t]);void 0===t[i]&&(t[i]=[]),t[i].push(e)},receiveCharacteristicValueNotification:function(e,t,i){nslog("receiveCharacteristicValueNotification");var t=window.BluetoothUUID.getCharacteristic(t),o=s.characteristicsBeingNotified[e],o=o&&o[t];void 0===o?nslog("Unexpected characteristic value notification for device "+e+" and characteristic "+t):(nslog("<-- char val notification",t,i),o.forEach(function(e){var t=c.str64todv(i);e.value=t,e.dispatchEvent(new a("characteristicvaluechanged",e))}))},enableBluetooth:function(){navigator.bluetooth=e},BluetoothRemoteGATTCharacteristic:n.BluetoothRemoteGATTCharacteristic,BluetoothRemoteGATTServer:n.BluetoothRemoteGATTServer,BluetoothRemoteGATTService:n.BluetoothRemoteGATTService,BluetoothEvent:a},n.native=s,window._LINK_UI_SDK=window._LINK_UI_SDK||{},window._LINK_UI_SDK.os="ios",window._LINK_UI_SDK.os_version="n/a",window._LINK_UI_SDK.sdk_version="n/a",window._LINK_UI_SDK.bluetooth_state="unknown",window._LINK_UI_SDK._setBluetoothState=async function(e){window._LINK_UI_SDK.bluetooth_state=e},window._LINK_UI_SDK.dismiss=async function(e){return s.sendMessage("dismiss",{data:{errMsg:e}})},window._LINK_UI_SDK.fakeoauth=async function(e,t,i,o=!1){return s.sendMessage("saveFakeOAuthConfig",{data:{autorizeURLToFollow:e,redirectURLToIntercept:t,enodeReturnURL:i,isRedirectURLToInterceptRegex:o}})},window.BluetoothRemoteGATTCharacteristic=n.BluetoothRemoteGATTCharacteristic,window.BluetoothRemoteGATTServer=n.BluetoothRemoteGATTServer,window.BluetoothRemoteGATTService=n.BluetoothRemoteGATTService,window.BluetoothDevice=n.BluetoothDevice,window.iOSNativeAPI=s,window.receiveDeviceDisconnectEvent=s.receiveDeviceDisconnectEvent,window.receiveMessageResponse=s.receiveMessageResponse,window.receiveCharacteristicValueNotification=s.receiveCharacteristicValueNotification,s.enableBluetooth(),window.open=function(e){window.location=e},nslog("WBPolyfill complete")}}();