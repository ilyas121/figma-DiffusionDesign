In this household we use typescript, but badly. (I'm new, and was rushing, sowie)

The main app starts in ui.tsx, with the main css file being ui.css.
Things are in the middle of moving to tailwind.css

How to test plugin:
--------------------------------------
- Sign Up for [BananaML](https://www.banana.dev/)
- Deploy the 1-click model for stable diffusion 
- Copy model key for that into the first model in txt2img.tsx

Run in shell: (yes to the duplicates, I messed up, will fix later)

- npm install 
- npx tailwindcss -i ./src/input.css -o ./dist/output.css
- npm run build
- npx tailwindcss -i ./src/input.css -o ./dist/output.css
- npm run build

Open Figma & Make a new page 
Name that page -> "Danger Zone - Diffusion Design Assts" (without the quotes)
This is where all your image assets are going to be stored.

Open another new page for your workspace, this is where you can work 

To import the plugin go to 
Plugins > Developement > Import Plugin from Manifest

To run the plugin go to: 
Plugins > Development > DiffusionDesign

Tips: (recommended read)
- Things are buggy so try and stay in one window (Workspace/Examples etc) until you are done
- In the workspace and gallery window, click an image to add it to your page
- In the Examples window, click to copy the prompt used and then paste it to the workspace window
- DO NOT change tabs after you see the spinny cat, WAIT for the spinny cat to go home (i still have bugs to squash)

Enjoy.
------------------------------------------

To Do before public launch: 
- find religion and figure out what the ux flow should be between tabs
- Move compoenets into their own folder 
- kill ui.css and praise it's death
- Get rid of the nsfw comments in this repo
- Implement settings tab
- Implement a  stable diffusion nsfw setting
- Implement textual inversion