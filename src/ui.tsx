import * as React from "react";
import axios, {AxiosError} from 'axios'
import * as ReactDom from 'react-dom/client';
import "./ui.css";
import "../dist/output.css"
import ImageResult from "./ImageResult";
import Gallery from "./Gallery";
import {bingus, _base64ToUint8Array, _arrayBufferToBase64} from "./txt2img";
import Examples from "./Examples";
import Navbar from "./Navbar"
import { Stage, Layer, Line, Image, Rect} from 'react-konva';
import {PaperAirplaneIcon, BookmarkIcon, PencilIcon, XCircleIcon} from '@heroicons/react/24/solid'

declare function require(path: string): any;
        // https://imgur.com/a/prROJGh

interface IAppProps{

}

interface IAppState{
    currentTab: string,
    imgCand: string, 
    imgMask: string,
    galleryImageList: {img: string, prompt: string}[],
    imageWindowState: string,
    galleryState: string,
    currentPrompt: string,
    lexicaResults: {img: string, prompt: string}[],
    lexicaQuery: string,
    lines: any[],
    konvaImage: any,
    editMode: boolean
}



class App extends React.Component<IAppProps, IAppState>{
  private isDrawing: boolean;
  private stageRef: any;
  constructor(props){
      super(props);
      this.isDrawing = false;
      this.stageRef = React.createRef();
      this.state = {
        currentTab: 'Workspace',
        imgCand: '', 
        imgMask: '',
        galleryImageList: [],
        imageWindowState: 'waitingForPrompt',
        // imageWindowState: 'imgLoaded',
        galleryState: 'notReady',
        currentPrompt: '',
        lexicaResults: [],
        lexicaQuery: '',
        lines: [],
        konvaImage: '',
        editMode: false
      };


      this.onCreate = this.onCreate.bind(this);
      this.onStore = this.onStore.bind(this);
      this.renderGallery = this.renderGallery.bind(this);
      this.updateImageStore = this.updateImageStore.bind(this);
  }

  updateImageStore = (img64: string) => {
      const img = new window.Image();
      img.crossOrigin = "Anonymous";
      img.src = "data:image/png;base64,".concat(img64);
      this.setState({...this.state, konvaImage: img, imgCand: img64, imageWindowState:"imgLoaded"});
      console.log("updating final image store state");
      console.log(img64);
  }
  onCreate = () => {
    let diffusionPrompt = this.state.currentPrompt;
    this.setState({...this.state, imgCand: null, imageWindowState:"showLoader"});
    bingus(diffusionPrompt).then(this.updateImageStore);
  };

  onStore = () => {
      let diffusionPrompt = this.state.currentPrompt;
      let frameImg = _base64ToUint8Array(this.state.imgCand)
      parent.postMessage(
        { pluginMessage: { type: "store-to-gallery", frameImg, diffusionPrompt} },
        "*"
      );
  };
  
  renderGallery = () => {
      parent.postMessage(
        { pluginMessage: { type: "load-gallery"} },
        "*"
      );
  }

  componentWillMount(): void {
      console.log("This is facetune");
      const img = new window.Image();
      img.crossOrigin = "Anonymous";
      console.log("data:image/png;base64,".concat(this.state.imgCand));
      img.src = "https://images.unsplash.com/photo-1531804055935-76f44d7c3621?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=334&q=80";
      this.setState({...this.state, konvaImage: img});
  }

  viewName = (vName: string):void => {
    if(vName=="Gallery"){
      this.renderGallery();
    }else if(vName == "Facetune"){
    }
    this.setState({...this.state, currentTab:vName});
  }


  pushLexicaResults = (exampleLexicaResults: {img: string, prompt: string}[], search_query: string):void => {
    this.setState({...this.state, lexicaResults: exampleLexicaResults, lexicaQuery: search_query});
  }

  updatePromptInput = (event) => {
    this.setState({...this.state, currentPrompt: event.target.value});
  }

  handleMouseDown = (e:any) => {
    this.isDrawing = true;
    const pos = e.target.getStage().getPointerPosition();
    this.setState({...this.state, lines: [...this.state.lines, { points: [pos.x, pos.y] }]});
    console.log("MOUSE DOWN");
};

  handleMouseMove = (e:any) => {
      // no drawing - skipping
      if (!this.isDrawing) {
        return;
      }
      const stage = e.target.getStage();
      const point = stage.getPointerPosition();

      // To draw line
      let lastLine: any = this.state.lines[this.state.lines.length - 1];
      
      if(lastLine) {
          // add point
          lastLine.points = lastLine.points.concat([point.x, point.y]);
              
          // replace last
          this.state.lines.splice(this.state.lines.length - 1, 1, lastLine);
          this.setState({...this.state, lines: this.state.lines.concat()});
      }
  };

  handleMouseUp = () => {
    this.isDrawing = false;
    console.log("MOUSE UP");
  };

  onEdit = () => {
    this.setState({...this.state, editMode: true, imgMask: '', lines: []});
  }

  getEditor = () => {
    return(
    <div className= "drawing-area">
        <Stage
            width={400}
            height={400}
            ref = {this.stageRef}
            onMouseDown={this.handleMouseDown}
            onMousemove={this.handleMouseMove}
            onMouseup={this.handleMouseUp}
            className="canvas-stage"
        >
            <Layer> 
              <Rect
                x={0}
                y={0}
                width={400}
                height= {400}
                fill={"black"}>
              </Rect>
            </Layer>
            <Layer> 
              <Image image={this.state.konvaImage}/> 
            </Layer>
            <Layer>
                {this.state.lines.map((line:any, i:number) => (
                    <Line
                    key={i}
                    points={line.points}
                    stroke="white"
                    strokeWidth={25}
                    tension={0.5}
                    lineCap="round"
                    globalCompositeOperation={
                        line.tool === 'eraser' ? 'destination-out' : 'source-over'
                    }
                    />
                ))}
            </Layer>
        </Stage>
    </div>)
    }

  exportMask = () => {
     let tmp = this.stageRef.current.children;
     this.stageRef.current.children = [tmp[0], tmp[2]];
     let mask = this.stageRef.current.toDataURL({
        mimeType: 'image/jpg',
        width: 512,
        height: 512,
        quality: 1,
        pixelRadio: 1,
        });
     console.log(tmp);
     this.stageRef.current.children = tmp;
     return mask.slice(22);;
  }

  updateEditedImage = () => {
    console.log("updating with new masks")
    let diffusionPrompt = this.state.currentPrompt;
    let mask = this.exportMask();
    this.setState({...this.state, imgCand: null, imageWindowState:"showLoader", editMode: false});
    bingus(diffusionPrompt, this.state.imgCand, mask).then(this.updateImageStore);
  }

  startNew = () =>{
    this.setState({...this.state, imgCand: '', imgMask: null, editMode: false, lines: [], konvaImage:''});
  }

  getToolBar = () => {
    if(this.state.currentTab=="Workspace" && this.state.editMode == false && this.state.imgCand == ''){
      return (<div className="toolbar">
          <button className="bg-amber-500 hover:bg-amber-700 text-white font-bold py-2 px-4 border border-amber-700 rounded" onClick={this.onCreate}> 
            <PaperAirplaneIcon className="inline-block h-6 w-6"> </PaperAirplaneIcon>
             <p className="inline-block">Generate</p> 
          </button>
          <button className="bg-amber-500 hover:bg-amber-700 text-white font-bold py-2 px-4 border border-amber-700 rounded" onClick={this.onStore}>
            <BookmarkIcon className="inline-block h-6 w-6"> </BookmarkIcon>
             <p className="inline-block">Store</p> 
          </button>
        </div>)
    }
    else if(this.state.currentTab=="Workspace" && this.state.editMode == false){
      return (<div className="toolbar">
          <button className="bg-amber-500 hover:bg-amber-700 text-white font-bold py-2 px-4 border border-amber-700 rounded" onClick={this.onCreate}> 
            <PaperAirplaneIcon className="inline-block h-6 w-6"> </PaperAirplaneIcon>
             <p className="inline-block">Generate</p> 
          </button>
          <button className="bg-amber-500 hover:bg-amber-700 text-white font-bold py-2 px-4 border border-amber-700 rounded" onClick={this.onStore}>
            <BookmarkIcon className="inline-block h-6 w-6"> </BookmarkIcon>
             <p className="inline-block">Store</p> 
          </button>
          <button className="bg-amber-500 hover:bg-amber-700 text-white font-bold py-2 px-4 border border-amber-700 rounded" onClick={this.onEdit}>
            <PencilIcon className="inline-block h-6 w-6"> </PencilIcon>
             <p className="inline-block">Edit</p> 
          </button>
        </div>)
    }
    else if(this.state.currentTab=="Workspace"){
      return (<div className="toolbar">
          <button className="bg-amber-500 hover:bg-amber-700 text-white font-bold py-2 px-4 border border-amber-700 rounded" onClick={this.startNew}> 
            <XCircleIcon className="inline-block h-6 w-6"> </XCircleIcon>
             <p className="inline-block">Cancel</p> 
          </button>
          <button className="bg-amber-500 hover:bg-amber-700 text-white font-bold py-2 px-4 border border-amber-700 rounded" onClick={this.updateEditedImage}> 
            <PaperAirplaneIcon className="inline-block h-6 w-6"> </PaperAirplaneIcon>
             <p className="inline-block">Generate</p> 
          </button>
        </div>)
    }
  }


  /*
  Wed: This render function needs to be refactored someone more sober

  Thur: This Workspace tab was made more idempotent by sober person

  Fri: img2img is broken on other branch and if I don't finish refactor 
  to make the api calls idempotent first, I'm going back to Wed Ilyas
  */
  render(){
      window.onmessage = async (event) => {

        if(event.data.pluginMessage){
          let msg = event.data.pluginMessage;
          let baseImgList: {img: string, prompt: string}[] = [];
          if(msg.type === "client-load-gallery"){
            for(let i = 0; i < msg.imgList.length; i++){
              baseImgList.push({img: _arrayBufferToBase64(msg.imgList[i]), prompt: "hiii"});
            }
            this.setState({...this.state, galleryImageList: baseImgList, galleryState: 'ready'});
          }
        }
      }
      return (
        <main className="h-screen overscroll-contain">
            <div className="sticky top-0">
              <Navbar setStateOfParent={this.viewName}/>
            </div>
            <section className="overflow-y-auto">
              {this.state.currentTab=="Workspace"?
              (<div>
                {(() => {
                if (this.state.imgCand && (this.state.imageWindowState == 'imgLoaded')) {
                  return (
                    <div>
                      <textarea className="prompt bg-gray-300 rounded-lg" onChange={this.updatePromptInput} value={this.state.currentPrompt} placeholder="Enter your prompt here" />
                      {this.state.editMode?this.getEditor():<ImageResult imgValue = {this.state.imgCand}/>}
                      {this.getToolBar()}
                    </div>
                  )
                } else if(this.state.imageWindowState == 'showLoader') {
                  return (
                    <img className="" src="https://i.imgur.com/Vtt6bOG.gif" alt="this slowpoke moves"  width="450" />
                  )
                } else{
                  return (
                    <div className="prompt-box">
                      <textarea className="prompt-empty bg-gray-300 rounded-lg" value={this.state.currentPrompt} onChange={this.updatePromptInput} placeholder="Enter your prompt here" />
                      {this.getToolBar()}
                    </div>
                  )
                }
              })()}
              </div>): ''}
              {this.state.currentTab=="Gallery"?
              (<div>
                {this.state.galleryState == 'ready' ? 
                  <Gallery children="" list_of_images_with_prompts= {this.state.galleryImageList}/>: 
                  <img className="imgResults" src="https://i.imgur.com/Vtt6bOG.gif" alt="this slowpoke moves"  width="13 rem" />}
              </div>): ''}
              {this.state.currentTab=="Examples"?
              (<div>
                <Examples setParentExamplesState={this.pushLexicaResults}></Examples>
              </div>): ''}
            </section>
          <footer className="fixed bottom-0 left-0 z-20 p-4 w-full border-t shadow md:flex md:items-center md:justify-between md:p-6 bg-stone-600 border-stone-600">
            <h5 className = "text-white font-bold"> Powered by Stable Diffusion </h5>
          </footer>
        </main>
      );
    }
}

const containter = document.getElementById('react-page');
const root = ReactDom.createRoot(containter);
root.render(<App />);