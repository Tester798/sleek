import fs from 'fs/promises';
import { shell } from 'electron';
import { ipcMain, app, IpcMainEvent, clipboard } from 'electron';
import { processDataRequest } from './ProcessDataRequest/ProcessDataRequest';
import { changeCompleteState } from './ProcessDataRequest/ChangeCompleteState';
import { writeTodoObjectToFile, removeLineFromFile } from './File/Write';
import { archiveTodos, handleRequestArchive } from './File/Archive';
import { config, filter, notifiedTodoObjectsStorage } from '../config';
import { addFile, setFile, removeFile, readFileContent } from './File/File';
import { getActiveFile } from './File/Active';
import { openFile, createFile } from './File/Dialog';
import { createTodoObject } from './ProcessDataRequest/CreateTodoObjects';
import { setOnTop } from '../main';

async function handleDataRequest(event: IpcMainEvent, searchString: string): Promise<void> {
  try {
    await processDataRequest(searchString)
  } catch(error: any) {
    console.error(error);
    event.reply('responseFromMainProcess', error);
  }
}

function handleUpdateAttributeFields(event: IpcMainEvent, index: number, string: string): void {
  try {
    const todoObject = createTodoObject(index, string);
    event.reply('updateAttributeFields', todoObject);
  } catch(error: any) {
    console.error(error);
    event.reply('responseFromMainProcess', error);
  }
}

function handleUpdateTodoObject(event: IpcMainEvent, index: number, string: string, attributeType: string, attributeValue: string): void {
 try {
    const todoObject = createTodoObject(index, string, attributeType, attributeValue);
    event.reply('updateTodoObject', todoObject);
  } catch(error: any) {
    console.error(error);
    event.reply('responseFromMainProcess', error);
  } 
}

async function handleWriteTodoToFile(event: IpcMainEvent, index: number, string: string, state: boolean, attributeType: string, attributeValue: string): Promise<void> {
  try {
    let todoObject;
    if(attributeType && attributeValue) {
      todoObject = createTodoObject(index, string, attributeType, attributeValue);
      if(!todoObject.string) return;
      const response = await writeTodoObjectToFile(index, todoObject.string);
      event.reply('writeTodoToFile', response);
      return;
    } else {
      let updatedString: string | null = string;
      if(state !== undefined && index >= 0) updatedString = await changeCompleteState(string, state)
      const response = await writeTodoObjectToFile(index, updatedString);
      event.reply('writeTodoToFile', response);
    }
  } catch(error: any) {
    console.error(error);
    event.reply('responseFromMainProcess', error);
  }
}

function handleStoreGetConfig(event: IpcMainEvent, value: string): void {
  try {
    event.returnValue = config.get(value);
  } catch (error: any) {
    console.error(error);
    event.reply('responseFromMainProcess', error);
  }
}

function handleStoreSetConfig(event: IpcMainEvent, key: string, value: any) {
  try {
    config.set(key, value);
    console.log(`Set ${key} to ${value}`);
  } catch (error: any) {
    console.error(error);
    event.reply('responseFromMainProcess', error);
  }
}

function handleStoreSetFilters(event: IpcMainEvent, key: string, value: any): void {
  try {
    filter.set(key, value);
  } catch (error: any) {
    console.error(error);
    event.reply('responseFromMainProcess', error);
  }
}

function handleStoreGetFilters(event: IpcMainEvent, value: string): void {
  try {
    event.returnValue = filter.get(value);
  } catch (error: any) {
    console.error(error);
    event.reply('responseFromMainProcess', error);
  }
}

function handleStoreSetNotifiedTodoObjects(event: IpcMainEvent, value: any): void {
  try {
    notifiedTodoObjectsStorage.set('notifiedTodoObjects', value);
  } catch (error: any) {
    console.error(error);
    event.reply('responseFromMainProcess', error);
  }
}

function handleSetFile(event: IpcMainEvent, index: number): void {
  try {
    setFile(index);
  } catch (error: any) {
    console.error(error);
    event.reply('responseFromMainProcess', error);
  }
}

function handleRemoveFile(event: IpcMainEvent, index: number): void {
  try {
    removeFile(index);
  } catch (error: any) {
    console.error(error);
    event.reply('responseFromMainProcess', error);
  }
}

function handleAddFile(event: IpcMainEvent, filePath: string): void {
  try {
    addFile(filePath, null);
  } catch (error: any) {
    console.error(error);
    event.reply('responseFromMainProcess', error);
  }
}

function handleDroppedFile(event: IpcMainEvent, filePath: string): void {
  try {
    addFile(filePath, null);
  } catch (error: any) {
    console.error(error);
    event.reply('responseFromMainProcess', error);
  }
}

function handleRevealInFileManager(event: IpcMainEvent, pathToReveal: string): void {
  try {
    shell.showItemInFolder(pathToReveal);
  } catch (error: any) {
    console.error(error);
    event.reply('responseFromMainProcess', error);
  }
}

async function handleOpenFile(event: IpcMainEvent, setDoneFile: boolean): Promise<void> {
  try {
    await openFile(setDoneFile);
  } catch (error: any) {
    console.error(error);
    event.reply('responseFromMainProcess', error);
  }
}

async function handleCreateFile(event: IpcMainEvent, setDoneFile: boolean): Promise<void> {
  try {
    await createFile(setDoneFile);
  } catch (error: any) {
    console.error(error);
    event.reply('responseFromMainProcess', error);
  }
}

async function handleRemoveLineFromFile(event: IpcMainEvent, index: number): Promise<void> {
  try {
    await removeLineFromFile(index);
  } catch (error: any) {
    console.error(error);
    event.reply('responseFromMainProcess', error);
  }
}

async function handleArchiveTodos(event: IpcMainEvent): Promise<void> {
  try {
    const archivingResult = await archiveTodos();
    event.reply('responseFromMainProcess', archivingResult);
  } catch (error: any) {
    console.error(error);
    event.reply('responseFromMainProcess', error);
  }
}

function handleSaveToClipboard(event: IpcMainEvent, string: string): void {
  try {
    clipboard.writeText(string);
    event.reply('responseFromMainProcess', 'Copied to clipboard: ' + string);
  } catch (error: any) {
    console.error(error);
    event.reply('responseFromMainProcess', error);
  }
}

async function handleOpenInBrowser(event: IpcMainEvent, url: string): Promise<void> {
  try {
    await shell?.openExternal(url);
  } catch (error: any) {
    console.error(error);
    event.reply('responseFromMainProcess', error);
  }
}

async function processOnTop(event: IpcMainEvent): Promise<void> {
  try {
    await setOnTop();
  } catch (error: any) {
    console.error(error);
    event.reply('responseFromMainProcess', error);
  }
}

async function uncheckAllTodos(event: IpcMainEvent): Promise<void> {
  try {
    const activeFile: FileObject | null = getActiveFile();
    if(!activeFile) {
      throw new Error('No active file');
    }
    const completeStrings = async (fileContent: string): string => {
      const arrayOfStrings = fileContent.split('\n');
      const completedArrayOfStrings = [];
      for (const str of arrayOfStrings) {
        completedArrayOfStrings.push(await changeCompleteState(str, false));
      }
      return completedArrayOfStrings.join('\n');
    };
    const fileContent: string | null = await readFileContent(activeFile.todoFilePath, activeFile.todoFileBookmark);
    if(fileContent) {
      await fs.writeFile(activeFile.todoFilePath, await completeStrings(fileContent), 'utf8');
    }
  } catch (error: any) {
    console.error(error);
    event.reply('responseFromMainProcess', error);
  }
}

function removeEventListeners(): void {
  ipcMain.off('storeGetConfig', handleStoreGetConfig);
  ipcMain.off('storeSetConfig', handleStoreSetConfig);
  ipcMain.off('storeSetFilters', handleStoreSetFilters);
  ipcMain.off('storeGetFilters', handleStoreGetFilters);
  ipcMain.off('storeSetNotifiedTodoObjects', handleStoreSetNotifiedTodoObjects);
  ipcMain.off('setFile', handleSetFile);
  ipcMain.off('removeFile', handleRemoveFile);
  ipcMain.off('openFile', handleOpenFile);
  ipcMain.off('createFile', handleCreateFile);
  ipcMain.off('updateAttributeFields', handleUpdateAttributeFields);
  ipcMain.off('openInBrowser', handleOpenInBrowser);
  ipcMain.off('requestData', handleDataRequest);
  ipcMain.off('writeTodoToFile', handleWriteTodoToFile);
  ipcMain.off('archiveTodos', handleArchiveTodos);
  ipcMain.off('addFile', handleAddFile);
  ipcMain.off('droppedFile', handleDroppedFile);
  ipcMain.off('saveToClipboard', handleSaveToClipboard);
  ipcMain.off('revealInFileManager', handleRevealInFileManager);
  ipcMain.off('removeLineFromFile', handleRemoveLineFromFile);
  ipcMain.off('updateTodoObject', handleUpdateTodoObject);
  ipcMain.off('processOnTop', processOnTop);
  ipcMain.off('uncheckAllTodos', uncheckAllTodos);
  ipcMain.off('requestArchive', handleRequestArchive);
}

app.on('before-quit', () => removeEventListeners);

ipcMain.on('storeGetConfig', handleStoreGetConfig);
ipcMain.on('storeSetConfig', handleStoreSetConfig);
ipcMain.on('storeSetFilters', handleStoreSetFilters);
ipcMain.on('storeGetFilters', handleStoreGetFilters);
ipcMain.on('storeSetNotifiedTodoObjects', handleStoreSetNotifiedTodoObjects);
ipcMain.on('setFile', handleSetFile);
ipcMain.on('removeFile', handleRemoveFile);
ipcMain.on('openFile', handleOpenFile);
ipcMain.on('createFile', handleCreateFile);
ipcMain.on('updateAttributeFields', handleUpdateAttributeFields);
ipcMain.on('openInBrowser', handleOpenInBrowser);
ipcMain.on('requestData', handleDataRequest);
ipcMain.on('writeTodoToFile', handleWriteTodoToFile);
ipcMain.on('archiveTodos', handleArchiveTodos);
ipcMain.on('addFile', handleAddFile);
ipcMain.on('droppedFile', handleDroppedFile);
ipcMain.on('saveToClipboard', handleSaveToClipboard);
ipcMain.on('revealInFileManager', handleRevealInFileManager);
ipcMain.on('removeLineFromFile', handleRemoveLineFromFile);
ipcMain.on('updateTodoObject', handleUpdateTodoObject);
ipcMain.on('processOnTop', processOnTop);
ipcMain.on('uncheckAllTodos', uncheckAllTodos);
ipcMain.on('requestArchive', handleRequestArchive);