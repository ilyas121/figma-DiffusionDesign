import * as React from "react";
import "./ui.css"
import "../dist/output.css"
import ImageResult from "./ImageResult";

interface IGalleryProps{
    children: string;
    list_of_images_with_prompts?: {img: string, prompt: string}[];
}

interface IGalleryState{
}

function getImageResult(imgObj, i){
    console.log("Here's the children");
    console.log("Children");
    return (<ImageResult imgValue = {imgObj.img} prompt={imgObj.prompt} key= {i}/>);
}

class Gallery extends React.Component<IGalleryProps, IGalleryState>{
    render() {
       return (
        <div className="Gallery overflow-scroll"> 
            {this.props.list_of_images_with_prompts.map((img, i) => getImageResult(img, i))}
        </div>
       )
    }
}
export default Gallery