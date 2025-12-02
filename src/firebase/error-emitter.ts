import { EventEmitter } from 'events';

// This is a global event emitter for Firebase errors.
// It allows us to decouple the error source from the error display.
export const errorEmitter = new EventEmitter();
