import React, { useEffect, useCallback, RefObject, memo } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import PushPinIcon from '@mui/icons-material/PushPin';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import './Header.scss';

const { ipcRenderer } = window.api;

interface Props {
  settings: Settings;
  searchFieldRef: RefObject<HTMLInputElement>;
}

const { store } = window.api;

const HeaderComponent: React.FC<Props> = memo(({ 
  settings,
  searchFieldRef
}) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const isSearchFocused = document.activeElement === searchFieldRef.current;
      if ((event.metaKey || event.ctrlKey) && !event.shiftKey && event.key === 'f' && settings.isSearchOpen && !isSearchFocused) {
        event.preventDefault();
        searchFieldRef.current?.focus();
      }
    },
    [settings.isSearchOpen, searchFieldRef]
  );

  useEffect(() => {
    const handleDocumentKeyDown = (event: KeyboardEvent) => handleKeyDown(event);
    document.addEventListener('keydown', handleDocumentKeyDown);

    return () => {
      document.removeEventListener('keydown', handleDocumentKeyDown);
    };
  }, [handleKeyDown]);

  return (settings.showFileTabs &&
    <div id='ToolBar'>
      {settings.files?.length > 0 && (
        <RestartAltIcon 
          onClick={() => ipcRenderer.send('uncheckAllTodos')}
        />
      )}
      <SearchIcon 
        onClick={() => store.setConfig('isSearchOpen', !settings.isSearchOpen)}
        className={settings.isSearchOpen ? 'active' : ''}
        data-testid={"header-search-icon"}
      />
      <PushPinIcon 
        onClick={() => ipcRenderer.send('processOnTop')}
        className={'isOnTop' + (settings.isOnTop ? ' active' : '')}
      />
    </div>
  );
});

export default HeaderComponent;