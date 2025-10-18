import { useState, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';

// Heroicons list (manually curated subset for performance)
const heroIconNames = [
  'HomeIcon', 'UserIcon', 'CogIcon', 'BellIcon', 'ChatBubbleLeftIcon',
  'EnvelopeIcon', 'PhoneIcon', 'MapPinIcon', 'CalendarIcon', 'ClockIcon',
  'HeartIcon', 'StarIcon', 'CheckIcon', 'XMarkIcon', 'PlusIcon',
  'MinusIcon', 'ArrowRightIcon', 'ArrowLeftIcon', 'ArrowUpIcon', 'ArrowDownIcon',
  'MagnifyingGlassIcon', 'ShoppingCartIcon', 'ShoppingBagIcon', 'CreditCardIcon', 'BanknotesIcon',
  'DocumentIcon', 'FolderIcon', 'PaperClipIcon', 'PhotoIcon', 'VideoCameraIcon',
  'MusicalNoteIcon', 'MicrophoneIcon', 'SpeakerWaveIcon', 'CameraIcon', 'FilmIcon',
  'PencilIcon', 'TrashIcon', 'ArchiveBoxIcon', 'InboxIcon', 'PaperAirplaneIcon',
  'BookOpenIcon', 'NewspaperIcon', 'AcademicCapIcon', 'BeakerIcon', 'LightBulbIcon',
  'FireIcon', 'BoltIcon', 'SunIcon', 'MoonIcon', 'CloudIcon',
  'GlobeAltIcon', 'LinkIcon', 'LockClosedIcon', 'LockOpenIcon', 'KeyIcon',
  'ShieldCheckIcon', 'UserGroupIcon', 'UsersIcon', 'UserPlusIcon', 'UserMinusIcon',
  'BuildingOfficeIcon', 'BuildingStorefrontIcon', 'HomeModernIcon', 'TruckIcon', 'RocketLaunchIcon',
];

export default function IconPicker({ value = {}, onChange }) {
  const [library, setLibrary] = useState(value.iconLibrary || 'lucide');
  const [search, setSearch] = useState('');
  const [heroIcons, setHeroIcons] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const iconsPerPage = 60; // 6 columns × 10 rows

  // Dynamically import hero icons when needed
  useEffect(() => {
    if (library === 'heroicons' && Object.keys(heroIcons).length === 0) {
      import('@heroicons/react/24/outline').then(module => {
        setHeroIcons(module);
      });
    }
  }, [library, heroIcons]);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);
  
  // Fix Lucide icon filtering - exclude internal functions
  const lucideIconNames = Object.keys(LucideIcons).filter(name => {
    const item = LucideIcons[name];
    return (
      typeof item === 'function' &&
      name !== 'createLucideIcon' &&
      name !== 'default' &&
      !name.startsWith('_') &&
      // Ensure it's actually a component (has displayName or is a valid React component)
      item.length !== undefined
    );
  });

  const filteredHeroIcons = search 
    ? heroIconNames.filter(name => name.toLowerCase().includes(search.toLowerCase()))
    : heroIconNames;

  const filteredLucideIcons = search
    ? lucideIconNames.filter(name => name.toLowerCase().includes(search.toLowerCase()))
    : lucideIconNames;

  // Pagination calculations
  const startIdx = (currentPage - 1) * iconsPerPage;
  const endIdx = startIdx + iconsPerPage;
  const totalPages = Math.ceil(filteredLucideIcons.length / iconsPerPage);

  const handleIconSelect = (iconName) => {
    onChange({
      ...value,
      iconLibrary: library,
      iconName,
      customSvg: null,
    });
  };

  const handleSvgUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = (event) => {
        onChange({
          ...value,
          iconLibrary: 'custom',
          iconName: null,
          customSvg: event.target.result,
        });
      };
      reader.readAsText(file);
    } else {
      alert('Please upload a valid SVG file');
    }
  };

  return (
    <div className="icon-picker">
      <div className="form-control mb-4">
        <label className="label">
          <span className="label-text font-semibold">Icon Library</span>
        </label>
        <div className="tabs tabs-boxed">
          <button
            type="button"
            className={`tab ${library === 'heroicons' ? 'tab-active' : ''}`}
            onClick={() => setLibrary('heroicons')}
          >
            Heroicons
          </button>
          <button
            type="button"
            className={`tab ${library === 'lucide' ? 'tab-active' : ''}`}
            onClick={() => setLibrary('lucide')}
          >
            Lucide
          </button>
          <button
            type="button"
            className={`tab ${library === 'custom' ? 'tab-active' : ''}`}
            onClick={() => setLibrary('custom')}
          >
            Custom SVG
          </button>
        </div>
      </div>

      {library === 'custom' ? (
        <div className="form-control">
          <label className="label">
            <span className="label-text">Upload SVG File</span>
          </label>
          <input
            type="file"
            accept=".svg,image/svg+xml"
            onChange={handleSvgUpload}
            className="file-input file-input-bordered file-input-sm w-full"
          />
          {value.customSvg && (
            <div className="mt-4 p-4 border border-base-300 rounded-lg">
              <p className="text-sm mb-2">Preview:</p>
              <div
                className="w-12 h-12"
                dangerouslySetInnerHTML={{ __html: value.customSvg }}
              />
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="form-control mb-3">
            <input
              type="search"
              placeholder="Search icons..."
              className="input input-bordered input-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="h-64 overflow-y-auto border border-base-300 rounded-lg p-2">
            {library === 'heroicons' ? (
              <div className="grid grid-cols-6 gap-2">
                {Object.keys(heroIcons).length > 0 ? (
                  filteredHeroIcons.slice(0, 50).map((iconName) => {
                    const IconComponent = heroIcons[iconName];
                    if (!IconComponent) return null;
                    return (
                      <button
                        key={iconName}
                        type="button"
                        className={`btn btn-sm btn-square ${
                          value.iconName === iconName ? 'btn-primary' : 'btn-ghost'
                        }`}
                        onClick={() => handleIconSelect(iconName)}
                        title={iconName}
                      >
                        <IconComponent className="w-5 h-5" />
                      </button>
                    );
                  })
                ) : (
                  <div className="col-span-6 text-center py-4 text-gray-500">
                    Loading icons...
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-6 gap-2">
                {filteredLucideIcons.slice(startIdx, endIdx).map((iconName) => {
                  const IconComponent = LucideIcons[iconName];
                  return (
                    <button
                      key={iconName}
                      type="button"
                      className={`btn btn-sm btn-square ${
                        value.iconName === iconName ? 'btn-primary' : 'btn-ghost'
                      }`}
                      onClick={() => handleIconSelect(iconName)}
                      title={iconName}
                    >
                      <IconComponent className="w-5 h-5" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {library === 'heroicons' && (
            <p className="text-xs text-gray-500 mt-2">
              Showing {Math.min(filteredHeroIcons.length, 50)} of {filteredHeroIcons.length} curated icons
            </p>
          )}
          {library === 'lucide' && (
            <>
              <p className="text-xs text-gray-500 mt-2">
                Showing {startIdx + 1}-{Math.min(endIdx, filteredLucideIcons.length)} of {filteredLucideIcons.length} icons
              </p>
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-2">
                  <button
                    type="button"
                    className="btn btn-xs"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                  >
                    ← Prev
                  </button>
                  <span className="text-xs font-semibold">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    type="button"
                    className="btn btn-xs"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => p + 1)}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {value.iconName && (
        <div className="mt-4">
          <p className="text-sm font-semibold mb-1">Selected Icon:</p>
          <div className="badge badge-primary">{value.iconName}</div>
        </div>
      )}
    </div>
  );
}

