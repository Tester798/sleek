import React, { useEffect, useState, useRef } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Snackbar, Alert } from '@mui/material';
import NavigationComponent from './Navigation';
import TodoDataGrid from './DataGrid';
import SplashScreen from './SplashScreen';
import FileTabs from './FileTabs';
import { darkTheme, lightTheme } from './Themes';
import DrawerComponent from './Drawer';
import Search from './Search';
import TodoDialog from './TodoDialog';
import ArchiveTodos from './ArchiveTodos';
import ToolBar from './ToolBar';
import './App.scss';

const ipcRenderer = window.electron.ipcRenderer;
const store = window.electron.store;

const App = () => {
  const [files, setFiles] = useState<string[]>(store.get('files') || null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(store.get('isDrawerOpen') || false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(store.get('isSearchOpen') || false);
  const [splashScreen, setSplashScreen] = useState<string | null>(null);
  const [drawerParameter, setDrawerParameter] = useState<string | null>();
  const [snackBarOpen, setSnackBarOpen] = useState<boolean>(false);
  const [fileTabs, setFileTabs] = useState<boolean>(true);
  const [snackBarContent, setSnackBarContent] = useState<string | null>(null);
  const [snackBarSeverity, setSnackBarSeverity] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [todoObject, setTodoObject] = useState(null);
  const [searchString, setSearchString] = useState(null);
  const [todoObjects, setTodoObjects] = useState<object>(null);
  const [headers, setHeaders] = useState<object>(null);
  const [filters, setFilters] = useState<object>({});
  const [attributes, setAttributes] = useState<object>({});
  const [textFieldValue, setTextFieldValue] = useState('');
  const [sorting, setSorting] = useState<string[]>(store.get('sorting') || null);
  const searchFieldRef = useRef(null);
  const [isNavigationHidden, setIsNavigationHidden] = useState<boolean>(store.get('isNavigationHidden') || false);
  const [colorTheme, setColorTheme] = useState<boolean>(store.get('colorTheme') || 'system');
  const [shouldUseDarkColors, setShouldUseDarkColors] = useState<boolean>(store.get('shouldUseDarkColors') || false);
  
  const responseHandler = function(response) {
    if (response instanceof Error) {
      setSnackBarSeverity('error');
      setSnackBarContent(response.message);
      setSnackBarOpen(true);
      console.error(response)
    } else {
      setDialogOpen(false);
      console.log(response)
    }
  }
  
  const handleRequestedData = (todoObjects: object, attributes: object, headers: object, filters: object) => {
    if(headers) setHeaders(headers);
    if(attributes) setAttributes(attributes);
    if(filters) setFilters(filters);
    if(todoObjects) setTodoObjects(todoObjects);
    setSplashScreen(null);
  };

  const handleUpdateFiles = (files: object) => {
    setFiles(files)
  };

  const handleUpdateSorting = (sorting: object) => {
    setSorting(sorting)
  };

  const handleSetIsSearchOpen = () => {
    setIsSearchOpen(prevIsSearchOpen => !prevIsSearchOpen);
  };

  const handleSetIsNavigationHidden = () => {
    setIsNavigationHidden(prevIsNavigationHidden => !prevIsNavigationHidden);
  };

  const handleSetShouldUseDarkColors = (shouldUseDarkColors: boolean) => {
    setShouldUseDarkColors(shouldUseDarkColors);
  };

  useEffect(() => {
    store.set('isNavigationHidden', isNavigationHidden)
  }, [isNavigationHidden]);

  useEffect(() => {
    if(!headers) return;
    if (headers.availableObjects === 0) {
      setSplashScreen('noTodosAvailable');
      setIsDrawerOpen(false);
    } else if (headers.visibleObjects === 0) {
      setSplashScreen('noTodosVisible');
    } else {
      setSplashScreen(null);
    }
  }, [headers]);

  useEffect(() => {
    if(files === null || files?.length === 0) {
      setTodoObjects(null);
      setHeaders(null);
      setSplashScreen('noFiles');
    } else {
      ipcRenderer.send('requestData');
    }
  }, [files]);

  useEffect(() => {
    store.set('sorting', sorting)
  }, [sorting]);

  useEffect(() => {
    store.set('isDrawerOpen', isDrawerOpen)
  }, [isDrawerOpen]);

  useEffect(() => {
    store.set('isSearchOpen', isSearchOpen)
  }, [isSearchOpen]);

  useEffect(() => {
    if(!snackBarContent) return;
    setSnackBarOpen(true);
  }, [snackBarContent]);

  useEffect(() => {
    if(!dialogOpen) {
      setTodoObject(null);
      setTextFieldValue('');
    }
  }, [dialogOpen]);

  useEffect(() => {
    ipcRenderer.on('writeTodoToFile', responseHandler);
    ipcRenderer.on('requestData', handleRequestedData);
    ipcRenderer.on('updateFiles', handleUpdateFiles);
    ipcRenderer.on('updateSorting', handleUpdateSorting);
    ipcRenderer.on('setIsSearchOpen', handleSetIsSearchOpen);
    ipcRenderer.on('setIsNavigationHidden', handleSetIsNavigationHidden);
    ipcRenderer.on('shouldUseDarkColors', handleSetShouldUseDarkColors);
  }, []);

  return (
    <ThemeProvider theme={shouldUseDarkColors ? darkTheme : lightTheme}>
      <CssBaseline />
      <div className={isNavigationHidden ? 'flexContainer hideNavigation' : 'flexContainer'}>
        <NavigationComponent
          isDrawerOpen={isDrawerOpen}
          setIsDrawerOpen={setIsDrawerOpen}
          drawerParameter={drawerParameter}
          setDrawerParameter={setDrawerParameter}
          setDialogOpen={setDialogOpen}
          files={files}
          headers={headers}
          isNavigationHidden={isNavigationHidden}
          setIsNavigationHidden={setIsNavigationHidden}
          colorTheme={colorTheme}
          setColorTheme={setColorTheme}
        />
        <DrawerComponent 
          isDrawerOpen={isDrawerOpen}
          setIsDrawerOpen={setIsDrawerOpen}
          drawerParameter={drawerParameter}
          attributes={attributes}
          filters={filters}
          sorting={sorting}
          setSorting={setSorting}
        />
        <div className="flexItems">
          <header>
            {isSearchOpen ? null : <FileTabs files={files} />}
            <Search
              headers={headers}
              searchString={searchString}
              setSearchString={setSearchString}
              isSearchOpen={isSearchOpen}
              setIsSearchOpen={setIsSearchOpen}
              searchFieldRef={searchFieldRef}
            />            
            <ToolBar
              isSearchOpen={isSearchOpen}
              setIsSearchOpen={setIsSearchOpen}
              headers={headers}
              searchFieldRef={searchFieldRef}
            />
          </header>
          <TodoDataGrid 
            todoObjects={todoObjects}
            setTodoObject={setTodoObject}
            attributes={attributes}
            filters={filters}
            setSnackBarSeverity={setSnackBarSeverity}
            setSnackBarContent={setSnackBarContent}
            setDialogOpen={setDialogOpen}
            setTextFieldValue={setTextFieldValue}
          />
          <SplashScreen 
            screen={splashScreen}
            setDialogOpen={setDialogOpen}
            setSearchString={setSearchString}
          />
        </div>
      </div>
      <TodoDialog
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        todoObject={todoObject}
        attributes={attributes}
        setSnackBarSeverity={setSnackBarSeverity}
        setSnackBarContent={setSnackBarContent}
        textFieldValue={textFieldValue}
        setTextFieldValue={setTextFieldValue}
      />
      <Snackbar 
        open={snackBarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackBarOpen(false)}
      >
        <Alert
          severity={snackBarSeverity}
          onClose={() => setSnackBarOpen(false)}
        >
          {snackBarContent}
        </Alert>
      </Snackbar>
      <ArchiveTodos />
    </ThemeProvider>
  );
};

export default App;