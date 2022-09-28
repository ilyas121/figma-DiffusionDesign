import * as React from "react";
import axios from 'axios';
import "./ui.css"
import "../dist/output.css"
import Gallery from "./Gallery";
import { runInThisContext } from "vm";


//I need a better name than examples
interface IExamplesProps {
 setParentExamplesState : (imgList: {img: string, prompt: string}[], search_query: string) => void,
}

interface IExamplesState {
    list_of_images_with_prompts: {
        img: string, 
        prompt: string
    }[], 
    search_query: string
}

class Examples extends React.Component<IExamplesProps, IExamplesState>{
    constructor(props){
        super(props);
        this.state ={
            list_of_images_with_prompts: [], 
            search_query: '',
        }
        this.handleInput = this.handleInput.bind(this);
        this.getLexicaResults = this.getLexicaResults.bind(this);
        this.updateImageList = this.updateImageList.bind(this);
    }
    updateImageList(msg){
            let imgObjList = msg.data.images
            let imgPromptList = imgObjList.map(function(unit){
                return {img: unit.src, prompt: unit.prompt};
            });
            // console.log(imgList);
            this.setState({...this.state, list_of_images_with_prompts: imgPromptList});
            console.log("Calling state update");
            this.props.setParentExamplesState(imgPromptList, this.state.search_query);
    }

    getLexicaResults(){
        let searchInput = this.state.search_query;
        console.log(searchInput);
        if(searchInput != null && searchInput.length > 0){
            let filteredQuery = searchInput.replace(/ /g, '+');
            let url = "https://lexica.art/api/v1/search?q=".concat(filteredQuery);
            axios.get(url).then(this.updateImageList);
        }

    }
    
    handleInput(event){
        console.log("Handling input");
        console.log(event.target.value);
        this.setState({...this.state, search_query: event.target.value});
    }

    render() {

        document.addEventListener('keypress', function (e) {
            if (e.keyCode === 13 || e.which === 13) {
                e.preventDefault();
                return false;
            }
            
        });

        if(this.state.list_of_images_with_prompts.length > 0){
            return (
                <div>
                    <div className="searchBar">
                        <form className="w-full max-w-sm">
                            <div className="flex items-center border-b border-gray-500 py-2">
                                <input className="appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none" type="text" placeholder="Ex: cats playing poker" aria-label="Full name" onChange={this.handleInput}/>
                                <button className="flex-shrink-0 bg-gray-500 hover:bg-gray-700 border-gray-500 hover:border-gray-700 text-sm border-4 text-white py-1 px-2 rounded" type="button" onClick={this.getLexicaResults}>
                                Search
                                </button>
                            </div>
                        </form>
                        {/* <input onChange={this.handleInput} />
                        <button onClick={this.getLexicaResults}> Search </button> */}
                    </div>
                    <Gallery list_of_images_with_prompts={this.state.list_of_images_with_prompts}> </Gallery>
                </div>
            )
        }else{
            return (
                <div className="searchBar">
                    <form className="w-full max-w-sm">
                        <div className="flex items-center border-b border-gray-500 py-2">
                            <input className="appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none" type="text" placeholder="Ex: cats playing poker" aria-label="Full name" onChange={this.handleInput}/>
                            <button className="flex-shrink-0 bg-gray-500 hover:bg-gray-700 border-gray-500 hover:border-gray-700 text-sm border-4 text-white py-1 px-2 rounded" type="button" onClick={this.getLexicaResults}>
                            Search
                            </button>
                        </div>
                    </form>
                    {/* <input onChange={this.handleInput} />
                    <button onClick={this.getLexicaResults}> Search </button> */}
                </div>
            )
        }
    }
}
export default Examples