import { localStorageStore } from 'fractils';

export const sidebarVisible = localStorageStore('sidebarVisible', true);
export const darkMode = localStorageStore('darkMode', true);

export const filters = ["What's Hot", 'Top', 'New', 'Controversial', 'Rising'];

export let pinnedSubs = localStorageStore('pinnedSubs', JSON.stringify([{ name: 'all' }]));
