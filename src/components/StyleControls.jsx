import { useState } from 'react';
import { HexColorPicker } from 'react-colorful';

export function ColorPicker({ label, value, onChange, showBrandColors = false, brandColors = [] }) {
  // brandColors can be passed as a prop for standalone usage
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div className="form-control">
      <label className="label">
        <span className="label-text font-semibold">{label}</span>
      </label>

      {showBrandColors && brandColors.length > 0 && (
        <div className="mb-2">
          <span className="text-xs text-gray-500 block mb-1">Brand Colors:</span>
          <div className="flex gap-2 flex-wrap">
            {brandColors.map((color, idx) => (
              <button
                key={idx}
                type="button"
                className="w-8 h-8 rounded border-2 border-gray-300 hover:border-primary transition-colors"
                style={{ backgroundColor: color }}
                onClick={() => onChange(color)}
                title={color}
              />
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 items-center">
        <input
          type="text"
          className="input input-bordered input-sm flex-1"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
        />
        <button
          type="button"
          className="btn btn-sm btn-square"
          onClick={() => setShowPicker(!showPicker)}
        >
          🎨
        </button>
      </div>

      {showPicker && (
        <div className="mt-2">
          <HexColorPicker color={value || '#000000'} onChange={onChange} />
        </div>
      )}
    </div>
  );
}

export function SpacingControl({ label, value, onChange, _property = 'padding' }) {
  const [mode, setMode] = useState('all'); // 'all' or 'individual'
  const [values, setValues] = useState({
    all: '0px',
    top: '0px',
    right: '0px',
    bottom: '0px',
    left: '0px',
    ...value
  });

  const presets = [
    { label: 'None', value: '0px' },
    { label: 'XS', value: '4px' },
    { label: 'SM', value: '8px' },
    { label: 'MD', value: '16px' },
    { label: 'LG', value: '24px' },
    { label: 'XL', value: '32px' },
  ];

  const handlePresetClick = (presetValue) => {
    if (mode === 'all') {
      setValues({ ...values, all: presetValue });
      onChange({ all: presetValue });
    }
  };

  const handleIndividualChange = (side, val) => {
    const newValues = { ...values, [side]: val };
    setValues(newValues);
    onChange(newValues);
  };

  return (
    <div className="form-control">
      <label className="label">
        <span className="label-text font-semibold">{label}</span>
      </label>

      <div className="btn-group btn-group-sm mb-2 w-full">
        <button
          type="button"
          className={`btn btn-sm flex-1 ${mode === 'all' ? 'btn-active' : ''}`}
          onClick={() => setMode('all')}
        >
          All
        </button>
        <button
          type="button"
          className={`btn btn-sm flex-1 ${mode === 'individual' ? 'btn-active' : ''}`}
          onClick={() => setMode('individual')}
        >
          Individual
        </button>
      </div>

      <div className="flex gap-1 mb-2 flex-wrap">
        {presets.map((preset) => (
          <button
            key={preset.value}
            type="button"
            className="btn btn-xs"
            onClick={() => handlePresetClick(preset.value)}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {mode === 'all' ? (
        <input
          type="text"
          className="input input-bordered input-sm w-full"
          value={values.all}
          onChange={(e) => {
            setValues({ ...values, all: e.target.value });
            onChange({ all: e.target.value });
          }}
          placeholder="16px"
        />
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="label label-text-alt">Top</label>
            <input
              type="text"
              className="input input-bordered input-sm w-full"
              value={values.top}
              onChange={(e) => handleIndividualChange('top', e.target.value)}
              placeholder="0px"
            />
          </div>
          <div>
            <label className="label label-text-alt">Right</label>
            <input
              type="text"
              className="input input-bordered input-sm w-full"
              value={values.right}
              onChange={(e) => handleIndividualChange('right', e.target.value)}
              placeholder="0px"
            />
          </div>
          <div>
            <label className="label label-text-alt">Bottom</label>
            <input
              type="text"
              className="input input-bordered input-sm w-full"
              value={values.bottom}
              onChange={(e) => handleIndividualChange('bottom', e.target.value)}
              placeholder="0px"
            />
          </div>
          <div>
            <label className="label label-text-alt">Left</label>
            <input
              type="text"
              className="input input-bordered input-sm w-full"
              value={values.left}
              onChange={(e) => handleIndividualChange('left', e.target.value)}
              placeholder="0px"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function TypographyControl({ value = {}, onChange }) {
  const fontSizes = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px', '48px'];
  const fontWeights = ['300', '400', '500', '600', '700', '800', '900'];
  const fontFamilies = ['inherit', 'sans-serif', 'serif', 'monospace'];

  return (
    <div className="form-control space-y-3">
      <label className="label">
        <span className="label-text font-semibold">Typography</span>
      </label>

      <div>
        <label className="label label-text-alt">Font Size</label>
        <select
          className="select select-bordered select-sm w-full"
          value={value.fontSize || '16px'}
          onChange={(e) => onChange({ ...value, fontSize: e.target.value })}
        >
          {fontSizes.map(size => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="label label-text-alt">Font Weight</label>
        <select
          className="select select-bordered select-sm w-full"
          value={value.fontWeight || '400'}
          onChange={(e) => onChange({ ...value, fontWeight: e.target.value })}
        >
          {fontWeights.map(weight => (
            <option key={weight} value={weight}>
              {weight} {weight === '400' && '(Normal)'} {weight === '700' && '(Bold)'}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label label-text-alt">Font Family</label>
        <select
          className="select select-bordered select-sm w-full"
          value={value.fontFamily || 'inherit'}
          onChange={(e) => onChange({ ...value, fontFamily: e.target.value })}
        >
          {fontFamilies.map(family => (
            <option key={family} value={family}>{family}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="label label-text-alt">Line Height</label>
        <input
          type="text"
          className="input input-bordered input-sm w-full"
          value={value.lineHeight || ''}
          onChange={(e) => onChange({ ...value, lineHeight: e.target.value })}
          placeholder="1.5 or 24px"
        />
      </div>

      <div>
        <label className="label label-text-alt">Letter Spacing</label>
        <input
          type="text"
          className="input input-bordered input-sm w-full"
          value={value.letterSpacing || ''}
          onChange={(e) => onChange({ ...value, letterSpacing: e.target.value })}
          placeholder="0px or 0.5px"
        />
      </div>
    </div>
  );
}

export function BorderControl({ value = {}, onChange }) {
  const borderStyles = ['none', 'solid', 'dashed', 'dotted', 'double'];

  return (
    <div className="form-control space-y-3">
      <label className="label">
        <span className="label-text font-semibold">Border</span>
      </label>

      <div>
        <label className="label label-text-alt">Width</label>
        <input
          type="text"
          className="input input-bordered input-sm w-full"
          value={value.borderWidth || ''}
          onChange={(e) => onChange({ ...value, borderWidth: e.target.value })}
          placeholder="1px"
        />
      </div>

      <div>
        <label className="label label-text-alt">Style</label>
        <select
          className="select select-bordered select-sm w-full"
          value={value.borderStyle || 'solid'}
          onChange={(e) => onChange({ ...value, borderStyle: e.target.value })}
        >
          {borderStyles.map(style => (
            <option key={style} value={style}>{style}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="label label-text-alt">Color</label>
        <input
          type="text"
          className="input input-bordered input-sm w-full"
          value={value.borderColor || ''}
          onChange={(e) => onChange({ ...value, borderColor: e.target.value })}
          placeholder="#000000"
        />
      </div>

      <div>
        <label className="label label-text-alt">Radius</label>
        <input
          type="text"
          className="input input-bordered input-sm w-full"
          value={value.borderRadius || ''}
          onChange={(e) => onChange({ ...value, borderRadius: e.target.value })}
          placeholder="4px or 50%"
        />
      </div>
    </div>
  );
}

export function ShadowControl({ value, onChange }) {
  const presets = [
    { label: 'None', value: 'none' },
    { label: 'SM', value: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' },
    { label: 'MD', value: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' },
    { label: 'LG', value: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' },
    { label: 'XL', value: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' },
    { label: '2XL', value: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' },
  ];

  return (
    <div className="form-control">
      <label className="label">
        <span className="label-text font-semibold">Box Shadow</span>
      </label>

      <div className="flex gap-1 mb-2 flex-wrap">
        {presets.map((preset) => (
          <button
            key={preset.label}
            type="button"
            className="btn btn-xs"
            onClick={() => onChange(preset.value)}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <textarea
        className="textarea textarea-bordered text-xs"
        rows={2}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0 4px 6px rgba(0, 0, 0, 0.1)"
      />
    </div>
  );
}

export function DisplayControl({ value = {}, onChange }) {
  const displayTypes = ['block', 'inline-block', 'flex', 'inline-flex', 'grid', 'inline-grid'];
  const flexDirections = ['row', 'row-reverse', 'column', 'column-reverse'];
  const justifyContent = ['flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly'];
  const alignItems = ['flex-start', 'center', 'flex-end', 'stretch', 'baseline'];

  const isFlex = value.display?.includes('flex');
  const isGrid = value.display?.includes('grid');

  return (
    <div className="form-control space-y-3">
      <label className="label">
        <span className="label-text font-semibold">Display & Layout</span>
      </label>

      <div>
        <label className="label label-text-alt">Display</label>
        <select
          className="select select-bordered select-sm w-full"
          value={value.display || 'block'}
          onChange={(e) => onChange({ ...value, display: e.target.value })}
        >
          {displayTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {isFlex && (
        <>
          <div>
            <label className="label label-text-alt">Flex Direction</label>
            <select
              className="select select-bordered select-sm w-full"
              value={value.flexDirection || 'row'}
              onChange={(e) => onChange({ ...value, flexDirection: e.target.value })}
            >
              {flexDirections.map(dir => (
                <option key={dir} value={dir}>{dir}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label label-text-alt">Justify Content</label>
            <select
              className="select select-bordered select-sm w-full"
              value={value.justifyContent || 'flex-start'}
              onChange={(e) => onChange({ ...value, justifyContent: e.target.value })}
            >
              {justifyContent.map(val => (
                <option key={val} value={val}>{val}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label label-text-alt">Align Items</label>
            <select
              className="select select-bordered select-sm w-full"
              value={value.alignItems || 'stretch'}
              onChange={(e) => onChange({ ...value, alignItems: e.target.value })}
            >
              {alignItems.map(val => (
                <option key={val} value={val}>{val}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label label-text-alt">Gap</label>
            <input
              type="text"
              className="input input-bordered input-sm w-full"
              value={value.gap || ''}
              onChange={(e) => onChange({ ...value, gap: e.target.value })}
              placeholder="8px or 1rem"
            />
          </div>
        </>
      )}

      {isGrid && (
        <>
          <div>
            <label className="label label-text-alt">Grid Template Columns</label>
            <input
              type="text"
              className="input input-bordered input-sm w-full"
              value={value.gridTemplateColumns || ''}
              onChange={(e) => onChange({ ...value, gridTemplateColumns: e.target.value })}
              placeholder="repeat(3, 1fr)"
            />
          </div>

          <div>
            <label className="label label-text-alt">Grid Gap</label>
            <input
              type="text"
              className="input input-bordered input-sm w-full"
              value={value.gap || ''}
              onChange={(e) => onChange({ ...value, gap: e.target.value })}
              placeholder="16px"
            />
          </div>
        </>
      )}
    </div>
  );
}

