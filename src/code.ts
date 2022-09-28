figma.showUI(__html__, { width: 520, height: 620 });
figma.ui.onmessage = async (msg) => {
    if (msg.type === "add-to-document") {
        const cardPadding = 16;
        let imageWidth = 512;
        let imgArr = msg.frameImg;
        // Create Image
        let img = figma.createImage(imgArr);
        let rect = figma.createRectangle();
        rect.cornerRadius = cardPadding / 4;
        rect.resize(imageWidth, imageWidth);
        rect.fills = [{
                imageHash: img.hash,
                scaleMode: "FILL",
                scalingFactor: 0.5,
                type: "IMAGE",
            }];
        figma.currentPage.appendChild(rect)
    }
    else if (msg.type === "store-to-gallery") {
        const imgIndex = getNumOfImages();
        const card = createCardFromImageAndPrompt(msg.frameImg, msg.diffusionPrompt, imgIndex)
    }
    else if (msg.type === "load-gallery") {
        const imgFrameList: FrameNode[] = getListOfImageFrames();
        const listToSend = []
        for(let i = 0; i < imgFrameList.length; i++){
            const figRect: RectangleNode = imgFrameList[i].children[0] as RectangleNode;
            const figImgHash = figRect.fills[0].imageHash; 
            const figImg = figma.getImageByHash(figImgHash);
            const bytes = await figImg.getBytesAsync();
            listToSend.push(bytes);
        }
        const dispatchMsg = {
            imgList: listToSend,
            type: "client-load-gallery"
        }
        figma.ui.postMessage(dispatchMsg);
    }
    // figma.closePlugin();
};

function getNumOfImages(){
    const listOfFrames = getImagePageNode().children
    return listOfFrames.length
}

function getListOfImageFrames(): FrameNode[]{
    const pageChildren = getImagePageNode().children
    if(pageChildren[0].type === 'FRAME'){
       return pageChildren as FrameNode[]; 
    }
}

async function createCardFromImageAndPrompt(img, imgPrompt, index){
    const imageWidth= 512;
    const imageHeight= 512;
    const cardPadding = 16;

    // Create Metacard Frame
    let cardFrame = figma.createFrame();
    cardFrame.cornerRadius = cardPadding/2;
    cardFrame.resize(imageWidth + cardPadding*2,imageWidth);
    cardFrame.layoutMode = "VERTICAL";
    cardFrame.paddingLeft = cardFrame.paddingRight = cardFrame.paddingTop = cardFrame.paddingBottom = cardPadding;
    cardFrame.itemSpacing = cardPadding/2;
    cardFrame.primaryAxisSizingMode = "AUTO";
    cardFrame.counterAxisSizingMode = "FIXED";
    cardFrame.fills = [{type : "SOLID", color: { r: 1, g: 1, b: 1 }}];
    cardFrame.strokes = [{type : "SOLID", color: { r: 0, g: 0, b: 0 }}];
    cardFrame.strokeWeight = 2;

    // Create Image
    let figImg = figma.createImage(img);
    let rect = figma.createRectangle();
    rect.cornerRadius = cardPadding/4;
    rect.resize(imageWidth, imageHeight);
		rect.fills = [{
			imageHash: figImg.hash,
			scaleMode: "FILL",
			scalingFactor: 0.5,
			type: "IMAGE",
		}];
    cardFrame.appendChild(rect);

    // Create title
    let metaTitle = figma.createText();
    let boldFont = {family: "Inter", style: "Bold"};
    await figma.loadFontAsync(boldFont);
    metaTitle.fontName = boldFont;
    cardFrame.appendChild(metaTitle);
    metaTitle.characters = imgPrompt;
    metaTitle.textAutoResize = "HEIGHT";
    metaTitle.layoutAlign = "STRETCH";
    metaTitle.textDecoration = "UNDERLINE";
    
    cardFrame.x = index%3 * cardFrame.width;
    cardFrame.y = ((index/3)|0) * cardFrame.height;

    getImagePageNode().appendChild(cardFrame);
}

function getImagePageNode(): PageNode{
    const pages = figma.root.children
    const galleryName = "Danger Zone - Diffusion Design Assts"
    for(var i = 0; i < pages.length; i++){
        if(pages[i].name == galleryName){
            return pages[i]
        }
    }
}