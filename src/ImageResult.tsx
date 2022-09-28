import * as React from "react";
import "./ui.css"
import {_base64ToUint8Array} from "./txt2img";

interface IImageResultProps{
    imgValue?: string;
    prompt?: string;
}

interface IImageResultState{
}

class ImageResult extends React.Component<IImageResultProps, IImageResultState>{
    render() {
        const addToDocument = (imgValue) => {
            let frameImg = _base64ToUint8Array(imgValue)
            parent.postMessage(
            { pluginMessage: { type: "add-to-document", frameImg } },
            "*"
            );
        }

        const saveToClipboard = () => {
            const textArea = document.createElement("textarea");
            textArea.value = this.props.prompt;
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
            } catch (err) {
                console.error('Unable to copy to clipboard', err);
            }
            document.body.removeChild(textArea);
        }

        if(this.props.imgValue.substring(0,5) == 'https'){
        return (
            <img className='imgResults' onClick={() => saveToClipboard()} src={this.props.imgValue}/>
        );

        }else{
            return (
                <img className='imgResults' onClick={() => addToDocument(this.props.imgValue)} src={`data:image/png;base64,${this.props.imgValue}`}/>
            );
        }
    }
}
export default ImageResult