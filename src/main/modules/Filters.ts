import { BrowserWindow } from 'electron';
import dayjs from 'dayjs';

interface Filter {
  value: any;
  exclude: boolean;
}

interface Filters {
  [key: string]: Filter[];
}

interface TodoObject {
  [key: string]: any;
}

interface Attributes {
  [key: string]: {
    [key: string]: number;
  };
}

function applyFilters(todoObjects: TodoObject[], filters: Filters): TodoObject[] {
  if (filters && Object.keys(filters).length > 0) {
    return todoObjects.filter((todo) => {
      return Object.entries(filters).every(([key, filterArray]) => {
        if (Array.isArray(filterArray) && filterArray.length === 0) {
          return true;
        }

        const attributeValues = todo[key];

        return filterArray.every(({ value, exclude }) => {
          if (
            attributeValues === undefined ||
            attributeValues === null ||
            (Array.isArray(attributeValues) && attributeValues.length === 0)
          ) {
            return exclude;
          }

          const valuesToCheck = Array.isArray(attributeValues) ? attributeValues : [attributeValues];
          const hasMatchingValue = valuesToCheck.some((attrValue) => {
            const isDate = dayjs(attrValue).isValid();
            const formattedAttrValue = isDate ? dayjs(attrValue).format('YYYY-MM-DD') : attrValue;
            return formattedAttrValue === value;
          });

          return exclude ? !hasMatchingValue : hasMatchingValue;
        });
      });
    });
  }

  return todoObjects;
}

function createAttributesObject(todoObjects: TodoObject[]): Attributes {
  const incrementCount = function(countObject: { [key: string]: number }, key: string | null): void {
    if (key !== null) {
      countObject[key] = (countObject[key] || 0) + 1;
    }
  }  
  const attributes: Attributes = {
    priority: {},
    projects: {},
    contexts: {},
    due: {},
    t: {},
    rec: {},
    pm: {},
    created: {},
    completed: {},
  };

  todoObjects.forEach((item) => {
    Object.keys(attributes).forEach((key) => {
      const value = item[key];

      if (Array.isArray(value)) {
        value.forEach((element) => {
          if (element !== null) {
            attributes[key][element] = (attributes[key][element] || 0) + 1;
          }
        });
      } else {
        incrementCount(attributes[key], value);
      }
      attributes[key] = Object.fromEntries(Object.entries(attributes[key]).sort(([a], [b]) => a.localeCompare(b)));
    });
  });

  return attributes;
}

export { createAttributesObject, applyFilters };
