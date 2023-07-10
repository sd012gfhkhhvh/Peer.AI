import React, { useEffect } from "react";
import '../assets/popup.css'
import '../assets/button.css'
import Chat from "./chat";
import Asistant from "./asistant";
import { useState } from "react";
import TopSection from "./top";
import useSpeechToText from 'react-hook-speech-to-text';
import Wave from 'react-wavify'
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import TextToSpeech from "./texToSpeech";
import { Configuration, OpenAIApi } from 'openai'



const Popup = () => {
    const [text, setText] = useState("");
    const [apiResponse, setApiResponse] = useState('');
    const [detectMode, setDetectMode] = useState(false);


    const {
        results,
        isRecording,
        startSpeechToText,
        stopSpeechToText,
    } = useSpeechToText({
        continuous: true,
        useLegacyResults: false,
        timeout: 150000,
    });
    //page refresh 


    let lengthoFResults = results.length
    let modeActivation, modeActivationAcualData
    // console.log(results);
    function refreshPage() {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            const tabId = tabs[0].id;
            console.log(tabId);
            console.log(tabId);
            if (lengthoFResults > 0) {
                const data = {
                    message: "messageFromPopup",
                    payload: results,
                    action: "refresh",
                    tabId: tabId,
                    url: tabs[0].url
                };
                chrome.runtime.sendMessage(data);

            }
        })
    }

    useEffect(() => {
        if (results[lengthoFResults - 1] != undefined) {
            modeActivation = results[lengthoFResults - 1].transcript.replaceAll(/[- )(.,;]/g, '').toLowerCase();
            modeActivationAcualData = results[lengthoFResults - 1].transcript
            console.log(results);
            console.log(modeActivation);
            console.log(modeActivationAcualData);
            if (modeActivation.includes("activatechatmode")) {
                setDetectMode(true)
                console.log(detectMode);
            }
            else if (modeActivation.includes("deactivatechatmode")) {
                setDetectMode(false)
                refreshPage();
                console.log(detectMode);
            }
            else {
                if (!detectMode) {
                    console.log(detectMode);
                    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                        const tabId = tabs[0].id;
                        console.log(tabId);
                        if (lengthoFResults > 0) {
                            const data = {
                                message: "messageFromPopup",
                                payload: results,
                                tabId: tabId,
                                url: tabs[0].url
                            };
                            chrome.runtime.sendMessage(data);

                        }
                    })
                    //---------------------------------------------Sohams Workspace-----------------------

                    // to content.js  ---------------- soham 
                    // async function collectLink() {
                    //     tabsQuary = await chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                    //         var activeTab = tabs[0];
                    //         chrome.tabs.sendMessage(activeTab.id, { action: "fromPopup" }, (response) => {
                    //             chrome.tabs.executeScript(activeTab.id, { file: 'content.js' }, function () {
                    //                 if (chrome.runtime.lastError) {
                    //                     console.error('Failed to execute content script:', chrome.runtime.lastError);
                    //                     return;
                    //                 }
                    //                 console.log(activeTab);
                    //                 // chrome.runtime.sendMessage({greeting: "fromPopup"});
                    //             })
                    //         })
                    //     })

                    // }
                    // // ----------------------
                    // collectLink();
                    //-------------------------------------------------------------------------------------

                }
                else {
                    console.log(modeActivation);
                    if (modeActivation.includes("activatechatmode")) {
                        modeActivation = modeActivation.slice(16)
                    }
                    if (modeActivation.length > 0) {
                        // sendMessageToChatGPT(modeActivationAcualData)
                        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                            const tabId = tabs[0].id;
                            // console.log(tabId);
                            if (modeActivation.length > 0) {
                                const data = {
                                    message: "messageFromPopupchat",
                                    payload: results,
                                    tabId: tabId,
                                    prompt: modeActivation,
                                    url: tabs[0].url
                                };
                                chrome.runtime.sendMessage(data);
                                console.log(data);

                            }

                        })
                    }
                    else {
                        console.log("ask something");
                    }
                }
            }
        }

    }, [results])


    useEffect(() => {
        chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
            if (message) {
                // Handle the received message
                // console.log(message.prompt);
                const recieivedText = message.prompt
                // console.log(recieivedText);
                // console.log(typeof (recieivedText));
                setText(recieivedText);
            }
        });
    }, []);




    // console.log(text)
    return (
        <div className="parentContainer">
            <button onClick={isRecording ? stopSpeechToText : startSpeechToText}>
                {isRecording ? 'Stop Recording' : 'Start Recording'}
            </button>
            {results.map((result) => (
                <p style={{ color: "white" }} key={result.timestamp}>{result.transcript} , </p>
            ))}
            {text && <TextToSpeech text={text} />}
            <p>{apiResponse}</p>
        </div>
    )
};

export default Popup;