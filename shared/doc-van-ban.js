(function () {
    'use strict';

    const browserSpeech = window.speechSynthesis;
    const articleContainer = document.querySelector('.article-section .container');
    const titleElement = articleContainer && articleContainer.querySelector('h1');
    if (!articleContainer || !titleElement || document.getElementById('voice-reader')) return;

    const reader = document.createElement('div');
    reader.id = 'voice-reader';
    reader.className = 'voice-reader';
    reader.setAttribute('aria-label', 'Công cụ đọc văn bản bằng giọng Việt Nam');
    reader.innerHTML = `
        <button type="button" class="voice-reader__button" data-action="play">
            <i class="fa-solid fa-volume-high" aria-hidden="true"></i>
            <span>Đọc giọng Việt</span>
        </button>
        <button type="button" class="voice-reader__icon" data-action="stop" aria-label="Dừng đọc" title="Dừng đọc" disabled>
            <i class="fa-solid fa-stop" aria-hidden="true"></i>
        </button>
        <label class="voice-reader__speed">
            <span>Tốc độ</span>
            <select aria-label="Tốc độ đọc">
                <option value="0.8">0.8x</option>
                <option value="1" selected>1x</option>
                <option value="1.2">1.2x</option>
                <option value="1.5">1.5x</option>
            </select>
        </label>
        <span class="voice-reader__status" role="status" aria-live="polite"></span>`;
    titleElement.insertAdjacentElement('afterend', reader);

    const playButton = reader.querySelector('[data-action="play"]');
    const stopButton = reader.querySelector('[data-action="stop"]');
    const speedSelect = reader.querySelector('select');
    const statusElement = reader.querySelector('.voice-reader__status');
    const audio = new Audio();
    let state = 'idle';
    let chunks = [];
    let chunkIndex = 0;
    let sessionId = 0;
    let objectUrl = '';
    let requestController = null;

    function setState(nextState, message) {
        state = nextState;
        const icon = playButton.querySelector('i');
        const label = playButton.querySelector('span');
        const active = nextState === 'loading' || nextState === 'playing' || nextState === 'paused';
        stopButton.disabled = !active;
        reader.classList.toggle('is-playing', nextState === 'playing');

        if (nextState === 'loading') {
            icon.className = 'fa-solid fa-spinner fa-spin';
            label.textContent = 'Đang tạo giọng...';
            playButton.disabled = true;
        } else if (nextState === 'playing') {
            icon.className = 'fa-solid fa-pause';
            label.textContent = 'Tạm dừng';
            playButton.disabled = false;
        } else if (nextState === 'paused') {
            icon.className = 'fa-solid fa-play';
            label.textContent = 'Tiếp tục';
            playButton.disabled = false;
        } else {
            icon.className = 'fa-solid fa-volume-high';
            label.textContent = 'Đọc giọng Việt';
            playButton.disabled = false;
        }
        statusElement.textContent = message || '';
    }

    function getArticleText() {
        const content = articleContainer.querySelector(
            '[id^="dynamic-"][id$="-content"], .article-content, article'
        );
        if (!content) return '';
        const clone = content.cloneNode(true);
        clone.querySelectorAll('script, style, button, form, nav, [aria-hidden="true"]').forEach(node => node.remove());
        return `${titleElement.textContent}. ${clone.textContent}`.replace(/\s+/g, ' ').trim();
    }

    function splitText(text, maxLength = 3000) {
        const sentences = text.match(/[^.!?…]+[.!?…]?/g) || [text];
        const result = [];
        let current = '';
        sentences.forEach(sentence => {
            const value = sentence.trim();
            if (!value) return;
            if (current && current.length + value.length + 1 > maxLength) {
                result.push(current);
                current = '';
            }
            if (value.length <= maxLength) {
                current = current ? `${current} ${value}` : value;
            } else {
                for (let offset = 0; offset < value.length; offset += maxLength) {
                    if (current) {
                        result.push(current);
                        current = '';
                    }
                    result.push(value.slice(offset, offset + maxLength));
                }
            }
        });
        if (current) result.push(current);
        return result;
    }

    function releaseAudio() {
        audio.pause();
        audio.removeAttribute('src');
        if (objectUrl) URL.revokeObjectURL(objectUrl);
        objectUrl = '';
    }

    function stop(message = 'Đã dừng') {
        sessionId += 1;
        if (requestController) requestController.abort();
        requestController = null;
        releaseAudio();
        if (browserSpeech) browserSpeech.cancel();
        setState('idle', message);
    }

    function useBrowserFallback(text) {
        if (!browserSpeech || typeof window.SpeechSynthesisUtterance === 'undefined') {
            setState('idle', 'Không thể phát giọng đọc');
            return;
        }
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'vi-VN';
        utterance.rate = Number(speedSelect.value);
        utterance.onend = () => setState('idle', 'Đã đọc xong');
        utterance.onerror = () => setState('idle', 'Không thể phát giọng đọc');
        browserSpeech.speak(utterance);
        setState('playing', 'Azure lỗi, đang dùng giọng đọc của trình duyệt');
    }

    async function playChunk(activeSession) {
        if (activeSession !== sessionId) return;
        if (chunkIndex >= chunks.length) {
            releaseAudio();
            setState('idle', 'Đã đọc xong');
            return;
        }

        setState('loading', `Đang tạo giọng Việt (${chunkIndex + 1}/${chunks.length})`);
        requestController = new AbortController();
        try {
            const response = await fetch('/api/voice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: chunks[chunkIndex] }),
                signal: requestController.signal
            });
            if (!response.ok) throw new Error(`Voice API ${response.status}`);
            const audioBlob = await response.blob();
            if (activeSession !== sessionId) return;

            releaseAudio();
            objectUrl = URL.createObjectURL(audioBlob);
            audio.src = objectUrl;
            audio.playbackRate = Number(speedSelect.value);
            audio.onended = () => {
                chunkIndex += 1;
                playChunk(activeSession);
            };
            await audio.play();
            setState('playing', `Đang đọc bằng Hoài My (${chunkIndex + 1}/${chunks.length})`);
        } catch (error) {
            if (error.name === 'AbortError' || activeSession !== sessionId) return;
            console.warn('Azure Speech không khả dụng, chuyển sang giọng trình duyệt.', error);
            releaseAudio();
            useBrowserFallback(chunks.slice(chunkIndex).join(' '));
        } finally {
            requestController = null;
        }
    }

    function start() {
        const text = getArticleText();
        if (!text || /đang tải/i.test(text)) {
            setState('idle', 'Nội dung chưa tải xong, vui lòng thử lại');
            return;
        }
        stop('');
        sessionId += 1;
        chunks = splitText(text);
        chunkIndex = 0;
        playChunk(sessionId);
    }

    playButton.addEventListener('click', () => {
        if (state === 'playing') {
            if (!audio.paused && audio.src) audio.pause();
            else if (browserSpeech) browserSpeech.pause();
            setState('paused', 'Đã tạm dừng');
        } else if (state === 'paused') {
            if (audio.src) audio.play();
            else if (browserSpeech) browserSpeech.resume();
            setState('playing', 'Đang đọc');
        } else if (state !== 'loading') {
            start();
        }
    });
    stopButton.addEventListener('click', () => stop());
    speedSelect.addEventListener('change', () => {
        audio.playbackRate = Number(speedSelect.value);
    });
    window.addEventListener('azure-voice:read', event => {
        const text = event.detail && typeof event.detail.text === 'string'
            ? event.detail.text.replace(/\s+/g, ' ').trim()
            : '';
        if (!text) return;
        stop('');
        sessionId += 1;
        chunks = splitText(text);
        chunkIndex = 0;
        playChunk(sessionId);
        reader.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    window.addEventListener('pagehide', () => stop(''));
})();
