# ChimeraStudio

Chimera Studio is a simple sandbox for the Pollinations.ai API. This lightweight, client-side web application serves as an all-in-one testing ground for AI-powered **image and video generation**, computer vision model analysis, and editing. Run it directly in your browser to freely explore everything the API can do.

Since it runs entirely on the client side (HTML/JS/CSS), no backend installation is required. Your API keys and settings are stored locally in your browser, ensuring privacy and ease of use.

![ChimeraStudio canvas example](https://res.cloudinary.com/dwc2askno/image/upload/v1764660823/g7uenxfr9a6dt9pqrgwi.png)

## ✨ Key Features

### 🎨 Image Generation

*   **Multi-Model Support:** Access various models provided by Pollinations (e.g., Flux, Turbo, GPT-Image).
*   **Image-to-Image:** Use uploaded images as references for generation.
*   **Custom Settings:** Control aspect ratio (width/height), seed, and negative prompts.

### 🎬 Video Generation (New!)

*   **Multi-Model Support:** Access various text-to-video and image-to-video models from Pollinations (e.g., Veo, Seedance).
*   **Image-to-Video:** For models that support it, you can upload reference images to guide the video generation process.
*   **Custom Settings:** Fine-tune your videos with controls for aspect ratio (width/height), quality, and duration.
*   **In-Browser Gallery:** Generated videos are stored locally and displayed in a gallery for easy previewing, playback, and direct download.

### 👁️ Visual Analysis (Computer Vision)

*   **AI Scanning:** Analyze uploaded images to extract detailed prompts.
*   **Modes:**
    *   **P (Character):** Analyzes physical appearance and clothing.
    *   **E (Scene):** Describes environment, lighting, and architecture.
    *   **S (Style):** Identifies artistic style, medium, and technique.
    *   **C (Custom):** Ask specific questions about the image.
*   **Providers:** Supports Google Gemini (Llm) or Pollinations.

### 🖌️ Advanced Canvas Editor

*   **Fabric.js Integration:** A full-featured vector editor.
*   **Tools:** Pencil, Eraser, Zoom, and Pan.
*   **Layers:** Drag and drop generated images or external files as layers.
*   **AI Background Removal:** Built-in integration with MediaPipe to remove backgrounds directly in the browser.

### ☁️ Image Hosting Integration

*   Seamlessly upload reference images to temporary hosts to use them with the AI APIs.
*   **Supported Services:**
    *   ImgBB (Auto-delete in 15 mins).
    *   ImgHippo (Auto and Manual deletion support).
    *   Cloudinary (Unsigned presets, manual delete).

## 🚀 Getting Started

### Prerequisites

*   A modern web browser (Chrome, Firefox, Edge).

### Installation

1.  Clone the repository or download the ZIP file.
    ```bash
    git clone https://github.com/migueland94/ChimeraStudio
    ```
2.  Navigate to the folder.
3.  Open `index.html` in your browser.

That's it! The app is ready to use.

### 🔑 Configuration & API Keys

To unlock the full potential of Chimera Studio, you need to configure a few API keys in the "Keys" tab. All keys are stored in your browser's LocalStorage.

| Service        | Purpose                       | Required?                                                      |
| :------------- | :---------------------------- | :--------------------------------------------------------------|
| Pollinations   | Image & Video Generation      | **Yes**                                                        |
| Google Gemini  | Image Analysis (Vision)       | Optional (For llms)                                            |
| ImgBB          | Image Hosting                 | Optional (auto delete in 15 minutes, sometimes slow)           |
| ImgHippo       | Image Hosting                 | Optional (auto delete when you close an image, sometimes slow) |
| Cloudinary     | Image Hosting                 | Optional (Fastest, manual removal, good free plan)             |

*\*At least one image hosting service is required.*

## 📖 Usage Guide

### 1. The Image Workflow

*   **Left Panel:** Upload reference images in the "Main" tab.
*   **Analysis:** Click the small buttons (P, E, S, C) on an uploaded image to analyze it. The result is saved internally.
    *\*You need to select a model with vision input capability for analysis.*
*   **Prompting:** In the main text box, type your prompt. You can reference previous analyses by typing `@` to open the autocomplete menu.
*   **Generation:** Click "Generate". The result will appear in the Right Panel.
*   **Input Images:** You can activate or deactivate images in the left panel by clicking the blue icon that appears when you hover over them.

### 2. The Video Workflow (New!)

*   **Switch Tab:** Click on the "Video" tab.
*   **Prompting:** Enter a descriptive prompt for the video you want to create in the main text box.
*   **(Optional) Image Input:** If the selected video model supports image inputs, the left panel will be visible. You can upload one or more reference images here.
*   **Settings:** Click the `⚙️` icon to open the video settings modal and adjust parameters like the model, quality, dimensions, and duration.
*   **Generation:** Click "Generate". The process may take some time.
*   **Playback & Download:** Once finished, the video will appear in the main player, and a thumbnail will be added to the gallery on the right. You can click gallery items to play them or use the download button to save the MP4 file directly to your computer.

### 3. Editing on the Canvas

*   Click on any generated image in the Right Panel or an uploaded image in the Left Panel to send it to the Main Canvas.
*   Drag and drop any image onto the canvas to add it as an element.
*   Use the toolbar to draw, erase, or adjust layers.
*   **Background Removal:** Select an image on the canvas and click **BG−** to remove the background using AI.
*   **Save:** Click "Save changes" to render the composition back to the gallery.
    *\*This is important: the canvas is only visual until you save the image. After saving it, you can drag and drop it into a container on the left to use it as new input.*

## 🛠️ Built With

*   HTML5 / CSS3 / Vanilla JavaScript
*   [Fabric.js](http://fabricjs.com/) - For the interactive canvas editor.
*   [MediaPipe Selfie Segmentation](https://google.github.io/mediapipe/solutions/selfie_segmentation) - For background removal.
*   [Pollinations.ai](https://pollinations.ai/) - The core AI generation engine for images and video.

## 📄 License

MIT License

Copyright (c) 2025 migueland94

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
