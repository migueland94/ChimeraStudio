document.addEventListener('DOMContentLoaded', () => {
    // --- API CONFIGURATION ---
    // --- API CONFIGURATION (LocalStorage) ---
    let apiKeys = {
        imgbbApiKey: '',
        imghippoApiKey: '',
        cloudinaryCloudName: '',
        cloudinaryUploadPreset: '',
        pollinationsPublicApiKey: '',
        pollinationsSecretApiKey: '',
        geminiApiKey: ''
    };

    const loadApiKeys = () => {
        const storedKeys = localStorage.getItem('chimeraApiKeys');
        if (storedKeys) {
            try {
                apiKeys = { ...apiKeys, ...JSON.parse(storedKeys) };
            } catch (e) {
                console.error('Error parsing stored API keys', e);
            }
        }
        // Fill inputs if they exist
        const keyMap = {
            'key-imgbb': 'imgbbApiKey',
            'key-imghippo': 'imghippoApiKey',
            'key-cloudinary-name': 'cloudinaryCloudName',
            'key-cloudinary-preset': 'cloudinaryUploadPreset',
            'key-pollinations-public': 'pollinationsPublicApiKey',
            'key-pollinations-secret': 'pollinationsSecretApiKey',
            'key-gemini': 'geminiApiKey'
        };
        Object.keys(keyMap).forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = apiKeys[keyMap[id]] || '';
        });
    };

    const saveApiKeys = () => {
        const keyMap = {
            'key-imgbb': 'imgbbApiKey',
            'key-imghippo': 'imghippoApiKey',
            'key-cloudinary-name': 'cloudinaryCloudName',
            'key-cloudinary-preset': 'cloudinaryUploadPreset',
            'key-pollinations-public': 'pollinationsPublicApiKey',
            'key-pollinations-secret': 'pollinationsSecretApiKey',
            'key-gemini': 'geminiApiKey'
        };
        Object.keys(keyMap).forEach(id => {
            const el = document.getElementById(id);
            if (el) apiKeys[keyMap[id]] = el.value.trim();
        });
        localStorage.setItem('chimeraApiKeys', JSON.stringify(apiKeys));
        alert('API Keys saved successfully.');
    };

    document.getElementById('save-keys-btn')?.addEventListener('click', saveApiKeys);
    loadApiKeys();

    const imgbbApiKey = () => apiKeys.imgbbApiKey;
    const pollinationsPublicApiKey = () => apiKeys.pollinationsPublicApiKey;
    const pollinationsSecretApiKey = () => apiKeys.pollinationsSecretApiKey;

    const fetchPrompt = (type) => {
        const prompts = {
            character: characterPrompt,
            scene: scenePrompt,
            style: stylePrompt,
            custom: customPrompt
        };
        return prompts[type] || '';
    };

    let storedAnalysis = {}; // e.g., {'@I1Per': 'response...'}
    let modelCapabilities = {}; // Stores model capabilities (e.g., input_modalities)

    // --- IMAGE HOST CONFIGURATION ---
    const imageHostSelect = document.getElementById('image-host-select');
    const llmModelSelect = document.getElementById('llm-model-select');
    const llmProviderSelect = document.getElementById('llm-provider-select');
    const geminiModelSelect = document.getElementById('gemini-model-select');
    const pollinationsSettingsGroup = document.getElementById('pollinations-settings');
    const geminiModelGroup = document.getElementById('gemini-model-group');

    const getSelectedImageHost = () => {
        return imageHostSelect.value;
    };

    const getImgHippoApiKey = () => apiKeys.imghippoApiKey || '';
    const getCloudinaryCloudName = () => apiKeys.cloudinaryCloudName || '';
    const getCloudinaryUploadPreset = () => apiKeys.cloudinaryUploadPreset || '';

    // Load saved API Key
    const loadHostSettings = () => {
        const savedHost = localStorage.getItem('imageHost');
        if (savedHost) {
            imageHostSelect.value = savedHost;
        }
    };

    // Save host selection
    imageHostSelect.addEventListener('change', () => {
        localStorage.setItem('imageHost', imageHostSelect.value);
    });

    loadHostSettings();

    // --- LLM MODEL CONFIGURATION ---
    const getSelectedLLMProvider = () => llmProviderSelect.value;
    const getSelectedLLMModel = () => {
        return llmModelSelect.value;
    };

    const getSelectedGeminiModel = () => geminiModelSelect.value;
    const getGeminiApiKey = () => apiKeys.geminiApiKey || '';

    llmModelSelect.addEventListener('change', () => {
        localStorage.setItem('llmModel', llmModelSelect.value);
    });

    llmProviderSelect.addEventListener('change', () => {
        localStorage.setItem('llmProvider', llmProviderSelect.value);
        const isGoogle = llmProviderSelect.value === 'google';
        pollinationsSettingsGroup.classList.toggle('hidden', isGoogle);
        geminiModelGroup.classList.toggle('hidden', !isGoogle);
    });

    geminiModelSelect.addEventListener('change', () => {
        localStorage.setItem('geminiModel', geminiModelSelect.value);
    });

    const loadLLMModelSettings = () => {
        const savedModel = localStorage.getItem('llmModel');
        if (savedModel) {
            llmModelSelect.value = savedModel;
        }
        const savedProvider = localStorage.getItem('llmProvider');
        if (savedProvider) {
            llmProviderSelect.value = savedProvider;
        }
        const isGoogle = (savedProvider || llmProviderSelect.value) === 'google';
        pollinationsSettingsGroup.classList.toggle('hidden', isGoogle);
        geminiModelGroup.classList.toggle('hidden', !isGoogle);
        const savedGeminiModel = localStorage.getItem('geminiModel');
        if (savedGeminiModel) geminiModelSelect.value = savedGeminiModel;
    };

    loadLLMModelSettings();

    // --- TAB HANDLING (14, 15) ---
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            button.classList.add('active');
            document.getElementById(button.dataset.tab).classList.add('active');
        });
    });

    // --- IMAGE UPLOAD LOGIC (1, 2, 3) ---
    const displayImage = (imageUrl, uploader, imageHost = null, deleteUrl = null) => {
        uploader.innerHTML = ''; // Clears content (spinner, '+', etc.)
        uploader.classList.add('has-image'); // Marks as having an image
        uploader.dataset.imageActive = 'true'; // Default: image is active

        const img = document.createElement('img');
        img.src = imageUrl;
        img.classList.add('image-preview');
        img.dataset.imageHost = imageHost || getSelectedImageHost();
        img.dataset.deleteUrl = deleteUrl || imageUrl;
        img.draggable = true;
        // Show this image in viewer/canvas on click
        img.addEventListener('click', () => {
            if (typeof setBaseImage === 'function') {
                setBaseImage(imageUrl);
            }
        });
        img.addEventListener('dragstart', (e) => { e.dataTransfer.setData('text/plain', imageUrl); });

        // --- START CHANGE 4: Create and add toggle ---
        const activationToggle = document.createElement('div');
        activationToggle.className = 'activation-toggle active';
        activationToggle.title = 'Toggle for generation';
        activationToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isActive = uploader.dataset.imageActive === 'true';
            uploader.dataset.imageActive = !isActive;
            activationToggle.classList.toggle('active', !isActive);
        });
        // --- END CHANGE 4 ---

        const removeBtn = document.createElement('button');
        removeBtn.innerHTML = '&times;';
        removeBtn.classList.add('remove-btn');
        removeBtn.onclick = async (e) => {
            e.stopPropagation();
            const host = img.dataset.imageHost;
            // 1) Cloudinary: DO NOT delete remotely from UI
            if (host === 'cloudinary') {
                resetUploader(uploader);
                return;
            }
            // 2) ImgHippo: delete only if it's the last instance in left panel
            if (host === 'imghippo') {
                const count = countOccurrencesInLeftPanel(imageUrl);
                if (count > 1) {
                    // Duplicates exist: only remove from local container
                    resetUploader(uploader);
                    return;
                }
                await handleImageRemoval('imghippo', img.dataset.deleteUrl);
                resetUploader(uploader);
                return;
            }
            // 3) Others (ImgBB): only reset UI (auto-expires)
            resetUploader(uploader);
        };

        uploader.appendChild(img);
        uploader.appendChild(activationToggle);
        uploader.appendChild(removeBtn);
        appendUiElementsToUploader(uploader);
    };

    // Counts occurrences of an image URL in left panel containers
    const countOccurrencesInLeftPanel = (imageUrl) => {
        if (!leftPanel) return 0;
        const imgs = leftPanel.querySelectorAll('img.image-preview');
        let count = 0;
        imgs.forEach(i => { if (i.src === imageUrl) count++; });
        return count;
    };

    const resetUploader = (uploader) => {
        const uploaderId = uploader.id.split('-')[1];

        // Clear stored analysis for this uploader
        Object.keys(storedAnalysis).forEach(key => {
            if (key.startsWith(`@I${uploaderId}`)) {
                delete storedAnalysis[key];
            }
        });
        console.log(`Analysis for image ${uploaderId} deleted.`);

        uploader.className = 'image-uploader'; // Resets classes like 'has-image'
        delete uploader.dataset.imageActive; // Clears activation state
        uploader.innerHTML = `
            <button class="remove-uploader-btn" title="Delete container">&times;</button>
            <label for="file-input-${uploaderId}" class="uploader-label">+</label>
            <input type="file" id="file-input-${uploaderId}" class="file-input" accept="image/*">
            <div class="hover-actions">
                <button class="action-btn" title="Character" data-type="character">P</button>
                <button class="action-btn" title="Scene" data-type="scene">E</button>
                <button class="action-btn" title="Style" data-type="style">S</button>
                <button class="action-btn" title="Custom" data-type="custom">C</button>
            </div>
            <div class="custom-input-container">
                <input type="text" class="custom-text-input" placeholder="Prompt..." spellcheck="false">
            </div>
        `;
    };

    const appendUiElementsToUploader = (uploader) => {
        const uploaderId = uploader.id.split('-')[1];
        if (!uploader.querySelector('.remove-uploader-btn')) {
            uploader.insertAdjacentHTML('afterbegin', `<button class="remove-uploader-btn" title="Delete container">&times;</button>`);
        }
        if (!uploader.querySelector('.hover-actions')) {
            uploader.insertAdjacentHTML('beforeend', `
                <div class="hover-actions">
                    <button class="action-btn" title="Character" data-type="character">P</button>
                    <button class="action-btn" title="Scene" data-type="scene">E</button>
                    <button class="action-btn" title="Style" data-type="style">S</button>
                    <button class="action-btn" title="Custom" data-type="custom">C</button>
                </div>
                <div class="custom-input-container">
                    <input type="text" class="custom-text-input" placeholder="Prompt..." spellcheck="false">
                </div>
            `);
        }
    }

    const uploadToImgBB = async (file, uploader) => {
        const key = imgbbApiKey();
        if (!key) {
            alert('Please add your ImgBB API Key in the Keys tab.');
            resetUploader(uploader);
            return;
        }
        uploader.innerHTML = '<div class="loading-spinner"></div>';
        const formData = new FormData();
        formData.append('image', file);
        try {
            const response = await fetch(`https://api.imgbb.com/1/upload?expiration=900&key=${key}`, { method: 'POST', body: formData });
            if (!response.ok) throw new Error('Upload error.');
            const result = await response.json();
            if (result.success) {
                displayImage(result.data.url, uploader, 'imgbb');
            } else {
                throw new Error(result.error.message);
            }
        } catch (error) {
            console.error('Error uploading to ImgBB:', error);
            uploader.innerHTML = '<span class="error-text">Error!</span>';
            setTimeout(() => resetUploader(uploader), 2000);
        }
    };

    const uploadToImgHippo = async (file, uploader) => {
        const apiKey = getImgHippoApiKey();
        if (!apiKey) {
            alert('Please add your ImgHippo API Key in the Keys tab.');
            resetUploader(uploader);
            return;
        }
        uploader.innerHTML = '<div class="loading-spinner"></div>';
        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', apiKey);
        try {
            const response = await fetch('https://api.imghippo.com/v1/upload', { method: 'POST', body: formData });
            if (!response.ok) throw new Error('Upload error.');
            const result = await response.json();
            if (result.success && result.data) {
                displayImage(result.data.view_url, uploader, 'imghippo', result.data.view_url);
            } else {
                throw new Error(result.message || 'Unknown error');
            }
        } catch (error) {
            console.error('Error uploading to ImgHippo:', error);
            uploader.innerHTML = '<span class="error-text">Error!</span>';
            setTimeout(() => resetUploader(uploader), 2000);
        }
    };

    const uploadToCloudinary = async (file, uploader) => {
        const cloudName = getCloudinaryCloudName();
        const uploadPreset = getCloudinaryUploadPreset();
        if (!cloudName || !uploadPreset) {
            alert('Configure Cloudinary in the Keys tab: Cloud Name and Upload Preset (unsigned) are required.');
            resetUploader(uploader);
            return;
        }
        uploader.innerHTML = '<div class="loading-spinner"></div>';
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);
        try {
            const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                method: 'POST',
                body: formData
            });
            if (!response.ok) throw new Error('Error uploading to Cloudinary.');
            const result = await response.json();
            const imageUrl = result.secure_url || result.url;
            const deleteToken = result.delete_token || '';
            if (imageUrl) {
                displayImage(imageUrl, uploader, 'cloudinary', deleteToken || imageUrl);
            } else {
                throw new Error('Cloudinary response missing image URL.');
            }
        } catch (error) {
            console.error('Error uploading to Cloudinary:', error);
            uploader.innerHTML = '<span class="error-text">Error!</span>';
            setTimeout(() => resetUploader(uploader), 2000);
        }
    };

    const uploadImage = async (file, uploader) => {
        const selectedHost = getSelectedImageHost();
        if (selectedHost === 'imgbb') {
            await uploadToImgBB(file, uploader);
        } else if (selectedHost === 'imghippo') {
            await uploadToImgHippo(file, uploader);
        } else if (selectedHost === 'cloudinary') {
            await uploadToCloudinary(file, uploader);
        }
    };

    const handleImageRemoval = async (imageHost, deleteUrl) => {
        if (imageHost === 'imghippo') {
            const apiKey = getImgHippoApiKey();
            if (apiKey) {
                try {

                    const body = new URLSearchParams();
                    body.append('api_key', apiKey);
                    body.append('url', deleteUrl);

                    console.log('Intentando eliminar de ImgHippo:', deleteUrl);

                    // try DELETE first
                    let response = await fetch('https://api.imghippo.com/v1/delete', {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        body: body
                    });

                    // If DELETE fails with 404, try POST
                    if (response.status === 404) {
                        console.log('DELETE failed, trying POST...');
                        response = await fetch('https://api.imghippo.com/v1/delete', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded'
                            },
                            body: body
                        });
                    }

                    if (!response.ok) {
                        const errorText = await response.text();
                        console.warn('Error deleting from ImgHippo, status:', response.status, 'response:', errorText);
                        alert(`Could not delete from ImgHippo. Status: ${response.status}`);
                        return;
                    }

                    const result = await response.json();
                    if (result.status === 200) {
                        console.log('✓ Image deleted from ImgHippo:', result.deleted_url);
                    } else {
                        console.log('Response from deletion:', result);
                    }
                } catch (error) {
                    console.error('Error deleting from ImgHippo:', error);
                }
            }
        } else if (imageHost === 'cloudinary') {
            const cloudName = getCloudinaryCloudName();
            const deleteToken = deleteUrl; // we use dataset.deleteUrl to store the token
            if (!cloudName || !deleteToken) {
                alert('Falta Cloud Name o delete_token de Cloudinary. Si pasaron >10 minutos, el token expira.');
                return;
            }
            try {
                const body = new URLSearchParams();
                body.append('token', deleteToken);
                const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/delete_by_token`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body
                });
                if (!response.ok) {
                    const txt = await response.text();
                    console.warn('Error deleting in Cloudinary:', response.status, txt);
                    alert(`Could not delete in Cloudinary. Status: ${response.status}`);
                    return;
                }
                const res = await response.json().catch(() => ({}));
                console.log('✓ Image deleted from Cloudinary (delete_by_token):', res);
            } catch (error) {
                console.error('Error deleting from Cloudinary:', error);
            }
        }
        // ImgBB is automatically deleted after 15 minutes, no action required
    };

    const uploadBlobToImgBB = async (blob) => {
        const key = imgbbApiKey();
        if (!key) {
            console.error('Cannot upload blob, ImgBB API Key missing.');
            return null;
        }
        const formData = new FormData();
        formData.append('image', blob);
        try {
            const response = await fetch(`https://api.imgbb.com/1/upload?expiration=900&key=${key}`, { method: 'POST', body: formData });
            if (!response.ok) throw new Error('Error uploading blob.');
            const result = await response.json();
            return result.success ? { url: result.data.url, host: 'imgbb' } : null;
        } catch (error) {
            console.error('Error uploading blob to ImgBB:', error);
            return null;
        }
    };

    const uploadBlobToImgHippo = async (blob) => {
        const apiKey = getImgHippoApiKey();
        if (!apiKey) {
            console.error('Cannot upload blob, ImgHippo API Key missing.');
            return null;
        }

        try {
            // Create a URL for the blob
            const blobUrl = URL.createObjectURL(blob);

            // Load the image
            const img = new Image();
            img.crossOrigin = 'anonymous';

            // Wait for image to load
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = () => reject(new Error('Error loading image'));
                img.src = blobUrl;
            });

            // Create a temporary canvas
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;

            // Draw image on canvas
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            // Convert canvas to JPG blob
            const jpegBlob = await new Promise(resolve => {
                canvas.toBlob(blob => resolve(blob), 'image/jpeg', 0.92); // 0.92 is quality (0-1)
            });

            // Revoke blob URL
            URL.revokeObjectURL(blobUrl);

            // Create FormData for upload
            const formData = new FormData();
            formData.append('file', jpegBlob, 'image.jpg');
            formData.append('api_key', apiKey);

            // Upload image to ImgHippo
            const response = await fetch('https://api.imghippo.com/v1/upload', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Error uploading image to ImgHippo');

            const result = await response.json();
            return result.success ? {
                url: result.data.view_url,
                host: 'imghippo',
                deleteUrl: result.data.view_url
            } : null;

        } catch (error) {
            console.error('Error processing or uploading image to ImgHippo:', error);
            return null;
        }
    };

    const uploadBlobToCloudinary = async (blob) => {
        const cloudName = getCloudinaryCloudName();
        const uploadPreset = getCloudinaryUploadPreset();
        if (!cloudName || !uploadPreset) {
            console.error('Cannot upload blob, Cloud Name or Upload Preset missing.');
            return null;
        }
        try {
            const formData = new FormData();
            formData.append('file', blob, 'generated-image.jpg');
            formData.append('upload_preset', uploadPreset);
            const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                method: 'POST',
                body: formData
            });
            if (!response.ok) throw new Error('Error uploading blob to Cloudinary');
            const result = await response.json();
            const imageUrl = result.secure_url || result.url;
            const deleteToken = result.delete_token || '';
            return imageUrl ? { url: imageUrl, host: 'cloudinary', deleteUrl: deleteToken || imageUrl } : null;
        } catch (error) {
            console.error('Error uploading blob to Cloudinary:', error);
            return null;
        }
    };

    const uploadBlob = async (blob) => {
        const selectedHost = getSelectedImageHost();
        if (selectedHost === 'imgbb') {
            return await uploadBlobToImgBB(blob);
        } else if (selectedHost === 'imghippo') {
            return await uploadBlobToImgHippo(blob);
        } else if (selectedHost === 'cloudinary') {
            return await uploadBlobToCloudinary(blob);
        }
        return null;
    };

    // --- LEFT PANEL DYNAMIC LOGIC ---
    const leftPanel = document.getElementById('left-panel');
    const addUploaderBtn = document.getElementById('add-uploader-btn');
    let uploaderCounter = 4; // We start at 4 because we already have 3 in the HTML

    const updateUploaderLayout = () => {
        const uploaderCount = leftPanel.querySelectorAll('.image-uploader').length;
        leftPanel.className = 'left-panel'; // Resetea clases
        if (uploaderCount >= 4) {
            leftPanel.classList.add(`uploader-count-${uploaderCount}`);
        }
        addUploaderBtn.style.display = uploaderCount >= 6 ? 'none' : 'block';
    };

    const createUploader = (id) => {
        const uploader = document.createElement('div');
        uploader.id = `uploader-${id}`;
        uploader.className = 'image-uploader';
        // icons
        uploader.innerHTML = `
            <button class="remove-uploader-btn" title="Remove container">&times;</button>
            <label for="file-input-${id}" class="uploader-label">+</label>
            <input type="file" id="file-input-${id}" class="file-input" accept="image/*">
            <div class="hover-actions">
                <button class="action-btn" title="Character" data-type="character">P</button>
                <button class="action-btn" title="Scene" data-type="scene">E</button>
                <button class="action-btn" title="Style" data-type="style">S</button>
                <button class="action-btn" title="Custom" data-type="custom">C</button>
            </div>
            <div class="custom-input-container">
                <input type="text" class="custom-text-input" placeholder="Prompt..." spellcheck="false">
            </div>
        `;
        return uploader;
    };

    addUploaderBtn.addEventListener('click', () => {
        if (leftPanel.querySelectorAll('.image-uploader').length < 6) {
            const newUploader = createUploader(uploaderCounter++);
            leftPanel.insertBefore(newUploader, addUploaderBtn);
            updateUploaderLayout();
        }
    });

    // --- IMAGE ANALYSIS LOGIC (LLM) ---
    const analyzeImage = async (uploader, analysisType) => {
        const img = uploader.querySelector('img.image-preview');
        if (!img) {
            alert('Please upload an image in this container first.');
            return;
        }

        const uploaderId = uploader.id.split('-')[1];
        const imageUrl = img.src;
        const llmModel = getSelectedLLMModel();
        let promptText = fetchPrompt(analysisType);

        // Handle custom prompt
        if (analysisType === 'custom') {
            const customUserInput = uploader.querySelector('.custom-text-input').value;
            if (!customUserInput) {
                alert('Please enter details for custom analysis.');
                const customBtn = uploader.querySelector('.action-btn[data-type="custom"]');
                if (customBtn) customBtn.classList.remove('active');
                const customInputContainer = uploader.querySelector('.custom-input-container');
                if (customInputContainer) customInputContainer.classList.remove('visible');
                return;
            }
            promptText = promptText.replace('[User_selection]', customUserInput);
        }

        const actionBtn = uploader.querySelector(`.action-btn[data-type="${analysisType}"]`);
        actionBtn.classList.add('loading');

        try {
            let analysisResult = '';
            const provider = getSelectedLLMProvider();
            if (provider === 'google') {
                // --- Google Gemini ---
                const geminiApiKey = getGeminiApiKey();
                if (!geminiApiKey) {
                    alert('Please add your Google Gemini API Key in the Keys tab.');
                    actionBtn.classList.remove('loading');
                    return;
                }
                const modelCode = getSelectedGeminiModel();
                // Convert image to Base64 using canvas to avoid CORS issues with fetch
                const base64DataUri = await imageToDataURL(imageUrl, 'image/jpeg');
                const base64Data = base64DataUri.split(',')[1];

                const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelCode}:generateContent?key=${geminiApiKey}`;
                const body = {
                    contents: [
                        {
                            parts: [
                                { inline_data: { mime_type: 'image/jpeg', data: base64Data } },
                                { text: promptText }
                            ]
                        }
                    ]
                };

                const response = await fetch(geminiEndpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Gemini API Error: ${response.status} - ${errorText}`);
                }
                const data = await response.json();
                // Extract text from first candidate
                analysisResult = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
                if (!analysisResult) {
                    // some formats return 'text' elsewhere
                    analysisResult = data?.candidates?.[0]?.content?.parts?.find(p => p.text)?.text || '';
                }
                if (!analysisResult) {
                    throw new Error('Gemini response with no usable text.');
                }
            } else {
                // --- Pollinations (Existing API) ---
                const selectedKeyType = document.querySelector('input[name="apiKeyType"]:checked').value;
                const activeApiKey = selectedKeyType === 'public' ? pollinationsPublicApiKey() : pollinationsSecretApiKey();

                if (activeApiKey.startsWith('plln_') === false || activeApiKey === '') {
                    alert(`Please add your Pollinations ${selectedKeyType} API Key in the Keys tab.`);
                    actionBtn.classList.remove('loading');
                    return;
                }

                const response = await fetch('https://enter.pollinations.ai/api/generate/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${activeApiKey}`
                    },
                    body: JSON.stringify({
                        model: llmModel,
                        image: imageUrl,
                        messages: [
                            {
                                role: 'user',
                                content: promptText
                            }
                        ]
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`API Error: ${response.status} - ${errorData.error.message}`);
                }

                const result = await response.json();
                analysisResult = result.choices[0].message.content;
            }

            const typeCode = {
                character: 'Per',
                scene: 'Esc',
                style: 'Est',
                custom: 'Prz'
            }[analysisType];

            const analysisId = `@I${uploaderId}${typeCode}`;
            storedAnalysis[analysisId] = analysisResult;

            actionBtn.classList.add('active'); // Mark as completed

            console.log(`Analysis saved as ${analysisId}:`, analysisResult);

        } catch (error) {
            console.error('Error during image analysis:', error);
            alert(`Analysis error: ${error.message}`);
        } finally {
            actionBtn.classList.remove('loading');
        }
    };

    // Converts a remote image to DataURL using canvas (avoids taint if host exposes CORS)
    const imageToDataURL = async (imageUrl, mimeType = 'image/jpeg') => {
        return new Promise((resolve, reject) => {
            const imgEl = new Image();
            imgEl.crossOrigin = 'anonymous';
            imgEl.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    canvas.width = imgEl.width;
                    canvas.height = imgEl.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(imgEl, 0, 0);
                    const dataUrl = canvas.toDataURL(mimeType, 0.92);
                    resolve(dataUrl);
                } catch (e) { reject(e); }
            };
            imgEl.onerror = () => reject(new Error('Could not load image to convert to Base64'));
            imgEl.src = imageUrl;
        });
    };


    leftPanel.addEventListener('click', (e) => {
        const uploader = e.target.closest('.image-uploader');
        if (!uploader) return;

        // --- Handle Container Selection ---
        if (e.target.classList.contains('image-uploader')) {
            leftPanel.querySelectorAll('.image-uploader.selected').forEach(el => el.classList.remove('selected'));
            uploader.classList.add('selected');
        }

        // --- Handle Container Deletion ---
        if (e.target.classList.contains('remove-uploader-btn')) {
            if (leftPanel.querySelectorAll('.image-uploader').length > 1) {
                uploader.remove();
                updateUploaderLayout();
            } else {
                alert('one container is required');
            }
        }

        // --- Handle Action Buttons ---
        const actionBtn = e.target.closest('.action-btn');
        if (actionBtn) {
            e.stopPropagation();
            const type = actionBtn.dataset.type;

            // If the button is already active, do nothing (or decide if it should be re-analyzed)
            if (actionBtn.classList.contains('active')) return;

            // Show input for 'custom' without calling the API yet
            if (type === 'custom') {
                const customInputContainer = uploader.querySelector('.custom-input-container');
                customInputContainer.classList.add('visible');
                customInputContainer.querySelector('input').focus();
                return; // Exit to let the user write
            }

            // For other buttons, call the API directly
            analyzeImage(uploader, type);
        }
    });

    // --- Handle Custom Input (blur and Enter) ---
    leftPanel.addEventListener('focusout', (e) => {
        if (e.target.classList.contains('custom-text-input')) {
            const uploader = e.target.closest('.image-uploader');
            const container = e.target.closest('.custom-input-container');
            uploader.dataset.customPrompt = e.target.value;
            container.classList.remove('visible');
        }
    });

    leftPanel.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.target.classList.contains('custom-text-input')) {
            const uploader = e.target.closest('.image-uploader');
            if (uploader) {
                analyzeImage(uploader, 'custom');
                e.target.blur(); // Optional: hide the input after sending
            }
        }
    });

    // --- Drag & Drop and File Upload Events ---
    leftPanel.addEventListener('change', (e) => {
        if (e.target.classList.contains('file-input')) {
            const uploader = e.target.closest('.image-uploader');
            if (e.target.files && e.target.files[0]) {
                uploadImage(e.target.files[0], uploader);
            }
        }
    });

    leftPanel.addEventListener('dragover', (e) => {
        e.preventDefault();
        const uploader = e.target.closest('.image-uploader');
        if (uploader) uploader.classList.add('drag-over');
    });

    leftPanel.addEventListener('dragleave', (e) => {
        const uploader = e.target.closest('.image-uploader');
        if (uploader) uploader.classList.remove('drag-over');
    });

    leftPanel.addEventListener('drop', (e) => {
        e.preventDefault();
        const uploader = e.target.closest('.image-uploader');
        if (uploader) {
            uploader.classList.remove('drag-over');
            const imageUrl = e.dataTransfer.getData('text/plain');
            if (imageUrl) displayImage(imageUrl, uploader);
        }
    });

    updateUploaderLayout(); // Initial call to set the correct state of the '+' button


    // --- DYNAMIC CONTAINER LOGIC (5) AND ITS CHILDREN ---
    const dynamicContainer = document.getElementById('dynamic-container');
    const mainViewer = document.getElementById('main-viewer');
    const createDynamicImageItem = (imageUrl, imageHost = null, deleteUrl = null) => {
        const item = document.createElement('div');
        item.classList.add('dynamic-item');
        item.draggable = true;
        const img = document.createElement('img');
        img.src = imageUrl;
        img.dataset.imageHost = imageHost || getSelectedImageHost();
        img.dataset.deleteUrl = deleteUrl || imageUrl;
        item.appendChild(img);
        const removeBtn = document.createElement('button');
        removeBtn.innerHTML = '&times;';
        removeBtn.classList.add('remove-btn');
        removeBtn.onclick = async (e) => {
            e.stopPropagation();
            const host = img.dataset.imageHost;
            if (host === 'cloudinary') {
                // Do not delete from Cloudinary from the UI
                item.remove();
                return;
            }
            if (host === 'imghippo') {
                await handleImageRemoval('imghippo', img.dataset.deleteUrl);
                item.remove();
                return;
            }
            // ImgBB or other: only remove from the container
            item.remove();
        };
        item.appendChild(removeBtn);
        const downloadBtn = document.createElement('a');
        downloadBtn.innerHTML = '&#x2193;';
        downloadBtn.classList.add('download-btn');
        downloadBtn.href = imageUrl;
        downloadBtn.download = `generated-image-${Date.now()}.png`;
        downloadBtn.onclick = (e) => e.stopPropagation();
        item.appendChild(downloadBtn);
        item.addEventListener('click', () => { if (typeof setBaseImage === 'function') setBaseImage(imageUrl); });
        item.addEventListener('dragstart', (e) => { e.dataTransfer.setData('text/plain', imageUrl); });
        dynamicContainer.appendChild(item);
    };

    // --- EDITOR CANVAS (Viewer converted to canvas) ---
    const editorContainer = document.getElementById('editor-container');
    const editorCanvasEl = document.getElementById('editor-canvas');
    const editorToolbar = document.getElementById('editor-toolbar');
    const toolPencilBtn = document.getElementById('tool-pencil');
    const toolEraserBtn = document.getElementById('tool-eraser');
    const brushColorInput = document.getElementById('brush-color');
    const brushSizeInput = document.getElementById('brush-size');
    const saveCanvasBtn = document.getElementById('save-canvas-btn');
    const overlayToolbar = document.getElementById('overlay-toolbar');
    const overlayFlipHBtn = document.getElementById('overlay-flip-h');
    const overlayFlipVBtn = document.getElementById('overlay-flip-v');
    const overlayRemoveBgBtn = document.getElementById('overlay-remove-bg');
    const overlayDeleteBtn = document.getElementById('overlay-delete');

    let fabricCanvas = null;
    const ensureCanvasSize = () => {
        if (!editorContainer || !editorCanvasEl) return;
        const rect = editorContainer.getBoundingClientRect();
        editorCanvasEl.width = rect.width;
        editorCanvasEl.height = rect.height;
        if (fabricCanvas) {
            fabricCanvas.setWidth(rect.width);
            fabricCanvas.setHeight(rect.height);
            fabricCanvas.requestRenderAll();
        }
    };

    const initEditorCanvas = () => {
        if (!editorCanvasEl) return;
        ensureCanvasSize();
        fabricCanvas = new fabric.Canvas('editor-canvas', {
            preserveObjectStacking: true,
            selection: true,
            stopContextMenu: true, // Disable right-click context menu
            fireRightClick: true,  // Enable right-click for custom handling
            fireMiddleClick: true, // Enable middle-click for panning
            selection: true,       // Enable selection
            selectionFullyContained: true, // Select objects only when fully contained in selection
            selectionKey: 'shiftKey', // Hold shift for multiple selection
            selectionBorderColor: '#007bff',
            selectionLineWidth: 2,
            selectionDashArray: [5, 5],
            selectionBackgroundColor: 'rgba(0, 123, 255, 0.1)'
        });

        // State for zoom/pan/eraser
        let isPanning = false;
        let lastPosX = 0;
        let lastPosY = 0;
        let eraserActive = false;
        let erasingMouseDown = false;
        const minZoom = 1;
        const maxZoom = 6;

        // Zoom with mouse wheel
        fabricCanvas.on('mouse:wheel', (opt) => {
            const delta = opt.e.deltaY;
            let zoom = fabricCanvas.getZoom();
            zoom *= Math.pow(0.999, delta);
            zoom = Math.max(minZoom, Math.min(maxZoom, zoom));
            const point = new fabric.Point(opt.e.offsetX, opt.e.offsetY);
            fabricCanvas.zoomToPoint(point, zoom);
            opt.e.preventDefault();
            opt.e.stopPropagation();
        });

        // Pan with mouse middle button
        fabricCanvas.on('mouse:down', (opt) => {
            if (opt.e.button === 1) {
                isPanning = true;
                lastPosX = opt.e.clientX;
                lastPosY = opt.e.clientY;
                fabricCanvas.setCursor('grab');
                return;
            }
            // If we are in eraser mode, start erasing
            if (eraserActive && opt.e.button === 0) {
                erasingMouseDown = true;
                eraseAtPointer(opt);
            }
            // If we are in drawing mode, do not interfere
            if (fabricCanvas.isDrawingMode) return;

            const evt = opt.e;
            if (opt.target) {
                fabricCanvas.setActiveObject(opt.target);
                fabricCanvas.requestRenderAll();
                evt.stopPropagation();
            } else {
                fabricCanvas.discardActiveObject();
                fabricCanvas.requestRenderAll();
            }
        });

        fabricCanvas.on('mouse:move', (opt) => {
            if (isPanning) {
                const e = opt.e;
                const vpt = fabricCanvas.viewportTransform;
                vpt[4] += e.clientX - lastPosX;
                vpt[5] += e.clientY - lastPosY;
                fabricCanvas.requestRenderAll();
                lastPosX = e.clientX;
                lastPosY = e.clientY;
                // If there is a selected object, update the position of its toolbar
                // so it moves along with the canvas pan.
                if (fabricCanvas.getActiveObject()) {
                    updateOverlayToolbarPosition();
                }
                return;
            }
            if (eraserActive && erasingMouseDown) {
                eraseAtPointer(opt);
            }
        });

        fabricCanvas.on('mouse:up', () => {
            isPanning = false;
            erasingMouseDown = false;
            fabricCanvas.setCursor('default');
        });

        // Eraser function (fallback): removes strokes drawn under the pointer
        const eraseAtPointer = (opt) => {
            const pointer = fabricCanvas.getPointer(opt.e);
            const radius = Number(brushSizeInput?.value || 20);
            const toRemove = [];
            fabricCanvas.getObjects().forEach(obj => {
                if (obj.type === 'path') {
                    const bounds = obj.getBoundingRect(true);
                    const dx = Math.max(bounds.left - pointer.x, 0, pointer.x - (bounds.left + bounds.width));
                    const dy = Math.max(bounds.top - pointer.y, 0, pointer.y - (bounds.top + bounds.height));
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist <= radius) {
                        toRemove.push(obj);
                    }
                }
            });
            if (toRemove.length) {
                toRemove.forEach(o => fabricCanvas.remove(o));
                fabricCanvas.requestRenderAll();
            }
        };

        // Disable drawing mode by default
        fabricCanvas.isDrawingMode = false;

        // Enable selection by default
        fabricCanvas.selection = true;

        // Show/hide toolbar based on selection
        fabricCanvas.on('selection:created', (e) => {
            updateOverlayToolbarPosition();
            // Exit drawing mode when an object is selected
            if (fabricCanvas.isDrawingMode) {
                fabricCanvas.isDrawingMode = false;
                // Reset cursor
                fabricCanvas.defaultCursor = 'default';
            }
        });

        fabricCanvas.on('selection:updated', updateOverlayToolbarPosition);

        fabricCanvas.on('selection:cleared', () => {
            if (overlayToolbar) overlayToolbar.classList.add('hidden');
            // Revert to default cursor when no selection
            fabricCanvas.defaultCursor = 'default';
        });

        // Update toolbar position while the object is transforming
        fabricCanvas.on('object:moving', updateOverlayToolbarPosition);
        fabricCanvas.on('object:scaling', updateOverlayToolbarPosition);
        fabricCanvas.on('object:rotating', updateOverlayToolbarPosition);

        // Note: the handling of mouse:down/move/up already includes selection, erasing and panning

        // Allow drop of images as layers
        if (editorContainer) {
            editorContainer.addEventListener('dragover', (e) => { e.preventDefault(); });
            editorContainer.addEventListener('drop', (e) => {
                e.preventDefault();
                const url = e.dataTransfer.getData('text/plain');
                if (url) addOverlayImage(url);
            });
        }

        window.addEventListener('resize', ensureCanvasSize);
    };

    const setBaseImage = (imageUrl) => {
        if (!fabricCanvas) return;
        fabric.Image.fromURL(imageUrl, (img) => {
            const canvasW = fabricCanvas.getWidth();
            const canvasH = fabricCanvas.getHeight();

            // Scale the image to fit inside the canvas maintaining the aspect ratio
            const scale = Math.min(canvasW / img.width, canvasH / img.height);
            img.scale(scale);

            // Center the image in the canvas
            img.set({
                left: (canvasW - img.width * scale) / 2,
                top: (canvasH - img.height * scale) / 2
            });

            // Set the image as background
            fabricCanvas.setBackgroundImage(img, fabricCanvas.requestRenderAll.bind(fabricCanvas));

        }, { crossOrigin: 'anonymous' });
    };

    const addOverlayImage = (imageUrl) => {
        if (!fabricCanvas) return;
        fabric.Image.fromURL(imageUrl, (img) => {
            const canvasW = fabricCanvas.getWidth();
            const canvasH = fabricCanvas.getHeight();
            const scale = Math.min((canvasW * 0.8) / img.width, (canvasH * 0.8) / img.height, 1);

            // Center the image
            const left = (canvasW - img.width * scale) / 2;
            const top = (canvasH - img.height * scale) / 2;

            img.set({
                left: left,
                top: top,
                selectable: true,
                hasControls: true,
                cornerColor: '#007bff',
                cornerSize: 12,
                transparentCorners: false,
                borderColor: '#007bff',
                cornerStyle: 'circle',
                scaleX: scale,
                scaleY: scale,
                lockUniScaling: false,
                lockScalingFlip: true
            });

            // Make sure the image is selectable and on top
            img.setCoords();
            fabricCanvas.add(img);
            fabricCanvas.setActiveObject(img);
            fabricCanvas.bringToFront(img);
            fabricCanvas.requestRenderAll();
        }, { crossOrigin: 'anonymous' });
    };

    const updateOverlayToolbarPosition = () => {
        if (!overlayToolbar || !fabricCanvas) return;
        const obj = fabricCanvas.getActiveObject();
        if (!obj) { overlayToolbar.classList.add('hidden'); return; }
        const rect = obj.getBoundingRect();
        overlayToolbar.style.left = `${Math.max(8, rect.left)}px`;
        overlayToolbar.style.top = `${Math.max(8, rect.top - 40)}px`;
        overlayToolbar.classList.remove('hidden');
    };

    // Drawing tools
    const updateBrush = () => {
        if (!fabricCanvas) return;
        const size = Number(brushSizeInput?.value || 5);
        const color = brushColorInput?.value || '#ff0000';
        if (!fabricCanvas.freeDrawingBrush) {
            fabricCanvas.freeDrawingBrush = new fabric.PencilBrush(fabricCanvas);
        }
        fabricCanvas.freeDrawingBrush.width = size;
        fabricCanvas.freeDrawingBrush.color = color;
    };
    toolPencilBtn?.addEventListener('click', () => {
        if (!fabricCanvas) return;
        fabricCanvas.isDrawingMode = true;
        fabricCanvas.freeDrawingBrush = new fabric.PencilBrush(fabricCanvas);
        updateBrush();
    });
    toolEraserBtn?.addEventListener('click', () => {
        if (!fabricCanvas) return;
        // Try to use EraserBrush if it exists in the library; if not, use fallback
        if (fabric.EraserBrush) {
            fabricCanvas.isDrawingMode = true;
            fabricCanvas.freeDrawingBrush = new fabric.EraserBrush(fabricCanvas);
            fabricCanvas.freeDrawingBrush.width = Number(brushSizeInput?.value || 20);
        } else {
            // Fallback: mode eraser that erases strokes drawn
            eraserActive = true;
            fabricCanvas.isDrawingMode = false;
            fabricCanvas.selection = false;
            fabricCanvas.setCursor('crosshair');
        }
    });

    const resetZoomBtn = document.getElementById('reset-zoom-btn');
    resetZoomBtn?.addEventListener('click', () => {
        if (!fabricCanvas) return;
        fabricCanvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
        fabricCanvas.setZoom(1);
        fabricCanvas.requestRenderAll();
    });
    brushColorInput?.addEventListener('change', updateBrush);
    brushSizeInput?.addEventListener('input', updateBrush);

    // Actions on active layer
    overlayFlipHBtn?.addEventListener('click', () => {
        const obj = fabricCanvas?.getActiveObject();
        if (!obj) return;
        obj.set('flipX', !obj.flipX);
        fabricCanvas.requestRenderAll();
        updateOverlayToolbarPosition();
    });
    overlayFlipVBtn?.addEventListener('click', () => {
        const obj = fabricCanvas?.getActiveObject();
        if (!obj) return;
        obj.set('flipY', !obj.flipY);
        fabricCanvas.requestRenderAll();
        updateOverlayToolbarPosition();
    });
    overlayDeleteBtn?.addEventListener('click', () => {
        const obj = fabricCanvas?.getActiveObject();
        if (!obj) return;
        fabricCanvas.remove(obj);
        fabricCanvas.discardActiveObject();
        fabricCanvas.requestRenderAll();
        overlayToolbar?.classList.add('hidden');
    });

    // Global variable for the SelfieSegmentation instance, to avoid reloading it every time.
    let selfieSegmentation = null;

    const removeBackgroundFromActiveImage = async () => {
        const obj = fabricCanvas?.getActiveObject();
        if (!obj || obj.type !== 'image') return;

        // Show a loading indicator, as it may take a second the first time.
        overlayRemoveBgBtn.textContent = '...';
        overlayRemoveBgBtn.disabled = true;

        try {
            const imageElement = obj._element; // The original <img> element

            // Initialize the model if it's not already loaded
            if (!selfieSegmentation) {
                selfieSegmentation = new SelfieSegmentation({
                    locateFile: (file) => {
                        return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`;
                    }
                });
                selfieSegmentation.setOptions({ modelSelection: 1 }); // 0 for general, 1 for landscape (more accurate)
            }

            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = imageElement.naturalWidth || imageElement.width;
            tempCanvas.height = imageElement.naturalHeight || imageElement.height;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.drawImage(imageElement, 0, 0);

            // The magic of MediaPipe happens here
            selfieSegmentation.onResults((results) => {
                tempCtx.save();
                tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
                tempCtx.drawImage(results.segmentationMask, 0, 0, tempCanvas.width, tempCanvas.height);

                // Draw the original image only where the mask is not black
                tempCtx.globalCompositeOperation = 'source-in';
                tempCtx.drawImage(results.image, 0, 0, tempCanvas.width, tempCanvas.height);

                // Restore and create the new Fabric.js image
                tempCtx.restore();
                const outUrl = tempCanvas.toDataURL('image/png');
                fabric.Image.fromURL(outUrl, (newImg) => {
                    newImg.set({
                        left: obj.left, top: obj.top, angle: obj.angle,
                        scaleX: obj.scaleX, scaleY: obj.scaleY,
                        flipX: obj.flipX, flipY: obj.flipY
                    });
                    fabricCanvas.remove(obj);
                    fabricCanvas.add(newImg);
                    fabricCanvas.setActiveObject(newImg);
                    fabricCanvas.requestRenderAll();
                    updateOverlayToolbarPosition();
                }, { crossOrigin: 'anonymous' });

                // Reactivate the button
                overlayRemoveBgBtn.textContent = 'BG−';
                overlayRemoveBgBtn.disabled = false;
            });

            await selfieSegmentation.send({ image: imageElement });

        } catch (e) {
            console.error('Error al eliminar fondo con MediaPipe:', e);
            alert('No se pudo eliminar el fondo con el modelo de IA.');
            overlayRemoveBgBtn.textContent = 'BG−';
            overlayRemoveBgBtn.disabled = false;
        }
    };
    overlayRemoveBgBtn?.addEventListener('click', removeBackgroundFromActiveImage);

    // Save composition
    const dataURLToBlob = (dataURL) => {
        const parts = dataURL.split(','), mime = parts[0].match(/:(.*?);/)[1];
        const bstr = atob(parts[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) u8arr[n] = bstr.charCodeAt(n);
        return new Blob([u8arr], { type: mime });
    };

    saveCanvasBtn?.addEventListener('click', async () => {
        if (!fabricCanvas) return;

        // Deselect any object so that controls don't appear in the capture
        fabricCanvas.discardActiveObject();
        fabricCanvas.requestRenderAll();

        // Capture ignoring zoom/pan and at the actual resolution of the base image
        const bg = fabricCanvas.backgroundImage;
        if (!bg) {
            alert('not found a base image.');
            return;
        }

        const originalVpt = fabricCanvas.viewportTransform.slice();
        // Ignore zoom/pan temporarily
        fabricCanvas.setViewportTransform([1, 0, 0, 1, 0, 0]);

        const displayWidth = bg.width * (bg.scaleX || 1);
        const displayHeight = bg.height * (bg.scaleY || 1);
        const cropLeft = bg.left || 0;
        const cropTop = bg.top || 0;
        const multiplier = (bg.width || displayWidth) / displayWidth;

        const dataURL = fabricCanvas.toDataURL({
            format: 'png',
            quality: 0.92,
            left: cropLeft,
            top: cropTop,
            width: displayWidth,
            height: displayHeight,
            multiplier
        });

        // Restore zoom/pan
        fabricCanvas.setViewportTransform(originalVpt);

        const blob = dataURLToBlob(dataURL);
        if (!blob) {
            alert('not found a blob.');
            return;
        }

        saveCanvasBtn.textContent = 'Saving...';
        saveCanvasBtn.disabled = true;

        try {
            const uploadResult = await uploadBlob(blob);
            if (uploadResult && uploadResult.url) {
                createDynamicImageItem(uploadResult.url, uploadResult.host, uploadResult.deleteUrl || uploadResult.url);
            } else {
                throw new Error('not found a upload result.');
            }
        } catch (error) {
            console.error('error saving image:', error);
            alert('Error saving image: ' + error.message);
        } finally {
            saveCanvasBtn.textContent = 'Save';
            saveCanvasBtn.disabled = false;
        }
    });

    // Inicializar editor al cargar
    initEditorCanvas();

    // --- MODAL DE CONFIGURACIÓN (ELEMENTO 13) ---
    const settingsBtn = document.getElementById('settings-btn');
    const modal = document.getElementById('settings-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const modelSelect = document.getElementById('model-select');
    const apiKeyRadios = document.querySelectorAll('input[name="apiKeyType"]');
    const widthInput = document.getElementById('width-input');
    const heightInput = document.getElementById('height-input');
    const seedToggle = document.getElementById('seed-toggle');
    const seedInput = document.getElementById('seed-input');
    const negativePromptInput = document.getElementById('negative-prompt-input');
    const sizeInputsGeneric = document.getElementById('size-inputs-generic');
    const sizeSelectGpt = document.getElementById('size-select-gpt');
    const gptSizeSelect = document.getElementById('gpt-size-select');

    let allSettingsInputs = [modelSelect, widthInput, heightInput, seedToggle, seedInput, negativePromptInput, gptSizeSelect];
    apiKeyRadios.forEach(radio => allSettingsInputs.push(radio));

    const openModal = () => modal.classList.remove('hidden');
    const closeModal = () => modal.classList.add('hidden');

    const updateSizeInputs = () => {
        const selectedModel = modelSelect.value;
        const isGpt = selectedModel === 'gptimage';
        sizeInputsGeneric.classList.toggle('hidden', isGpt);
        sizeSelectGpt.classList.toggle('hidden', !isGpt);
    };

    settingsBtn.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    seedToggle.addEventListener('change', () => seedInput.classList.toggle('hidden', !seedToggle.checked));
    modelSelect.addEventListener('change', updateSizeInputs);

    // --- PERSISTENCE OF CONFIGURATION WITH LOCALSTORAGE ---
    const saveSettings = () => {
        const selectedKeyType = document.querySelector('input[name="apiKeyType"]:checked').value;
        const settings = {
            model: modelSelect.value,
            apiKeyType: selectedKeyType,
            width: widthInput.value,
            height: heightInput.value,
            useSeed: seedToggle.checked,
            seed: seedInput.value,
            negativePrompt: negativePromptInput.value,
            gptSize: gptSizeSelect.value
        };
        localStorage.setItem('generationSettings', JSON.stringify(settings));
    };

    const loadSettings = () => {
        const savedSettings = localStorage.getItem('generationSettings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            modelSelect.value = settings.model || 'flux';

            const keyType = settings.apiKeyType || 'public';
            document.querySelector(`input[name="apiKeyType"][value="${keyType}"]`).checked = true;

            widthInput.value = settings.width || '1024';
            heightInput.value = settings.height || '1024';
            seedToggle.checked = settings.useSeed || false;
            seedInput.value = settings.seed || '42';
            negativePromptInput.value = settings.negativePrompt || '';
            gptSizeSelect.value = settings.gptSize || '1024x1024';
            seedInput.classList.toggle('hidden', !seedToggle.checked);
            updateSizeInputs();
        }
    };

    allSettingsInputs.forEach(input => input.addEventListener('change', saveSettings));
    loadSettings();

    // --- LOAD DYNAMIC MODELS ---
    const fetchPollinationsModels = async () => {
        try {
            // 1. Text models (LLM)
            const llmSelect = document.getElementById('llm-model-select');

            // Fetch with timeout for not blocking indefinitely if it fails
            const fetchWithTimeout = (url, ms = 5000) => {
                const controller = new AbortController();
                const id = setTimeout(() => controller.abort(), ms);
                return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(id));
            };

            try {
                const textResponse = await fetchWithTimeout('https://enter.pollinations.ai/api/generate/v1/models');
                if (textResponse.ok) {
                    const textData = await textResponse.json();
                    const textModels = textData.data || [];

                    if (textModels.length > 0) {
                        llmSelect.innerHTML = '';
                        textModels.forEach(model => {
                            const option = document.createElement('option');
                            option.value = model.id;
                            option.textContent = model.id;
                            llmSelect.appendChild(option);
                        });

                        // Restore LLM selection
                        const savedLLMModel = localStorage.getItem('llmModel');
                        if (savedLLMModel && Array.from(llmSelect.options).some(opt => opt.value === savedLLMModel)) {
                            llmSelect.value = savedLLMModel;
                        }
                    }
                }
            } catch (e) {
                console.warn('Error loading text models:', e);
                llmSelect.innerHTML = '<option value="openai" selected>OpenAI (Fallback)</option>';
            }

            // 2. Image models
            const imageSelect = document.getElementById('model-select');

            try {
                const imageResponse = await fetchWithTimeout('https://enter.pollinations.ai/api/generate/image/models');
                if (imageResponse.ok) {
                    const imageData = await imageResponse.json();
                    const imageModels = Array.isArray(imageData) ? imageData : (imageData.data || []);

                    if (imageModels.length > 0) {
                        imageSelect.innerHTML = '';
                        modelCapabilities = {}; // reset capabilities
                        imageModels.forEach(model => {
                            const option = document.createElement('option');
                            option.value = model.name;
                            option.textContent = model.description || model.name;
                            imageSelect.appendChild(option);

                            // Save model capabilities
                            if (model.input_modalities) {
                                modelCapabilities[model.name] = {
                                    input_modalities: model.input_modalities
                                };
                            }
                        });

                        // Restore image model selection
                        loadSettings();
                        // Update size inputs dependent on model
                        if (typeof updateSizeInputs === 'function') updateSizeInputs();
                    }
                }
            } catch (e) {
                console.warn('Error loading image models:', e);
                imageSelect.innerHTML = '<option value="flux" selected>Flux (Fallback)</option>';
            }

        } catch (error) {
            console.error('General error in fetchPollinationsModels:', error);
        }
    };

    fetchPollinationsModels();

    // --- GENERATION LOGIC (ELEMENT 12) ---
    const generateBtn = document.getElementById('generate-btn');
    const textInput = document.getElementById('text-input');
    const mainPanel = document.querySelector('.main-panel');

    // --- AUTOCOMPLETION LOGIC ---
    const autocompleteContainer = document.createElement('div');
    autocompleteContainer.id = 'autocomplete-list';
    autocompleteContainer.classList.add('autocomplete-items');
    mainPanel.appendChild(autocompleteContainer);

    textInput.addEventListener('input', () => {
        const query = textInput.value;
        if (query.endsWith('@')) {
            const items = Object.keys(storedAnalysis);
            if (items.length > 0) {
                autocompleteContainer.innerHTML = items.map(item => `<div>${item}</div>`).join('');
                autocompleteContainer.style.display = 'block';
            } else {
                autocompleteContainer.style.display = 'none';
            }
        } else {
            autocompleteContainer.style.display = 'none';
        }
    });

    autocompleteContainer.addEventListener('click', (e) => {
        if (e.target.tagName === 'DIV') {
            const currentValue = textInput.value;
            const newValue = currentValue.slice(0, -1) + e.target.textContent + ' ';
            textInput.value = newValue;
            autocompleteContainer.style.display = 'none';
            textInput.focus();
        }
    });

    // Hide if clicked outside
    document.addEventListener('click', (e) => {
        if (e.target !== textInput) {
            autocompleteContainer.style.display = 'none';
        }
    });


    const replaceAnalysisCodes = (prompt) => {
        const regex = /@I\d+(Per|Esc|Est|Prz)/g;
        return prompt.replace(regex, (match) => {
            return storedAnalysis[match] || match;
        });
    };

    const generateImage = async () => {
        const selectedKeyType = document.querySelector('input[name="apiKeyType"]:checked').value;
        const activeApiKey = selectedKeyType === 'public' ? pollinationsPublicApiKey() : pollinationsSecretApiKey();

        if (activeApiKey.startsWith('plln_') === false || activeApiKey === '') {
            alert(`Please add your Pollinations ${selectedKeyType} API Key in the Keys tab.`);
            return;
        }

        let prompt = textInput.value.trim();
        prompt = replaceAnalysisCodes(prompt);
        if (!prompt) {
            alert('Please enter a prompt.');
            return;
        }

        generateBtn.classList.add('loading');
        generateBtn.disabled = true;

        try {
            const encodedPrompt = encodeURIComponent(prompt);
            const baseURL = `https://enter.pollinations.ai/api/generate/image/${encodedPrompt}`;
            const selectedModel = modelSelect.value;
            let width, height;

            if (selectedModel === 'gptimage') {
                [width, height] = gptSizeSelect.value.split('x');
            } else {
                [width, height] = [widthInput.value, heightInput.value];
            }

            const params = new URLSearchParams({ model: selectedModel, width, height, nologo: 'true', private: 'true' });

            if (seedToggle.checked && seedInput.value) {
                params.append('seed', seedInput.value);
            }
            if (negativePromptInput.value.trim()) {
                params.append('negative_prompt', negativePromptInput.value.trim());
            }

            // Check if model supports image input (dynamic or fallback)
            const capabilities = modelCapabilities[selectedModel];
            const supportsImageInput = (capabilities?.input_modalities?.includes('image')) ||
                ['seedream', 'kontext', 'nanobanana'].includes(selectedModel);

            if (supportsImageInput) {
                const imageURLs = [];
                // --- START CHANGE 4: Filter active images ---
                leftPanel.querySelectorAll('.image-uploader').forEach(u => {
                    const i = u.querySelector('img.image-preview');
                    // Only add image if it exists and container is active
                    if (i && u.dataset.imageActive === 'true') {
                        imageURLs.push(i.src);
                    }
                });
                // --- END CHANGE 4 ---
                if (imageURLs.length > 0) {
                    params.append('image', imageURLs.join(','));
                }
            }

            const finalURL = `${baseURL}?${params.toString()}`;
            console.log(`Using key ${selectedKeyType}. Calling API:`, finalURL);

            const response = await fetch(finalURL, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${activeApiKey}` }
            });

            if (!response.ok) {
                const e = await response.text();
                throw new Error(`API Error: ${response.status} - ${e}`);
            }

            const imageBlob = await response.blob();
            const uploadResult = await uploadBlob(imageBlob);

            if (uploadResult && uploadResult.url) {
                createDynamicImageItem(uploadResult.url, uploadResult.host, uploadResult.deleteUrl || uploadResult.url);
            } else {
                console.warn("Failed to upload image. Using temporary blob URL.");
                createDynamicImageItem(URL.createObjectURL(imageBlob), 'local');
            }
        } catch (error) {
            console.error('Error generating image:', error);
            alert(`Generation error: ${error.message}`);
        } finally {
            generateBtn.classList.remove('loading');
            generateBtn.disabled = false;
        }
    };

    generateBtn.addEventListener('click', generateImage);
});