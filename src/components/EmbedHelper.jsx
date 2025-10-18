import { useState, useEffect } from 'react';

export function EmbedHelper({ value = {}, onChange }) {
  const [mode, setMode] = useState('url');
  const [urlInput, setUrlInput] = useState('');
  const [codeInput, setCodeInput] = useState(value.embedCode || '');

  useEffect(() => {
    if (value.url) {
      setUrlInput(value.url);
    }
  }, [value.url]);

  function convertToYouTubeEmbed(url) {
    // Extract video ID from various YouTube URL formats
    let videoId = '';
    
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1]?.split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    } else if (url.includes('youtube.com/embed/')) {
      videoId = url.split('embed/')[1]?.split('?')[0];
    }

    if (videoId) {
      return `<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    }
    return null;
  }

  function convertToMapsEmbed(url) {
    // Try to extract coordinates or place ID
    if (url.includes('maps.google.com') || url.includes('google.com/maps')) {
      // Simple approach: wrap the URL in an iframe
      return `<iframe src="${url}" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>`;
    }
    return null;
  }

  function autoDetectEmbed(input) {
    if (input.includes('youtube.com') || input.includes('youtu.be')) {
      const code = convertToYouTubeEmbed(input);
      if (code) {
        return { type: 'youtube', code, url: input };
      }
    } else if (input.includes('maps.google.com') || input.includes('google.com/maps')) {
      const code = convertToMapsEmbed(input);
      if (code) {
        return { type: 'maps', code, url: input };
      }
    } else if (input.startsWith('<iframe') || input.startsWith('<embed')) {
      return { type: 'custom', code: input, url: '' };
    }
    return null;
  }

  const handleUrlChange = (input) => {
    setUrlInput(input);
    const detected = autoDetectEmbed(input);
    if (detected) {
      onChange({
        embedType: detected.type,
        embedCode: detected.code,
        url: detected.url,
      });
    }
  };

  const handleCodeChange = (input) => {
    setCodeInput(input);
    onChange({
      embedType: 'custom',
      embedCode: input,
      url: '',
    });
  };

  return (
    <div className="embed-helper">
      <div className="form-control mb-4">
        <label className="label">
          <span className="label-text font-semibold">Embed Source</span>
        </label>
        <div className="btn-group w-full">
          <button
            type="button"
            className={`btn btn-sm flex-1 ${mode === 'url' ? 'btn-active' : ''}`}
            onClick={() => setMode('url')}
          >
            📎 Paste URL
          </button>
          <button
            type="button"
            className={`btn btn-sm flex-1 ${mode === 'code' ? 'btn-active' : ''}`}
            onClick={() => setMode('code')}
          >
            💻 Paste Code
          </button>
        </div>
      </div>

      {mode === 'url' ? (
        <div className="form-control">
          <label className="label">
            <span className="label-text">Video or Map URL</span>
          </label>
          <input
            type="url"
            className="input input-bordered"
            placeholder="https://youtube.com/watch?v=... or https://maps.google.com/..."
            value={urlInput}
            onChange={(e) => handleUrlChange(e.target.value)}
          />
          <label className="label">
            <span className="label-text-alt">Supports YouTube and Google Maps URLs</span>
          </label>
        </div>
      ) : (
        <div className="form-control">
          <label className="label">
            <span className="label-text">Embed Code</span>
          </label>
          <textarea
            className="textarea textarea-bordered font-mono text-xs"
            rows={6}
            placeholder="<iframe src='...'></iframe>"
            value={codeInput}
            onChange={(e) => handleCodeChange(e.target.value)}
          />
          <label className="label">
            <span className="label-text-alt">Paste iframe or embed code from any service</span>
          </label>
        </div>
      )}

      {value.embedCode && (
        <div className="mt-4">
          <label className="label">
            <span className="label-text font-semibold">Preview:</span>
          </label>
          <div className="border border-base-300 rounded-lg p-2 bg-gray-50 overflow-hidden">
            <div dangerouslySetInnerHTML={{ __html: value.embedCode }} />
          </div>
          {value.embedType && (
            <div className="mt-2">
              <span className="badge badge-info">{value.embedType}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

