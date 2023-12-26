import React, { useState, useEffect, memo } from 'react';
import { Tab, Tabs } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { withTranslation, WithTranslation } from 'react-i18next';
import './FileTabs.scss';
import { i18n } from '../Settings/LanguageSelector';

const { ipcRenderer } = window.api;

interface Props extends WithTranslation {
  settings: Settings;
  setContextMenuPosition: (position: { top: number; left: number }) => void;
  setContextMenuItems: (items: any[]) => void;
  t: typeof i18n.t;
}

const FileTabs: React.FC<Props> = memo(({
  settings,
  setContextMenuPosition,
  setContextMenuItems,
  t,
}) => {
  const handleContextMenu = (event: React.MouseEvent<HTMLDivElement, MouseEvent> | React.MouseEvent<SVGSVGElement, MouseEvent>, index: number) => {
    event.preventDefault();
    setContextMenuPosition({ top: event.clientY, left: event.clientX });
    setContextMenuItems([
      {
        id: 'changeDoneFilePath',
        label: t('fileTabs.changeLocation'),
        index: index,
        doneFilePath: settings.files[index].doneFilePath,
      },
      {
        id: 'revealInFileManager',
        label: t('fileTabs.revealFile'),
        pathToReveal: settings.files[index].todoFilePath,
      },
      {
        id: 'removeFile',
        headline: t('fileTabs.removeFileHeadline'),
        text: t('fileTabs.removeFileText'),
        label: t('fileTabs.removeFileLabel'),
        index: index,
      },
    ]);
  };

  const index = settings.files.findIndex((file) => file.active);
  const [fileTab, setFileTab] = useState<number>(index !== -1 ? index : 0);

  const handleChange = (_event: React.SyntheticEvent, index: number) => {
    if(index < 0 || index > 9) return false;
    setFileTab(index);
    ipcRenderer.send('setFile', index);
  };

  useEffect(() => {
    setFileTab(index !== -1 ? index : 0);
  }, [index]);

  return (
    <Tabs value={fileTab} id="fileTabs" onChange={handleChange}>
    {settings.files.map((file, index) => (
      file ? (
        <Tab
          key={index}
          label={file.todoFileName}
          tabIndex={0}
          onContextMenu={(event) => handleContextMenu(event, index)}
          icon={
            <MoreVertIcon
              onClick={(event) => {
                event.stopPropagation();
                handleContextMenu(event, index);
              }}
              role="button"
            />
          }
          className={file.active ? 'active-tab' : ''}
          value={index}
        />
      ) : null
    ))}
    </Tabs>
  );
});

export default withTranslation()(FileTabs);