/// <reference types="google.maps" />
import { Loader } from '@googlemaps/js-api-loader';

const loader = new Loader({
  apiKey: 'AIzaSyDUCJi-4pQo8kxOzJMtmrn4sVasOMN3jhI',
  version: 'weekly',
  libraries: ['places'],
});

export async function loadPlaces() {
  await loader.load();
  return (window as any).google as typeof google;
}
