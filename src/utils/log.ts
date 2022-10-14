// tslint:disable no-console

import { IS_NODE_CONTEXT } from './constants';

export const log = (message: string, onlyNodeContext = true) => {
  if (onlyNodeContext) {
    if (IS_NODE_CONTEXT) console.log(message);
  } else {
    console.log(message);
  }
};

export const error = (message: string, onlyNodeContext = true) => {
  if (onlyNodeContext) {
    if (IS_NODE_CONTEXT) console.error(message);
  } else {
    console.error(message);
  }
};

export const warn = (message: string, onlyNodeContext = true) => {
  if (onlyNodeContext) {
    if (IS_NODE_CONTEXT) console.warn(message);
  } else {
    console.warn(message);
  }
};
