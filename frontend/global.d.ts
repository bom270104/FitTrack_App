// Allow importing CSS and other static assets in TypeScript
declare module '*.css';
declare module '*.scss';
declare module '*.sass';
declare module '*.module.css';
declare module '*.module.scss';

declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.svg';

declare interface Window {
  __NEXT_DATA__?: any;
}
