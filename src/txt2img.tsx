import axios, {AxiosError} from 'axios'
const { v4: uuidv4 } = require('uuid')

let endpoint: string = 'https://api.banana.dev/'

const apiKey = "MAIN API KEY HERE" 
const txtModelKey = "FIRST MODEL KEY HERE"
const imgModelKey = "SECOND MODEL KEY HERE"
let modelInputs = {
    'prompt': '( cyberpunk 2 0 7 7, bladerunner 2 0 4 9 ), a complex thick bifurcated robotic cnc surgical arm cybernetic symbiosis hybrid mri 3 d printer machine making a bio chemical lab, knobs, natural light in room, drone camera lens orbs, global illumination, octane render, architectural, f 3 2'
}

export let bingus = async (diffusionPrompt: string, initImg: string='', maskImg: string='') =>{
    modelInputs['prompt'] = diffusionPrompt
    if(initImg!=''){
        modelInputs["init_image_base64"] = initImg
        modelInputs["mask_image_base64"] = maskImg
        modelInputs["steps"] = 50
        modelInputs["strength"] = 0.9
        console.log(modelInputs)
        var out = await run(apiKey, imgModelKey, modelInputs)
    }else{
        var out = await run(apiKey, txtModelKey, modelInputs)

    }
    var img64 = out["modelOutputs"][0]["image_base64"]
    return img64
}

export function _base64ToUint8Array(base64: string) {
    var binary_string = window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i);
    }
    return new Uint8Array(bytes.buffer);
  }

export function _arrayBufferToBase64( buffer ) {
    var binary = '';
    var bytes = new Uint8Array( buffer );
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return window.btoa( binary );
}

async function runMain(apiKey: string, modelKey: string, modelInputs: object = {}): Promise<any>{
    const startOut = await startAPI(apiKey, modelKey, modelInputs)
    if (startOut["finished"] == true){
        const res = {
            "id": startOut["id"],
            "message": startOut["message"],
            "created": startOut["created"],
            "apiVersion": startOut["apiVersion"],
            "modelOutputs": startOut["modelOutputs"]
        }
        return res
    }

    // else it's long running, so poll for result
    while (true) {
        const jsonOut = await checkAPI(apiKey, startOut["callID"])
        if (jsonOut !== undefined){
            if (jsonOut.message.toLowerCase() === "success"){
                return jsonOut
            }
        }
    }

}


async function run(apiKey: string, modelKey: string, modelInputs: object): Promise<object>{
    const out = await runMain(
      apiKey = apiKey, 
      modelKey = modelKey,
      modelInputs=modelInputs)
    return out
}

const startAPI = async (apiKey: string, modelKey: string, modelInputs: object): Promise<any> =>{
    const urlStart = endpoint.concat("start/v4/")
    const payload = {
        "id": uuidv4(),
        "created": Math.floor(new Date().getTime() / 1000),
        "apiKey" : apiKey,
        "modelKey" : modelKey,
        "modelInputs" : modelInputs,
        "startOnly": false,
    }

    const response = await axios.post(urlStart, payload).catch(err => {
        console.log("Here's the errors")
        console.log(response)
        if (err.response) {
            throw `server error: status code ${err.response.status}`
        } else if (err.request) {
            throw 'server error: endpoint busy or not available.'
        } else {
            throw "Misc axios error. Please email erik@banana.dev with above error"
        }
    })
    console.log("Here's the full response")
    console.log(response)
    const jsonOut = response.data
   
    if (jsonOut.message.toLowerCase().includes("error")){
        throw jsonOut.message
    }

    return jsonOut
}

const checkAPI = async (apiKey: string, callID: string): Promise<any> => {
    const urlCheck = endpoint.concat("check/v4/")

    const payload = {
        "id": uuidv4(),
        "created": Math.floor(new Date().getTime() / 1000),
        "longPoll": true,
        "apiKey" : apiKey,
         "callID" : callID
    }
    
    const response = await axios.post(urlCheck, payload).catch(err => {
        if (err.response) {
            throw `server error: status code ${err.response.status}`
        } else if (err.request) {
            throw 'server error: endpoint busy or not available.'
        } else {
            throw "Misc axios error. Please email erik@banana.dev with above error"
        }
    })
    const jsonOut = response.data
    
    if (jsonOut.message.toLowerCase().includes("error")){
        throw jsonOut.message
    }
    return jsonOut
}